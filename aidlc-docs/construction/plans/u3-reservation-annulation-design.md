# Conception — U3 : Réservation & Annulation

Sources : `aidlc-docs/inception/user-stories/stories.md` (US-RESA-01 à 05, US-ANNUL-01 à 04), `aidlc-docs/inception/requirements/requirements.md` (EF-3, EF-4, tableau des rôles), `aidlc-docs/inception/application-design/{unit-of-work,components,component-methods,services,component-dependency}.md`, `prompt-frontend-revise.md` §6 (swagger `/bookings`, `/users`), `packages/shared/src/types/{reservation,user,planning,common}.ts` et `packages/shared/src/utils/validators.ts` (`bookingSchema`, déjà livré par U0/U1, non redéfini), code déjà livré par U1 (`api/endpoints/bookings.ts#getMyBookings`, `useMyBookings`, `useAuth`/`authStore` des deux apps, `api/endpoints/users.ts#updateUser`) et par U2 (`CalendrierReservations.tsx`/`CalendrierPlanningAdmin.tsx`, `planningEntries.ts`, `usePlanning`, `PageAgenda.tsx`/`PagePlanning.tsx`), et surtout `aidlc-docs/construction/plans/u2-agenda-planning-design.md` §6 ("Point d'extension pour U3"), qui constitue le contrat d'ancrage respecté à la lettre ci-dessous.

Niveau conception uniquement : signatures, contrats, arborescence — **pas de corps de fonction, pas de JSX de rendu métier**.

**Rappel de périmètre (`unit-of-work.md`)** : U3 dépend de U0, U1, U2 et ne bloque aucune autre unité. Les actions de réservation/annulation s'accrochent au composant calendrier déjà livré par U2 (`CalendrierReservations`/`CalendrierPlanningAdmin`), sans nouveau composant de calendrier ni changement du contrat de lecture (`usePlanning`/`getPlanning`).

---

## 0. Nouvelle dépendance — `@fullcalendar/interaction`

Comme annoncé en U2 §0/§9 point 2 : `@fullcalendar/interaction` n'était pas installé (lecture seule). U3 l'ajoute, **en version exacte `6.1.21`**, identique à `@fullcalendar/{react,core,daygrid,timegrid}` déjà installés par U2 — même contrainte de compatibilité peer (`@fullcalendar/core: ~6.1.21`), le tag `latest` de l'écosystème FullCalendar pointant vers une v7 sans version stable de `interaction`.

`apps/user-app/package.json` et `apps/admin-app/package.json` : `[MODIFIÉ]`, ajout de `"@fullcalendar/interaction": "6.1.21"` dans `dependencies` (pas de `^`/`~`, cohérent avec les 4 paquets FullCalendar déjà présents).

Conformément à U2 §6, `interactionPlugin` est importé de façon **statique en tête du même module** `CalendrierReservations.tsx`/`CalendrierPlanningAdmin.tsx` (même traitement que `dayGridPlugin`/`timeGridPlugin`) — c'est le module entier qui reste chargé dynamiquement via `React.lazy()` depuis `PageAgenda.tsx`/`PagePlanning.tsx` (frontière de code-splitting posée par U2, inchangée). Aucun nouveau composant de calendrier n'est créé.

---

## 1. Arborescence cible

```
apps/user-app/src/
├── api/endpoints/
│   └── bookings.ts                         [MODIFIÉ] + listBookings, createBooking, cancelBooking (§3)
├── hooks/
│   ├── useBookings.ts                      [CRÉÉ] (§4)
│   ├── useCreateBooking.ts                 [CRÉÉ] (§4)
│   └── useCancelBooking.ts                 [CRÉÉ] (§4)
├── components/agenda/
│   ├── CalendrierReservations.tsx          [MODIFIÉ] + onSelectSlot/onEventClick (§5)
│   ├── ReservationForm.tsx                 [CRÉÉ] réservation pour soi-même (§6.1)
│   ├── ReservationConfirmModal.tsx         [CRÉÉ] récapitulatif + confirmation (création/annulation) (§6.2)
│   ├── ReservationCard.tsx                 [CRÉÉ] recap présentationnel réutilisé par la modal (§6.3)
│   └── cancellationEligibility.ts          [CRÉÉ] règle ≥24h, Veilleur uniquement (§6.4)
├── pages/
│   └── PageAgenda.tsx                      [MODIFIÉ] orchestration réservation/annulation (§8.1)
└── package.json                            [MODIFIÉ] + @fullcalendar/interaction@6.1.21 (§0)

apps/admin-app/src/
├── api/endpoints/
│   ├── bookings.ts                         [CRÉÉ] listBookings, createBooking, cancelBooking (§3)
│   └── users.ts                            [MODIFIÉ] + listUsers (§3.3)
├── hooks/
│   ├── useBookings.ts                      [CRÉÉ] (§4)
│   ├── useCreateBooking.ts                 [CRÉÉ] (§4)
│   ├── useCancelBooking.ts                 [CRÉÉ] (§4)
│   └── useVeilleurs.ts                     [CRÉÉ] liste des bénéficiaires possibles (§7.2)
├── components/planning/
│   ├── CalendrierPlanningAdmin.tsx         [MODIFIÉ] + onSelectSlot/onEventClick (§5)
│   ├── ReservationForm.tsx                 [CRÉÉ] pour soi-même ou pour un Veilleur (§7.1)
│   ├── VeilleurSelect.tsx                  [CRÉÉ] sélecteur de bénéficiaire (§7.2)
│   ├── ReservationConfirmModal.tsx         [CRÉÉ] récapitulatif + confirmation, sans délai (§7.3)
│   └── ReservationCard.tsx                 [CRÉÉ] recap présentationnel (§7.3)
├── pages/
│   └── PagePlanning.tsx                    [MODIFIÉ] orchestration réservation/annulation (§8.2)
└── package.json                            [MODIFIÉ] + @fullcalendar/interaction@6.1.21 (§0)
```

Chaque fichier créé s'accompagne d'un `*.test.ts(x)` colocalisé (convention U0/U1/U2), non détaillé ici. Les tests déjà écrits en U2 sur `CalendrierReservations`/`CalendrierPlanningAdmin` restent valides tels quels (props optionnelles absentes par défaut, cf. §5) ; U3 leur ajoute de nouveaux cas (props fournies) sans les réécrire.

**Aucune extension de `packages/shared` n'est nécessaire** — point notable par rapport à U1/U2 : `types/reservation.ts` (`BookingResponse`, `CreateBookingRequest`), `types/common.ts` (`PageResponse<T>`, `SpringPage<T>`) et `ui/{Modal,Badge,Select,Input,Button,Toast}` couvrent intégralement les besoins de cette unité. **Correction post-implémentation** (relevée en revue de code) : contrairement à ce qu'affirmait cette section avant correction, `utils/validators.ts#bookingSchema` n'est en réalité appelé nulle part dans le code livré — il reste anticipé depuis U0/U1 sans consommateur réel. La couverture fonctionnelle équivalente à ses contraintes (`dateDebut < dateFin`, `dateDebut >= now`, description ≤ 1000 caractères) est assurée autrement dans U3 : `selectAllow` du calendrier (§5) pour la date future, la sémantique même de la sélection FullCalendar pour `dateDebut < dateFin`, et un schéma Zod local à `ReservationForm` (§6.1/§7.1) pour la description. Ajouter un appel explicite à `bookingSchema.safeParse(dto)` avant `mutate()` resterait possible pour une validation défensive du DTO complet côté client avant l'envoi au backend, mais n'a pas été jugé nécessaire ici (aucun de ces cas ne peut se produire via le flux UI existant) — à reconsidérer si `createBooking`/`cancelBooking` gagnent un jour un point d'entrée hors du calendrier (ex. formulaire de réservation libre, hors périmètre de U3).

---

## 2. Rappel des contrats déjà livrés, réutilisés tels quels

```typescript
// packages/shared/src/types/reservation.ts
export enum StatutReservation { EFFECTUEE = "EFFECTUEE", ANNULEE = "ANNULEE" }
export interface BookingResponse {
  id: string;
  idUtilisateur: string;   // bénéficiaire
  creatorId: string;       // auteur de la réservation (peut différer d'idUtilisateur, cf. §9 point ouvert 2)
  dateDebut: string;
  dateFin: string;
  status: StatutReservation;
  description?: string;
  dateCreation: string;
  dateModification?: string;
  estArchivee: boolean;
}
export interface CreateBookingRequest {
  idUtilisateur?: string;  // absent = réservation pour soi-même
  dateDebut: string;
  dateFin: string;
  description?: string;
}

// packages/shared/src/utils/validators.ts
export const bookingSchema: ZodEffects<...>; // dateDebut < dateFin, dateDebut >= now, description ≤ 1000 car.
```

`PlanningEntryResponse` (U2, `types/planning.ts`) n'expose pas `creatorId` — seulement `idUtilisateur`. Le clic sur un événement du calendrier (§5, §8) travaille donc avec cette forme réduite ; voir §9 point ouvert 2 sur les implications pour la règle "créateur" d'annulation.

---

## 3. Endpoints — `api/endpoints/bookings.ts` (les deux apps) et `users.ts` (admin-app)

### 3.1 `apps/user-app/src/api/endpoints/bookings.ts` [MODIFIÉ]

`getMyBookings` (U1) est conservé tel quel. Ajouts :

```typescript
export interface ListBookingsParams {
  utilisateurId?: string;
  from?: string;  // ISO date-time
  to?: string;    // ISO date-time
  page?: number;
  size?: number;
}

export function listBookings(params: ListBookingsParams): Promise<PageResponse<BookingResponse>>;
// GET /bookings?utilisateurId=&from=&to=&page=&size=

export function createBooking(dto: CreateBookingRequest): Promise<BookingResponse>;
// POST /bookings — apiClient.post("/bookings", dto, { skipForbiddenRedirect: true }), cf. §9 point 3 (résolu)

export function cancelBooking(id: string): Promise<void>;
// DELETE /bookings/{id} — apiClient.delete(`/bookings/${id}`, { skipForbiddenRedirect: true }), cf. §9 point 3 (résolu)
```

**Prérequis technique tranché avant implémentation** (initialement point ouvert n°3, cf. §9) : `packages/shared/src/api/client.ts` gagne une option `skipForbiddenRedirect?: boolean` sur `RequestOptions`, qui court-circuite `hooks.onForbidden?.()` (`if (response.status === 403 && !options?.skipForbiddenRedirect)`) — déjà implémentée et testée (`client.test.ts`). `createBooking`/`cancelBooking` (les deux apps) l'activent systématiquement : un refus métier scoped à l'action (chevauchement, délai d'annulation dépassé, droit insuffisant sur cette réservation précise) ne doit jamais rediriger toute l'application vers `/non-autorise` — seul le toast d'erreur générique de `useCreateBooking`/`useCancelBooking` (§4) doit s'afficher, quel que soit le code HTTP réel renvoyé par le backend pour ces règles (401/403/409/422). Même raisonnement que le correctif prérequis `skipAuthRetry` de U1 §0 : U3 ne peut pas se permettre d'attendre une confirmation d'intégration pour un risque de régression UX aussi direct.

### 3.2 `apps/admin-app/src/api/endpoints/bookings.ts` [CRÉÉ]

Fichier absent jusqu'ici côté admin-app (contrairement à `planning.ts`/`users.ts`, déjà livrés). Contenu identique en forme à `listBookings`/`createBooking`/`cancelBooking` ci-dessus — pas de `getMyBookings` (pas d'historique personnel côté admin-app, hors périmètre).

### 3.3 `apps/admin-app/src/api/endpoints/users.ts` [MODIFIÉ]

`updateUser` (U1) est conservé. Ajout minimal nécessaire au sélecteur de bénéficiaire (§7.2) :

```typescript
export interface ListUsersParams {
  nom?: string;
  prenoms?: string;
  email?: string;
  statutValidation?: StatutValidation;
  page?: number;
  size?: number;
}

export function listUsers(params: ListUsersParams): Promise<SpringPage<UserResponse>>;
// GET /users?nom=&prenoms=&email=&statutValidation=&page=&size=
```

Même remarque que pour `bookings.ts`/`users.ts` en U1 : ce fichier est "partagé dans le temps" — U4 (`UserManagementModule`, non encore construite) l'étendra avec `createUser`, `deleteUser`, `validerUser`, `rejeterUser` et un usage plus complet de `listUsers` (tableau paginé avec tous les filtres). U3 n'ajoute que le strict nécessaire à `VeilleurSelect`.

**Limite connue** : le swagger de `GET /users` n'expose **aucun filtre `role`** (seulement `email`, `telephone`, `nom`, `prenoms`, `statutValidation`, `pageable`). `listUsers` ne peut donc pas demander "les Veilleurs" directement au backend — cf. §7.2 pour la stratégie de contournement côté client et §9 point ouvert 1.

---

## 4. Hooks de mutation — `useCreateBooking`/`useCancelBooking` (les deux apps, forme identique)

```typescript
// apps/*/hooks/useBookings.ts
export interface UseBookingsParams {
  utilisateurId?: string;
  from?: string;
  to?: string;
}

export function useBookings(params?: UseBookingsParams): UseQueryResult<PageResponse<BookingResponse>>;
// queryKey: ["bookings", params ?? {}]
// queryFn: () => listBookings({ ...params, page: 0, size: DEFAULT_PAGE_SIZE })
```

`useBookings` est posé par parité avec `component-methods.md` (qui documente le trio `useBookings`/`useCreateBooking`/`useCancelBooking` sur la base complète du swagger `/bookings`), mais **n'a aucun consommateur dans l'UI de U3** : ni `PageAgenda`/`PagePlanning` (alimentées par `usePlanning`, pas par `/bookings`), ni de page "liste des réservations" (non demandée par `unit-of-work.md` pour cette unité). Même logique que `getPlanning` en U2, dont la signature dépassait déjà son unique appelant — cf. §9 point ouvert 8 sur le risque de code mort.

```typescript
// apps/*/hooks/useCreateBooking.ts
export function useCreateBooking(): UseMutationResult<BookingResponse, ApiError, CreateBookingRequest>;
// mutationFn: createBooking
// onSuccess: invalide les familles de requêtes ["planning"] et ["bookings"] (voir note ci-dessous),
//            toast succès ("Réservation confirmée.")
// onError: toast erreur (error instanceof ApiError ? error.message || message générique : message générique) — cf. §9 point ouvert 3

// apps/*/hooks/useCancelBooking.ts
export function useCancelBooking(): UseMutationResult<void, ApiError, string /* id */>;
// mutationFn: cancelBooking
// onSuccess: même invalidation, toast succès ("Réservation annulée.")
// onError: même traitement
```

**Invalidation et queryKey exacte posée par U2** : `usePlanning` utilise `queryKey: ["planning", params.date]` (vérifié dans `apps/*/src/hooks/usePlanning.ts`, pas `["planning", params]` comme l'esquissait `component-methods.md`). `onSuccess` appelle `queryClient.invalidateQueries({ queryKey: ["planning"] })` — **avec cette seule clé de préfixe**, pas `["planning", date]` explicite : TanStack Query v5 fait par défaut une correspondance partielle (préfixe) sur les `queryKey`, donc `["planning"]` invalide déjà toutes les entrées `["planning", "<n'importe quelle date>"]` présentes en cache. C'est délibérément préféré à un calcul manuel de la date affectée (`toISODateString(new Date(dto.dateDebut))`) : plus simple, et couvre correctement le cas limite d'une réservation à cheval sur minuit qui toucherait deux entrées de cache `["planning", date]` différentes. Idem pour `["bookings"]` (préfixe), qui couvre à la fois `useBookings` (`["bookings", params]`) et `useMyBookings` de U1 (`["bookings", "me", user?.id]`) — la page "Mon compte" du Veilleur se rafraîchit donc automatiquement après une réservation/annulation faite depuis `/agenda`, sans mécanisme supplémentaire. Aucun changement du contrat de lecture (`usePlanning`, `getPlanning`, `planningEntries.ts`) posé par U2.

---

## 5. Extension des composants calendrier — respect strict du contrat U2 §6

`CalendrierReservationsProps`/`CalendrierPlanningAdminProps` gagnent exactement les deux props optionnelles annoncées :

```typescript
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";

export interface CalendrierReservationsProps {
  date: string;
  entries: PlanningEntryResponse[];
  isLoading: boolean;
  onSelectSlot?: (info: DateSelectArg) => void;   // [AJOUTÉ]
  onEventClick?: (info: EventClickArg) => void;   // [AJOUTÉ]
}
```

(Idem pour `CalendrierPlanningAdminProps`, forme identique.)

Configuration FullCalendar modifiée (prose, le reste — `plugins` daygrid/timegrid, `initialView`, `initialDate`, `locale`, `headerToolbar`, `height`, `nowIndicator`, `editable`, `events`, `eventContent` — est inchangé) :
- `plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}`.
- `selectable={Boolean(onSelectSlot)}` : lecture seule par défaut (`onSelectSlot` non fourni), conformément à l'engagement pris en U2 §6.
- `selectOverlap={false}` : empêche de sélectionner une plage chevauchant un événement déjà rendu (US-RESA-03, "le calendrier ne me propose pas cette plage comme disponible") — mécanisme natif FullCalendar, aucune logique de chevauchement à écrire.
- `selectAllow={(selectInfo) => selectInfo.start.getTime() >= Date.now()}` : empêche de sélectionner une plage passée (US-RESA-04, "le sélecteur de date désactive les dates passées").
- `select={onSelectSlot}`, `eventClick={onEventClick}`.

**Format de date transmis à l'API** : `onSelectSlot` reçoit un `DateSelectArg` qui expose à la fois `start`/`end` (objets `Date`) et `startStr`/`endStr` (chaînes ISO, mais potentiellement suffixées d'un offset local `+02:00` selon le fuseau du navigateur, pas nécessairement `Z`). `bookingSchema` (non appelé par U3, cf. §1) valide `dateDebut`/`dateFin` avec `z.string().datetime()`, qui **rejetterait par défaut tout offset non-`Z`** si jamais invoqué ailleurs sur ce DTO. Décision de conception, valable indépendamment de cet appel Zod : l'appelant (`PageAgenda`/`PagePlanning`, §8) construit `CreateBookingRequest.dateDebut`/`dateFin` à partir de `selectInfo.start.toISOString()`/`selectInfo.end.toISOString()` (toujours suffixé `Z`, UTC), **jamais** `startStr`/`endStr` — un format UTC non ambigu est de toute façon le bon choix pour un DTO envoyé au backend, indépendamment de toute validation Zod effective côté client.

---

## 6. BookingModule — `user-app` (réservation/annulation pour soi-même)

### 6.1 `components/agenda/ReservationForm.tsx`

```typescript
export interface ReservationFormValues {
  description?: string;
}

export interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  slot: { start: string; end: string };  // ISO, la plage sélectionnée (recap en lecture seule)
  onSubmit: (values: ReservationFormValues) => void;  // n'appelle PAS l'API — ouvre ReservationConfirmModal
}

export function ReservationForm(props: ReservationFormProps): JSX.Element;
```

Comportement (US-RESA-01/05) : composant RHF, wrappé dans un `Modal` (`@chapelle/shared/ui`, titre "Réserver ce créneau") interne au composant (symétrique de `ReservationConfirmModal`, §6.2). Affiche en lecture seule `formatDateTime(slot.start)`/`formatDateTime(slot.end)` (`@chapelle/shared/utils`), un champ `description` optionnel (`Input`/textarea, validé par un schéma Zod local `z.object({ description: z.string().max(1000).optional() })` — non factorisé depuis `bookingSchema`, qui est un `ZodEffects` avec `.refine()` en chaîne et ne permet pas de `.pick()` un sous-ensemble de champs ; le formulaire ne collecte de toute façon que `description`, les dates étant fixées par la sélection calendrier). Bouton "Réserver" (pas "Confirmer" : la confirmation explicite a lieu dans la modal suivante, US-RESA-05).

### 6.2 `components/agenda/ReservationConfirmModal.tsx`

```typescript
export type ReservationConfirmModalProps =
  | {
      variant: "create";
      isOpen: boolean;
      onClose: () => void;
      dto: CreateBookingRequest;
      beneficiaireLabel: string;   // "Moi-même" (toujours, côté user-app)
      isSubmitting: boolean;
      onConfirm: () => void;
    }
  | {
      variant: "cancel";
      isOpen: boolean;
      onClose: () => void;
      booking: PlanningEntryResponse;
      isSubmitting: boolean;
      onConfirm: () => void;
    };

export function ReservationConfirmModal(props: ReservationConfirmModalProps): JSX.Element;
```

Comportement : `Modal` (titre "Confirmer la réservation" / "Confirmer l'annulation" selon `variant`), affiche `<ReservationCard .../>` (§6.3), footer avec `Button variant="outline"` ("Annuler"/`onClose`) et `Button` ("Confirmer"/`onConfirm`, `isLoading={isSubmitting}`).

Cas `variant: "cancel"` uniquement : calcule `canCancelBooking(booking.dateDebut)` (§6.4) ; si `false`, le bouton "Confirmer" est désactivé et un message "Le délai d'annulation (24h) est dépassé." s'affiche à la place (US-ANNUL-02, option "désactivée ou message explicite" — implémentation retenue : message + désactivation dans la modal plutôt que sur l'événement du calendrier lui-même, plus simple qu'une variante supplémentaire de `renderPlanningEvent`). Cette vérification est un filet côté client ; la décision finale reste côté backend (`DELETE /bookings/{id}` peut malgré tout rejeter — US-ANNUL-02, "si la requête est malgré tout envoyée, l'erreur API est affichée via toast").

### 6.3 `components/agenda/ReservationCard.tsx`

```typescript
export interface ReservationCardProps {
  dateDebut: string;
  dateFin: string;
  beneficiaireLabel: string;
  description?: string;
}

export function ReservationCard(props: ReservationCardProps): JSX.Element;
```

Présentation pure (`Card` de `@chapelle/shared/ui`, `formatDateTime` de `@chapelle/shared/utils`) : affiche date/heure de début/fin, bénéficiaire, description si présente. Réutilisé par les deux variantes de `ReservationConfirmModal` (création et annulation).

### 6.4 `components/agenda/cancellationEligibility.ts`

```typescript
const CANCELLATION_DEADLINE_HOURS = 24;

export function canCancelBooking(dateDebut: string, now: Date = new Date()): boolean;
// true si (new Date(dateDebut).getTime() - now.getTime()) >= CANCELLATION_DEADLINE_HOURS * 3_600_000
```

Fonction pure, paramètre `now` injectable pour les tests. `CANCELLATION_DEADLINE_HOURS` **n'est pas remonté dans `packages/shared`** : contrairement à `toISODateString` (U2, besoin identique dans les deux apps), cette règle ne concerne que le Veilleur sur `user-app` — l'admin-app n'a aucune contrainte de délai (EF-4) et n'a donc aucun besoin réel de cette constante. Décision cohérente avec le principe déjà acté (`planningEntries.ts`, U2 §4.1) : ne pas factoriser un comportement qui n'est pas identique entre les deux apps.

---

## 7. BookingModule — `admin-app` (réservation pour soi-même ou pour un Veilleur, annulation libre)

`EF-3` (`requirements.md`) confirme explicitement que l'Administrateur/SuperAdministrateur "réserve pour lui-même ou pour un Veilleur" — le sélecteur de bénéficiaire ci-dessous propose donc bien les deux options, pas seulement "Veilleur" (US-RESA-02 ne décrivait que le cas Veilleur mais n'excluait pas l'auto-réservation, tranché par `requirements.md`).

### 7.1 `components/planning/ReservationForm.tsx`

```typescript
export interface ReservationFormValues {
  beneficiaire: "moi" | "veilleur";
  veilleurId?: string;
  description?: string;
}

export interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  slot: { start: string; end: string };
  onSubmit: (values: ReservationFormValues) => void;
}

export function ReservationForm(props: ReservationFormProps): JSX.Element;
```

Schéma Zod local (non partagé, structure propre à ce formulaire) :
```typescript
z.object({
  beneficiaire: z.enum(["moi", "veilleur"]),
  veilleurId: z.string().optional(),
  description: z.string().max(1000).optional(),
}).refine((data) => data.beneficiaire !== "veilleur" || Boolean(data.veilleurId), {
  message: "Sélectionnez un Veilleur",
  path: ["veilleurId"],
});
```

Rendu : recap lecture seule de `slot` (identique à user-app), deux `Input type="radio"` ("Moi-même" / "Un Veilleur"), `<VeilleurSelect>` (§7.2) affiché conditionnellement si `beneficiaire === "veilleur"`, champ `description`, bouton "Réserver". Composant "connecté" (appelle `useVeilleurs()` en interne, §7.2) — cohérent avec `component-dependency.md` ("composants présentationnels → hooks pour les composants connectés").

### 7.2 `components/planning/VeilleurSelect.tsx` et `hooks/useVeilleurs.ts`

```typescript
// hooks/useVeilleurs.ts
export function useVeilleurs(): UseQueryResult<UserResponse[]>;
// queryKey: ["users", "veilleurs"]
// queryFn: () => listUsers({ statutValidation: StatutValidation.VALIDE, page: 0, size: VEILLEUR_LOOKUP_PAGE_SIZE })
// select: (page) => page.content.filter((u) => u.role === UserRole.VEILLEUR)
```

```typescript
// components/planning/VeilleurSelect.tsx
export interface VeilleurSelectProps {
  veilleurs: UserResponse[];
  value?: string;
  onChange: (id: string | undefined) => void;
  error?: string;
}

export function VeilleurSelect(props: VeilleurSelectProps): JSX.Element;
```

**Stratégie retenue face à l'absence de filtre `role` sur `GET /users`** (§3.3) : `useVeilleurs` récupère une page unique de taille `VEILLEUR_LOOKUP_PAGE_SIZE` (constante locale à ce fichier, ex. `100` — délibérément distincte de `DEFAULT_PAGE_SIZE` (20), qui vise la pagination UI standard et serait insuffisante ici) de comptes `VALIDE`, puis filtre `role === VEILLEUR` côté client. `VeilleurSelect` reçoit cette liste déjà filtrée par rôle et effectue en interne une recherche texte locale (nom/prénoms/email, sans nouvel appel réseau) au fur et à mesure de la saisie — pas de `Select` HTML natif seul (peu utilisable pour une liste de Veilleurs potentiellement longue), mais un `Input` de recherche + une liste de résultats cliquables construits sur les primitives déjà exportées (`Input`, pas de nouveau composant de type combobox dans `packages/shared/ui`, hors périmètre de cette unité). Limite assumée et documentée en §9 point ouvert 1 : cette approche ne passe pas à l'échelle au-delà d'une centaine de Veilleurs et dépend d'un filtre `role` toujours absent du swagger.

### 7.3 `components/planning/ReservationConfirmModal.tsx` et `ReservationCard.tsx`

Formes identiques à §6.2/§6.3, avec deux différences assumées (duplication délibérée, pas de partage via `packages/shared` — même rationale que `planningEntries.ts`/U2 §4.1) :
- `beneficiaireLabel` : `"Moi-même"` ou le nom complet du Veilleur sélectionné (résolu par `PagePlanning`, §8.2, à partir de la liste renvoyée par `useVeilleurs()`), jamais figé à `"Moi-même"`.
- **Aucun appel à `canCancelBooking`** dans la variante `"cancel"` : le bouton "Confirmer" est toujours actif, sans vérification de délai (EF-4, "Administrateur/SuperAdministrateur peut annuler n'importe quelle réservation").

---

## 8. Orchestration — `PageAgenda.tsx` (user-app) / `PagePlanning.tsx` (admin-app)

### 8.1 `apps/user-app/src/pages/PageAgenda.tsx` [MODIFIÉ]

Ajouts par rapport à la version livrée en U2 (état `date`/`mesReservationsUniquement`, `usePlanning`, `filterOwnEntries` inchangés) :

- Nouvel état local : `selectedSlot: { start: string; end: string } | null`, `pendingCreateDto: CreateBookingRequest | null`, `bookingToCancel: PlanningEntryResponse | null`.
- `const createBooking = useCreateBooking();`, `const cancelBooking = useCancelBooking();`.
- `onSelectSlot` transmis à `CalendrierReservations` **seulement si** `role === UserRole.VEILLEUR && !mesReservationsUniquement` — sinon `undefined`. Justification du second critère (nouveau par rapport à U2) : `entries` passées au calendrier sont déjà filtrées ("mes réservations", `visibleEntries`, U2 §5.3) lorsque le filtre est actif ; `selectOverlap={false}` (§5) ne peut alors détecter une collision qu'avec les entrées *visibles*, pas avec l'ensemble réel du planning — un chevauchement avec la réservation d'un tiers masqué par le filtre ne serait pas bloqué côté client. Plutôt que de laisser cette détection dégradée (et compter uniquement sur le rejet serveur + toast, US-RESA-03), la sélection est désactivée tant que le filtre est actif : l'utilisateur doit le décocher pour réserver. Voir §9 point ouvert 5.
- `onEventClick` transmis **toujours** si `role === UserRole.VEILLEUR` (indépendamment du filtre, puisque `mesReservationsUniquement` actif ne montre de toute façon que des entrées "à soi"). Handler : retrouve l'entrée correspondante dans `entries` (pas `visibleEntries`, ni l'objet `EventClickArg` lui-même, pour disposer de tous les champs de `PlanningEntryResponse` — `id`, `description`, etc. — cf. §9 point ouvert 6 sur l'hypothèse `PlanningEntryResponse.id === BookingResponse.id`) via `info.event.id` ; si `entry.extendedProps` (dérivé) indique `isMine`, ouvre `ReservationConfirmModal` en `variant: "cancel"` avec cette entrée ; sinon, ignore le clic (aucune action sur une réservation anonymisée d'un tiers).
- `ReservationForm.onSubmit(values)` construit `pendingCreateDto = { dateDebut: selectedSlot.start, dateFin: selectedSlot.end, description: values.description || undefined }` (jamais `idUtilisateur`, toujours pour soi-même) et ferme `ReservationForm` au profit de `ReservationConfirmModal` (`variant: "create"`, `beneficiaireLabel: "Moi-même"`).
- `ReservationConfirmModal` (`variant: "create"`) `onConfirm` → `createBooking.mutate(pendingCreateDto)` ; `variant: "cancel"` `onConfirm` → `cancelBooking.mutate(bookingToCancel.id)`. Dans les deux cas, succès → réinitialise tout l'état local de sélection/modales (les mutations invalident déjà `["planning"]`, §4, donc `entries` se rafraîchit sans action supplémentaire).
- Rendu : `<CalendrierReservations key={date} date={date} entries={visibleEntries} isLoading={...} onSelectSlot={...} onEventClick={...} />`, puis conditionnellement `<ReservationForm .../>` et `<ReservationConfirmModal .../>` selon l'état local.

### 8.2 `apps/admin-app/src/pages/PagePlanning.tsx` [MODIFIÉ]

Même structure que §8.1, simplifiée et adaptée :
- `onSelectSlot`/`onEventClick` toujours transmis (pas de filtre "mes réservations" côté admin-app, pas de restriction de rôle supplémentaire — `ProtectedRoute` a déjà vérifié `ADMIN_ROLES`).
- `onEventClick` ouvre `ReservationConfirmModal` (`variant: "cancel"`) pour **n'importe quelle** entrée cliquée (pas de vérification `isMine`), conformément à EF-4/US-ANNUL-03.
- `ReservationForm.onSubmit(values)` construit `pendingCreateDto = { idUtilisateur: values.beneficiaire === "veilleur" ? values.veilleurId : undefined, dateDebut: ..., dateFin: ..., description: ... }` et calcule `beneficiaireLabel` (`"Moi-même"` ou nom complet du Veilleur trouvé dans la liste `useVeilleurs()` par `veilleurId`).
- Reste identique (mutations, réinitialisation, rendu).

---

## 9. Points ouverts pour l'orchestrateur

1. **Absence de filtre `role` sur `GET /users`** (§3.3, §7.2) : le swagger ne permet pas de demander directement "les comptes Veilleur" au backend. `useVeilleurs` contourne en récupérant une page unique de comptes `VALIDE` (taille arbitraire `100`) et en filtrant `role === VEILLEUR` côté client — ne passe pas à l'échelle au-delà de ce volume et pourrait masquer des Veilleurs valides si leur nombre dépasse la page récupérée. Alternative rejetée faute de support backend : un filtre `role` sur `GET /users` serait la solution propre, à demander pour une évolution ultérieure du swagger (U4 pourrait en bénéficier aussi pour son propre tableau).

2. **`creatorId` absent de `PlanningEntryResponse`** : US-ANNUL-01 autorise l'annulation par le "créateur" de la réservation (`BookingResponse.creatorId`), mais le calendrier de `user-app` (alimenté par `usePlanning`, pas `useBookings`) ne connaît que `idUtilisateur` (le bénéficiaire). Dans le cas où un Administrateur réserve un créneau *pour* un Veilleur (US-RESA-02), ce Veilleur voit l'entrée comme "Ma réservation" sur `/agenda` (`idUtilisateur` = lui-même, `estAnonymise=false`, signal déjà utilisé par U2) et ce plan lui permet de cliquer pour tenter de l'annuler — alors qu'au sens strict de `creatorId`, il n'en est pas le créateur. Ce plan délègue la décision finale au backend (`DELETE /bookings/{id}` peut renvoyer une erreur si le rôle métier réel l'exige) plutôt que de bloquer côté client une action potentiellement légitime pour l'utilisateur. À confirmer : le Veilleur bénéficiaire (non créateur) doit-il pouvoir initier l'annulation depuis `/agenda`, sachant que le backend tranchera de toute façon ?

3. ~~Codes d'erreur HTTP réels des règles métier de réservation/annulation non confirmés~~ — **tranché** : ni le swagger extrait ni `requirements.md`/`stories.md` ne précisent les codes de statut exacts pour "plage déjà occupée" (US-RESA-03), "date passée" (US-RESA-04) ou "délai d'annulation dépassé" (US-ANNUL-02) — `services.md` évoque de façon informelle "409 chevauchement, 422 délai d'annulation dépassé", ce qui n'exclut pas un `403` pour un refus de droit scoped (ex. "vous n'êtes pas le créateur de cette réservation"). Plutôt que d'attendre une confirmation d'intégration comme pour un risque plus incertain, ce plan applique dès maintenant le même correctif prérequis que U1 §0 (`skipAuthRetry`) : `skipForbiddenRedirect?: boolean` ajouté à `RequestOptions`/`ApiClient` (implémenté et testé, cf. §3.1) et activé sur `POST /bookings`/`DELETE /bookings/{id}` — quel que soit le code HTTP réel, aucun refus métier sur ces deux endpoints ne redirigera plus jamais toute l'application vers `/non-autorise`.

4. **Taille de page arbitraire (`VEILLEUR_LOOKUP_PAGE_SIZE = 100`)** pour `useVeilleurs` (§7.2) : choisie sans base objective sur la volumétrie réelle de comptes Veilleur, à l'image du point ouvert n°3 de la conception U2 sur `DEFAULT_PAGE_SIZE`. À ajuster avec la volumétrie réelle.

5. **`onSelectSlot` désactivé quand le filtre "mes réservations" est actif** (§8.1) : décision de conception pour éviter une détection de chevauchement dégradée (`selectOverlap` ne voit que les entrées visibles). Alternative rejetée : laisser la sélection active et compter uniquement sur le rejet serveur + toast (US-RESA-03 l'anticipe explicitement comme filet de sécurité) — jugée moins bonne UX (l'utilisateur croirait la plage libre alors qu'elle ne l'est pas). À confirmer que devoir décocher le filtre avant de réserver est acceptable.

6. **Hypothèse `PlanningEntryResponse.id === BookingResponse.id`** (même UUID) : ce plan s'appuie sur cette égalité pour permettre `DELETE /bookings/{id}` à partir de l'`id` d'une entrée de planning cliquée sur le calendrier (§8.1/§8.2). Ni `unit-of-work.md` ni le swagger extrait ne le confirment explicitement (bien que cela découle naturellement du fait qu'un planning est une projection des réservations actives). À vérifier en intégration.

7. **Pas de garde côté client empêchant l'annulation d'une réservation archivée/passée par un Administrateur** : EF-4 ne l'interdit pas explicitement ("peut annuler n'importe quelle réservation"), mais ce cas limite (annuler une adoration déjà passée) n'est couvert par aucun critère Gherkin de `stories.md`. Ce plan ne l'empêche pas (`onEventClick` admin-app ouvre systématiquement la modal d'annulation, §8.2). À confirmer si une garde (désactiver l'action sur `entry.estArchivee === true`) est souhaitée.

8. **`useBookings`/`listBookings` sans consommateur réel dans le périmètre UI de U3** (§4) : ajoutés par parité avec `component-methods.md` et le swagger complet de `/bookings`, mais aucune page de U3 ne les appelle (le calendrier reste alimenté par `usePlanning`). Risque de code mort si aucune unité future (ex. une liste de réservations filtrable côté admin, évoquée dans `prompt-frontend-revise.md` §6 mais absente de `unit-of-work.md`) ne les consomme. À trancher : les garder en anticipation, ou les omettre tant qu'un besoin réel n'est pas identifié.
