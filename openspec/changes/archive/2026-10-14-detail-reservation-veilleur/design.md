# Design — detail-reservation-veilleur

Conception légère (HOW) des trois chantiers décrits dans `proposal.md`/`tasks.md` (section "1.
Conception détaillée"). Stack : React 19 + Vite + Tailwind v4 + FullCalendar 6.1.21 + TanStack
Query, `apps/user-app` uniquement (sauf précision contraire).

Fichiers lus pour cette conception : `proposal.md`, `tasks.md`, `PageAgenda.tsx`,
`ReservationConfirmModal.tsx` (+ `ReservationCard.tsx`, `cancellationEligibility.ts`),
`packages/shared/src/types/planning.ts`, `packages/shared/src/ui/{Modal,fullcalendar-overrides.css}`,
`apps/admin-app/src/{hooks/useUserPhoto.ts,api/endpoints/users.ts,components/users/UserProfile.tsx}`
(+ `useUserPhoto.test.tsx`), `apps/user-app/src/api/endpoints/{users.ts,bookings.ts}`,
`apps/user-app/src/components/agenda/CalendrierReservations.tsx` (+ test),
`packages/shared/src/api/client.ts` (+ `client.test.ts`), `apps/user-app/src/api/client.ts`,
`openspec/specs/consultation-planning/spec.md`,
`openspec/changes/archive/2026-10-13-affichage-mobile-menu-agenda/design.md`.

---

## 1. Modales — `ReservationCard`, `ReservationConfirmModal`, `ReservationDetailModal` (nouveau)

### 1.1 `ReservationCard.tsx` — extension (prop photo)

```ts
export interface ReservationCardProps {
  dateDebut: string;
  dateFin: string;
  beneficiaireLabel: string;
  description?: string;
  photoUrl?: string; // URL objet (Blob) du bénéficiaire, cf. useUserPhoto — absente si pas de
                      // photo, erreur (403/404) ou chargement non terminé (dégradation silencieuse,
                      // voir §3). `undefined` ⇒ aucun bloc photo rendu, comportement inchangé.
}
```

Rendu : bloc photo (si `photoUrl` défini) **avant** la ligne "Début :", centré, même style que
`UserProfile.tsx` (admin-app) pour cohérence visuelle :

```tsx
{photoUrl && (
  <div className="flex justify-center">
    <img
      src={photoUrl}
      alt={`Photo de ${beneficiaireLabel}`}
      className="h-24 w-24 rounded-full object-cover"
    />
  </div>
)}
```

**Décision — pas d'indicateur de chargement (`Spinner`) pour la photo**, contrairement à
`UserProfile.tsx` (qui affiche un `Spinner` conditionné par `hasPhoto && isPhotoLoading`). Ici,
l'absence de signal `hasPhoto` côté `PlanningEntryResponse` (cf. §3) fait que l'appel est **toujours**
tenté, y compris pour une réservation qui n'a en réalité aucune photo — ce qui serait le cas le plus
fréquent. Afficher un spinner à chaque ouverture de modale pour un état qui se résout le plus souvent
en "pas de photo" produirait un effet de clignotement systématique peu utile. `ReservationCard` reste
donc un composant de présentation pur, sans connaissance du cycle de vie de la requête — il affiche ou
non le bloc selon la seule présence de `photoUrl`, exactement comme il gère déjà `description`
aujourd'hui.

### 1.2 `ReservationConfirmModal.tsx` — variant `cancel` uniquement

Le variant `create` n'est **pas modifié** (`proposal.md` ne mentionne la photo que pour le variant
`cancel`, où le bénéficiaire — soi-même — a une identité connue dès l'ouverture). Le variant `cancel`
appelle `useUserPhoto` lui-même (comme `UserProfile.tsx` appelle le hook directement plutôt que de le
recevoir en prop) et transmet le résultat à `ReservationCard` :

```tsx
const { isOpen, onClose, booking, isSubmitting, onConfirm } = props;
const eligible = canCancelBooking(booking.dateDebut);
const { data: photoUrl } = useUserPhoto(booking.idUtilisateur);
// ...
<ReservationCard
  dateDebut={booking.dateDebut}
  dateFin={booking.dateFin}
  beneficiaireLabel={`${booking.prenomsUtilisateur} ${booking.nomUtilisateur}`}
  description={booking.description}
  photoUrl={photoUrl}
/>
```

`booking.idUtilisateur` est déjà présent sur `PlanningEntryResponse` — ici il désigne toujours
l'utilisateur connecté lui-même (c'est la condition `isMine` qui a conduit `PageAgenda` à choisir ce
variant, cf. §2), mais le composant n'a pas besoin de le recalculer via `useAuth()` : il réutilise la
donnée déjà présente sur `booking`, cohérent avec le principe déjà en place dans ce fichier
("`isMine` déjà calculé... réutilisé tel quel, pas de second calcul client", `PageAgenda.tsx`).

### 1.3 `ReservationDetailModal.tsx` — nouveau composant

```ts
export interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: PlanningEntryResponse;
}

export function ReservationDetailModal({ isOpen, onClose, booking }: ReservationDetailModalProps) {
  const { data: photoUrl } = useUserPhoto(booking.idUtilisateur);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détail de la réservation"
      footer={
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <ReservationCard
        dateDebut={booking.dateDebut}
        dateFin={booking.dateFin}
        beneficiaireLabel={`${booking.prenomsUtilisateur} ${booking.nomUtilisateur}`}
        description={booking.description}
        photoUrl={photoUrl}
      />
    </Modal>
  );
}
```

Décisions :
- **Pas de nouveau composant de rendu** : réutilise `ReservationCard` tel qu'étendu en §1.1, exactement
  comme le demande `tasks.md` (1.1). Le corps de la modale est donc identique à celui du variant
  `cancel` de `ReservationConfirmModal`, seule la racine (`Modal`/footer) diffère.
- **Footer avec un seul bouton "Fermer"** (`variant="outline"`, même style que le bouton "Annuler" des
  deux variants existants) : `Modal` ne fournit aucune croix de fermeture native (vu en lecture de
  `Modal.tsx`) — sans ce bouton, la seule façon de fermer serait de cliquer sur l'overlay ou `Échap`
  (non géré par `Modal` non plus), ce qui serait un recul d'accessibilité. Ce bouton n'est **pas** une
  "action" au sens métier de `proposal.md` ("aucune action") — il ne déclenche aucune mutation, c'est
  un simple contrôle de fermeture au même titre que le clic sur l'overlay.
- **Pas de prop `isSubmitting`/`onConfirm`** : conforme à "lecture seule, sans action".

### 1.4 Impact fichiers (§1)

| Fichier | Statut |
|---|---|
| `apps/user-app/src/components/agenda/ReservationCard.tsx` (+ test) | modifié (prop `photoUrl`) |
| `apps/user-app/src/components/agenda/ReservationConfirmModal.tsx` (+ test) | modifié (variant `cancel` uniquement) |
| `apps/user-app/src/components/agenda/ReservationDetailModal.tsx` (+ test) | **nouveau** |

---

## 2. `PageAgenda.tsx` — double chemin de clic, nouvel état

### 2.1 Nouvel état

```ts
const [bookingToView, setBookingToView] = useState<PlanningEntryResponse | null>(null);
```

Nommage symétrique à `bookingToCancel` déjà en place — même forme (`PlanningEntryResponse | null`),
même origine (`entries.find(...)`, pas `visibleEntries`, cf. commentaire existant sur l'hypothèse
`PlanningEntryResponse.id === BookingResponse.id`).

### 2.2 `onEventClick` — branchement `isMine`

```ts
const onEventClick =
  role === UserRole.VEILLEUR
    ? (info: EventClickArg) => {
        const fullEntry = entries.find((candidate) => candidate.id === info.event.id);
        if (!fullEntry) {
          return;
        }
        const isMine = Boolean(info.event.extendedProps.isMine);
        if (isMine) {
          setBookingToCancel(fullEntry);
        } else {
          setBookingToView(fullEntry);
        }
      }
    : undefined;
```

Changement minimal par rapport à l'existant : le `if (!isMine) return;` précoce est remplacé par un
`if/else` qui route vers l'un ou l'autre état selon `isMine`, au lieu d'ignorer le clic. La résolution
de `fullEntry` est faite une seule fois, avant la bifurcation (évite un double `.find` sur les deux
branches).

### 2.3 `closeAll()` — étendu

```ts
function closeAll(): void {
  setSelectedSlot(null);
  setPendingCreateDto(null);
  setBookingToCancel(null);
  setBookingToView(null);
}
```

### 2.4 Rendu — nouveau bloc conditionnel

```tsx
{bookingToView && (
  <ReservationDetailModal isOpen onClose={closeAll} booking={bookingToView} />
)}
```

Ajouté après le bloc `{bookingToCancel && (...)}` existant, même style d'écriture.

### 2.5 Pourquoi aucune collision d'état n'est possible (réponse à tasks.md 1.1)

Quatre états nullable coexistent désormais (`selectedSlot`+`pendingCreateDto`, `bookingToCancel`,
`bookingToView`), rendant potentiellement jusqu'à trois blocs `<Modal>`/`<ReservationForm>`. Deux
garanties, déjà en vigueur pour les trois premiers états et étendues sans changement de nature au
quatrième :

1. **Les déclencheurs sont mutuellement exclusifs.** `onSelectSlot` (drag-select sur une plage vide de
   la grille) et `onEventClick` (clic sur un événement déjà rendu) sont deux callbacks FullCalendar
   distincts qui ne peuvent pas se déclencher pour la même interaction utilisateur — on ne peut pas à
   la fois sélectionner une plage et cliquer un événement existant en un seul geste. À l'intérieur
   d'`onEventClick`, le `if/else` sur `isMine` garantit qu'**un seul** des deux setters
   (`setBookingToCancel`/`setBookingToView`) est appelé par clic.
2. **`Modal` bloque l'interaction avec le calendrier sous-jacent pendant qu'il est ouvert** (overlay
   `fixed inset-0 z-50` couvrant tout le viewport, vu en lecture de `Modal.tsx`) — un utilisateur ne
   peut donc pas cliquer un second événement ou glisser une seconde sélection tant qu'une modale/le
   formulaire de création est déjà affiché à l'écran, ce qui empêche structurellement d'atteindre un
   second `setState` avant que `closeAll()` (appelé par tous les chemins de fermeture/confirmation
   existants) n'ait remis les quatre états à `null`.

Aucune garantie au niveau du *type* (ex. union discriminée unique regroupant les quatre états) n'est
introduite : c'est le même niveau de rigueur que l'existant (`bookingToCancel` et `pendingCreateDto`
coexistent déjà selon cette même discipline, sans jamais avoir eu besoin d'être fusionnés) — cohérent
avec le principe de ne pas sur-ingénierer au-delà de ce que `proposal.md` demande.

### 2.6 Impact fichiers (§2)

| Fichier | Statut |
|---|---|
| `apps/user-app/src/pages/PageAgenda.tsx` (+ test) | modifié (`onEventClick`, nouvel état, `closeAll`, rendu) |

---

## 3. Photo utilisateur côté user-app — `getUserPhoto`/`useUserPhoto`

### 3.1 `apps/user-app/src/api/endpoints/users.ts` — `getUserPhoto`

Fichier déjà existant (contient `updateUser`) :

```ts
/**
 * GET /users/{id}/photo — contenu binaire (image/jpeg|png). Tenté SYSTÉMATIQUEMENT pour
 * toute réservation affichée en modale : contrairement à `UserResponse.photo` (admin-app),
 * `PlanningEntryResponse` ne porte aucun indicateur de présence de photo permettant de
 * court-circuiter l'appel (cf. `useUserPhoto`).
 *
 * `skipForbiddenRedirect: true` (cf. `packages/shared/src/api/client.ts`) — DIFFÉRENCE
 * CRITIQUE avec `getUserPhoto` côté admin-app (qui ne passe pas cette option) : un Veilleur
 * consultant la photo d'un AUTRE Veilleur peut recevoir un 403 selon l'autorisation backend
 * réelle (cf. proposal.md, "Point de vigilance backend" — `GET /users/{id}/photo` est
 * documenté comme réservé au titulaire ou à un administrateur). Sans cette option, le hook
 * `onForbidden` de `apps/user-app/src/api/client.ts` redirige TOUTE l'application vers
 * `/non-autorise` (`navigate("/non-autorise", { replace: true })`) — un simple clic sur la
 * réservation d'un collègue éjecterait l'utilisateur de `/agenda`. Avec cette option, le 403
 * se traduit uniquement par l'absence du bloc photo dans la modale (dégradation silencieuse),
 * même raisonnement que `createBooking`/`cancelBooking` (`bookings.ts`, même fichier de
 * référence).
 */
export function getUserPhoto(id: string): Promise<Blob> {
  return apiClient.getBlob(`/users/${id}/photo`, { skipForbiddenRedirect: true });
}
```

### 3.2 `apps/user-app/src/hooks/useUserPhoto.ts` — nouveau

```ts
import { useEffect, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getUserPhoto } from "../api/endpoints/users";

/**
 * Miroir de `apps/admin-app/src/hooks/useUserPhoto.ts` pour la gestion de l'URL objet
 * (cache du `Blob`, jamais de l'URL ; création/révocation en `useEffect` à chaque
 * changement de référence du `Blob` — voir le commentaire original pour le détail du
 * raisonnement, notamment le piège "revisite A→B→A").
 *
 * Deux différences volontaires avec la version admin-app :
 * 1. Pas de paramètre `hasPhoto`/`enabled` : `PlanningEntryResponse` ne porte aucun
 *    indicateur de présence de photo (contrairement à `UserResponse.photo`), donc rien ne
 *    permet de décider à l'avance s'il faut appeler l'API — l'appel est toujours tenté.
 * 2. `retry: false` : un 404 (pas de photo) est ici une issue COURANTE, pas une anomalie
 *    réseau transitoire (à la différence de l'appel admin-app, gardé par `hasPhoto` donc
 *    sensé réussir) — retenter 3 fois une absence de photo attendue serait un gaspillage
 *    réseau systématique. Un 403 (cf. `getUserPhoto`, "Point de vigilance backend") n'est pas
 *    plus retenté non plus : un nouvel essai échouerait identiquement.
 *
 * Dégradation silencieuse : ce hook ne lit/n'expose jamais `query.error` à ses appelants de
 * façon particulière — `query.isError` est bien calculé par `useQuery` (toujours accessible
 * via les champs spreadés de `UseQueryResult` si un futur appelant en avait besoin), mais
 * aucun composant de cette proposition (`ReservationCard`, `ReservationConfirmModal`,
 * `ReservationDetailModal`) ne le lit : en cas d'erreur, `query.data` reste `undefined`,
 * donc `photoUrl` aussi — le bloc photo est simplement absent, sans message d'erreur, par
 * construction plutôt que par un `catch` explicite.
 */
export function useUserPhoto(
  userId: string,
): Omit<UseQueryResult<Blob>, "data"> & { data: string | undefined } {
  const query = useQuery({
    queryKey: ["users", "photo", userId],
    queryFn: () => getUserPhoto(userId),
    retry: false,
  });

  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!query.data) {
      setPhotoUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(query.data);
    setPhotoUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [query.data]);

  return { ...query, data: photoUrl };
}
```

### 3.3 Impact fichiers (§3)

| Fichier | Statut |
|---|---|
| `apps/user-app/src/api/endpoints/users.ts` (+ test) | modifié (ajout `getUserPhoto`) |
| `apps/user-app/src/hooks/useUserPhoto.ts` (nouveau, + test) | **nouveau** |

---

## 4. CSS — extension du cadre doré aux vues Jour/Semaine (scope `user-app` uniquement)

### 4.1 Constat : le fichier partagé n'a aujourd'hui aucun mécanisme de scope "une seule app" pour une règle basée sur la classe de VUE

Vérification faite (`apps/admin-app/src/index.css` et `apps/user-app/src/index.css`) : les deux apps
importent `fullcalendar-overrides.css` **à l'identique** (même chemin, même ligne). La règle de vue
Mois existante (`.fc-dayGridMonth-view .fc-event`) s'applique d'ailleurs **déjà aux deux apps**, et
c'est documenté comme intentionnel (`consultation-planning/spec.md`, section "Surlignage de tous les
créneaux réservés en vue Mois (`user-app` et `admin-app`)"). Le seul scope "user-app uniquement" déjà
en place dans ce fichier (`.planning-event--mine`) ne repose **pas** sur l'import du fichier CSS
(partagé) mais sur le fait que la classe marqueur `planning-event--mine` n'est **jamais posée côté
JS** par `admin-app` (`isMine` y est toujours `false`).

Or, `admin-app` possède aussi des vues Jour/Semaine (`CalendrierPlanningAdmin.tsx`,
`CalendrierPlanningAdmin.test.tsx` vérifie explicitement `.fc-timeGridDay-view`/
`.fc-timeGridWeek-view`) — les classes de vue FullCalendar elles-mêmes sont **identiques** dans les
deux apps. Un simple ajout de `.fc-timeGridDay-view .fc-event { ... }` dans le fichier partagé
s'appliquerait donc **aussi à `admin-app`**, ce qui contredit explicitement `proposal.md` ("admin-app
n'est pas concerné"). `tasks.md` (2.1) ne liste que ce fichier CSS comme impacté — c'est insuffisant en
l'état, d'où la nécessité de trancher ce point ici (tasks.md 1.2).

### 4.2 Décision : classe marqueur posée côté `CalendrierReservations.tsx` (user-app), même idiome que `.planning-event--mine`

Plutôt qu'un nouveau fichier CSS + une nouvelle ligne d'import par app (solution alternative envisagée
mais écartée — elle introduit un second fichier et une seconde ligne d'`@import` pour un gain de
clarté marginal par rapport à l'option retenue), le scope est obtenu en réutilisant **exactement** le
mécanisme déjà en place pour `.planning-event--mine` : une classe marqueur posée uniquement par le
code React de l'app concernée, combinée en CSS avec les classes natives de FullCalendar.

**Changement 1 — `apps/user-app/src/components/agenda/CalendrierReservations.tsx`** (une ligne) :

```diff
- <div className="flex flex-col gap-4">
+ <div className="flex flex-col gap-4 user-agenda-calendar">
```

Ce conteneur englobe le `<FullCalendar>` (donc tous ses descendants, y compris les conteneurs de vue
`.fc-timeGridDay-view`/`.fc-timeGridWeek-view`/`.fc-listWeek-view` qu'il pose lui-même). Cette classe
n'existe **nulle part côté `admin-app`** (`CalendrierPlanningAdmin.tsx` n'est pas modifié) — le scope
est donc garanti structurellement, pas seulement par convention.

**Changement 2 — `packages/shared/src/ui/fullcalendar-overrides.css`** (ajout, à la suite de la règle
Mois existante) :

```css
/* Extension du cadre doré (déjà appliqué en vue Mois, pour les deux apps, ci-dessus) aux
   vues Jour et Semaine (desktop + mobile) — `user-app` UNIQUEMENT (cf. proposition
   `detail-reservation-veilleur`). Les classes de vue FullCalendar elles-mêmes
   (`.fc-timeGridDay-view`, `.fc-timeGridWeek-view`, `.fc-listWeek-view`) sont IDENTIQUES
   dans les deux apps (`admin-app` a aussi des vues Jour/Semaine, cf.
   `CalendrierPlanningAdmin.tsx`) : les cibler seules appliquerait aussi la règle côté
   admin-app. Le scope "user-app uniquement" est donc obtenu via la classe marqueur
   `.user-agenda-calendar`, posée uniquement sur le conteneur racine de
   `apps/user-app/src/components/agenda/CalendrierReservations.tsx` (jamais côté
   admin-app) — même idiome que `.planning-event--mine` ci-dessus (classe posée côté React,
   combinée en CSS avec les classes natives de FullCalendar), plutôt qu'un fichier CSS
   séparé. `.fc-event` (pas `.fc-list-event`) suffit même en vue liste : la vue `listWeek`
   pose déjà `.fc-event` sur ses lignes (confirmé par le comportement existant de
   `.planning-event--mine`, documenté comme "non scopé par vue, s'applique normalement" y
   compris en Mode Semaine mobile, cf. `consultation-planning/spec.md`). */
.user-agenda-calendar .fc-timeGridDay-view .fc-event,
.user-agenda-calendar .fc-timeGridWeek-view .fc-event,
.user-agenda-calendar .fc-listWeek-view .fc-event {
  background-color: var(--color-gold-100);
  border: 1px solid var(--color-gold-400);
  border-radius: 4px;
}
```

Le badge/texte "Ma réservation" n'est pas modifié : en vue Jour/Semaine, un créneau qui est à la fois
"Ma réservation" et couvert par cette nouvelle règle cumule les deux règles CSS (mêmes déclarations,
pas de conflit visuel, même raisonnement que le cumul déjà documenté en vue Mois).

### 4.3 Addendum à `tasks.md`

Les tasks 2.1 ("implémentation CSS") et 3.6 ("tests CSS") listées dans `tasks.md` ne mentionnent que
`fullcalendar-overrides.css` — à la lumière de ce qui précède, l'implémentation touche en réalité
**deux** fichiers (le CSS + la ligne de classe marqueur dans `CalendrierReservations.tsx`). À signaler
à l'api-developer/test-engineer lors du passage de relais (pas de changement de `tasks.md` fait ici,
cette conception reste en lecture seule sur le code).

### 4.4 Impact fichiers (§4)

| Fichier | Statut |
|---|---|
| `packages/shared/src/ui/fullcalendar-overrides.css` | modifié (nouvelle règle, scope via classe marqueur) |
| `apps/user-app/src/components/agenda/CalendrierReservations.tsx` (+ test) | modifié (ajout `.user-agenda-calendar` sur le conteneur racine) |
| `apps/admin-app/*` | **aucun changement** |

---

## 5. Points ouverts

[Question]: Autorisation backend `GET /users/{id}/photo` pour un Veilleur consultant la photo d'un
**autre** Veilleur (cf. "Point de vigilance backend", `proposal.md`). Cette conception neutralise déjà
le risque UX principal (`skipForbiddenRedirect: true`, §3.1) : en cas de 403, la modale de détail
affichera simplement le nom sans photo, sans jamais rediriger/casser `/agenda`. Reste à confirmer côté
backend si le 403 est l'issue réelle ou si l'autorisation sera élargie — n'affecte pas la conception
ci-dessus, seulement le résultat visuel final pour les réservations d'autrui (déjà traité comme
limitation connue possible par `proposal.md`).
[Réponse]: (sans objet pour cette conception — point déjà identifié par `proposal.md`, vérification
prévue en tâche 6.1, après implémentation).

[Question]: `ReservationCard` n'affiche aucun indicateur de chargement pendant la résolution de
`useUserPhoto` (§1.1, décision prise directement ici plutôt que remontée comme ambiguïté bloquante) —
à confirmer que l'absence de spinner (photo qui "apparaît" silencieusement après un court délai une
fois la modale déjà ouverte, plutôt qu'un flash de spinner suivi d'une disparition dans le cas,
majoritaire, d'une réservation sans photo) correspond bien à l'expérience souhaitée.
[Réponse]: (non tranché — décision mineure, à valider ou ajuster librement en implémentation/revue
sans remettre en cause le reste de la conception).
