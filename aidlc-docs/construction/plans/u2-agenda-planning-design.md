# Conception — U2 : Agenda / Planning (consultation)

Sources : `aidlc-docs/inception/user-stories/stories.md` (US-AGENDA-01 à 05), `aidlc-docs/inception/application-design/{unit-of-work,components,component-methods,services,component-dependency}.md`, `prompt-frontend-revise.md` §2.4/§5/§6.1/§7.1 (dont l'extrait swagger `GET /api/v1/planning` et le schéma `PlanningEntryResponse`), `aidlc-docs/inception/requirements/requirements.md` (EF-2, NFR performance), `packages/shared/src/types/planning.ts` (contrat déjà livré, non redéfini), code déjà livré par U0/U1 (`router.tsx`, `useAuth`, `authStore`, `ProtectedRoute`, `PagePlaceholder`, `Sidebar` des deux apps).

Niveau conception uniquement : signatures, contrats, arborescence, configuration FullCalendar décrite en prose — **pas de corps de fonction, pas de JSX de rendu métier**.

**Rappel de périmètre (`unit-of-work.md`)** : U2 est strictement une unité de **consultation**. Aucune action de réservation ni d'annulation n'est implémentée ici (U3). Le calendrier livré par U2 est en lecture seule ; §6 documente précisément où et comment U3 s'y accroche.

---

## 0. Nouvelles dépendances — FullCalendar

Aucun paquet FullCalendar n'est encore installé (vérifié : absent des deux `package.json` et du lockfile). **Vérifié en direct sur le registre npm** (point ouvert n°2 de la version précédente de ce plan, désormais tranché) :

```
@fullcalendar/react@6.1.21      # composant React <FullCalendar/>
@fullcalendar/core@6.1.21       # types (EventContentArg, EventInput...) + locale FR (@fullcalendar/core/locales/fr)
@fullcalendar/daygrid@6.1.21    # dayGridPlugin — chargé par anticipation, non exposé dans l'UI de U2 (cf. §9 point ouvert 1)
@fullcalendar/timegrid@6.1.21   # timeGridPlugin — vue "jour" utilisée par U2
```

**Version exacte `6.1.21` obligatoire sur les 4 paquets — ne jamais installer sans version figée.** L'écosystème FullCalendar est en pleine transition : le tag npm `latest` de `@fullcalendar/react` et `@fullcalendar/core` pointe désormais vers la **v7.1.0** (nouvelle architecture, dépendance peer supplémentaire `temporal-polyfill`, API `Temporal` au lieu de dates/chaînes classiques), alors que `@fullcalendar/daygrid`/`timegrid`/`interaction` n'ont **aucune version 7 stable** publiée (seulement des tags `rc`/`beta` : `7.0.0-rc.0`, `7.0.0-beta.6`) et déclarent un peerDependency `@fullcalendar/core: ~6.1.21`. Un `npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid` sans version explicite installerait donc `react@7.1.0` + `core@7.1.0` (incompatibles) à côté de `daygrid@6.1.21`/`timegrid@6.1.21` (qui exigent `core ~6.1.21`) : conflit de peer dependencies, échec ou comportement indéfini au runtime. `@fullcalendar/react@6.1.21` a été confirmé compatible React 19 (`peerDependencies.react: "^16.7.0 || ^17 || ^18 || ^19"`) et cohérent avec `core@6.1.21`.

`@fullcalendar/interaction` (`interactionPlugin`, nécessaire à `select`/`eventClick`) n'est **pas** ajouté par U2 : lecture seule, aucune interaction de clic requise. U3 l'ajoutera **en version `6.1.21` également** (même contrainte de compatibilité) avec `ReservationForm`/`ReservationConfirmModal` (§6).

`apps/user-app/package.json` et `apps/admin-app/package.json` : `[MODIFIÉ]`, ajout des 4 dépendances ci-dessus **en version exacte `6.1.21`** (pas de `^`/`~`, cohérent avec la pratique déjà en place dans ces `package.json` pour d'autres dépendances) dans `dependencies` (chargées dynamiquement au niveau module par `CalendrierReservations.tsx`/`CalendrierPlanningAdmin.tsx`, jamais depuis `router.tsx` ni `App.tsx` — cf. §4.3 pour le mécanisme de code-splitting).

---

## 1. Arborescence cible

```
packages/shared/src/utils/
└── formatters.ts                           [MODIFIÉ] + toISODateString (§2)

apps/user-app/src/
├── api/endpoints/
│   └── planning.ts                         [CRÉÉ] getPlanning (§3)
├── hooks/
│   └── usePlanning.ts                      [CRÉÉ] (§3)
├── components/agenda/
│   ├── CalendrierReservations.tsx          [CRÉÉ] wrapper FullCalendar, lecture seule (§4)
│   ├── planningEntries.ts                  [CRÉÉ] mapping + filtre "mes réservations" (§4.1)
│   ├── renderPlanningEvent.tsx             [CRÉÉ] eventContent (JSX de présentation) (§4.2)
│   ├── FiltreDatePlanning.tsx              [CRÉÉ] (§5.1)
│   └── FiltreMesReservations.tsx           [CRÉÉ] Veilleur uniquement (§5.2)
├── pages/
│   └── PageAgenda.tsx                      [CRÉÉ] orchestration, remplace le placeholder (§5.3)
└── router.tsx                              [MODIFIÉ] `/agenda` -> <PageAgenda /> (§7.1)

apps/admin-app/src/
├── api/endpoints/
│   └── planning.ts                         [CRÉÉ] getPlanning, identique en forme à user-app (§3)
├── hooks/
│   └── usePlanning.ts                      [CRÉÉ] (§3)
├── components/planning/
│   ├── CalendrierPlanningAdmin.tsx         [CRÉÉ] wrapper FullCalendar, toutes identités (§4)
│   ├── planningEntries.ts                  [CRÉÉ] mapping, sans anonymisation (§4.1)
│   ├── renderPlanningEvent.tsx             [CRÉÉ] (§4.2)
│   └── FiltreDatePlanning.tsx              [CRÉÉ] identique en forme à user-app (§5.1)
├── pages/
│   └── PagePlanning.tsx                    [CRÉÉ] orchestration, remplace le placeholder (§5.3)
└── router.tsx                              [MODIFIÉ] `/planning` -> <PagePlanning /> (§7.2), `ProtectedRoute`/`ADMIN_ROLES` inchangés
```

Chaque fichier créé s'accompagne d'un `*.test.ts(x)` colocalisé (convention U0/U1), non détaillé ici. `planningEntries.ts` (fonctions pures, sans JSX) est le fichier le plus simple à couvrir unitairement — priorité de test suggérée.

`Sidebar.tsx` (admin-app) n'est **pas modifié** : le lien `/planning` posé en U1 (point ouvert n°3 de sa conception) pointe déjà vers la bonne route, seul son contenu cesse d'être un placeholder.

---

## 2. `packages/shared` — seule extension nécessaire

### `utils/formatters.ts`

```typescript
/** Date au format ISO `yyyy-MM-dd` (fuseau Europe/Paris), pour les paramètres de requête
 *  d'API attendant un `LocalDate` (`GET /planning?date=`) — distinct de `formatDate`
 *  (`dd/MM/yyyy`, affichage FR uniquement, non réinjectable dans une requête). */
export function toISODateString(date: Date): string;
```

Justifié par un besoin **identique dans les deux apps** : initialiser la date sélectionnée par défaut ("aujourd'hui") et fournir la valeur du bouton "Aujourd'hui" de `FiltreDatePlanning` (§5.1), dans le même format que celui produit nativement par un `<input type="date">` (déjà `yyyy-MM-dd`, aucune conversion nécessaire côté saisie utilisateur). Réexporté automatiquement par `utils/index.ts` (`export * from "./formatters"`, déjà en place, non modifié). Aucun autre ajout à `packages/shared` : `types/planning.ts` (`PlanningEntryResponse`) et `types/common.ts` (`PageResponse<T>`) livrés par U0 couvrent intégralement le contrat `GET /planning`.

---

## 3. Endpoint et hook de lecture du planning (les deux apps, fichiers identiques en forme)

### `api/endpoints/planning.ts`

```typescript
export interface GetPlanningParams {
  date?: string; // yyyy-MM-dd (LocalDate) — optionnel dans le swagger, toujours fourni en pratique par usePlanning (cf. §9 point ouvert 6)
  page?: number;
  size?: number;
}

export function getPlanning(params: GetPlanningParams): Promise<PageResponse<PlanningEntryResponse>>;
// GET /planning?date=&page=&size= — endpoint public, aucune garde d'authentification
```

Signature volontairement plus générique que son unique appelant actuel (`usePlanning`, qui fixe `page`/`size`) : anticipe une éventuelle pagination réelle ajoutée sans changer ce fichier (même logique que `getMyBookings` en U1).

### `hooks/usePlanning.ts`

```typescript
export interface UsePlanningParams {
  date: string; // yyyy-MM-dd, requis côté hook (contrairement au paramètre optionnel du endpoint)
}

export function usePlanning(params: UsePlanningParams): UseQueryResult<PageResponse<PlanningEntryResponse>>;
// TanStack Query — staleTime 60_000 (NFR performance : "mise en cache des requêtes planning, staleTime 60s")
// queryKey: ["planning", params.date]
// queryFn: () => getPlanning({ date: params.date, page: 0, size: DEFAULT_PAGE_SIZE })
// PAS de `enabled` conditionnel : GET /planning est public, interrogé que l'utilisateur soit connecté ou non
```

`DEFAULT_PAGE_SIZE` réutilisé tel quel depuis `@chapelle/shared/utils` (constante déjà livrée par U0, déjà réutilisée par `useMyBookings` en U1) plutôt que d'introduire une nouvelle constante sans base objective — risque documenté en §9 point ouvert 3 (une journée d'adoration perpétuelle peut dépasser 20 réservations).

Différence avec `component-methods.md` (`usePlanning(params: { date?; page?; size? })`) : la signature ci-dessus masque `page`/`size` à l'appelant (aucune pagination UI en U2, même choix que `useMyBookings` en U1) et rend `date` obligatoire (la page appelante garantit toujours une valeur, initialisée à "aujourd'hui"). Écart mineur assumé, cohérent avec le principe déjà acté en U1 de préciser les signatures au moment de leur implémentation réelle plutôt que de figer `component-methods.md` à la lettre.

---

## 4. Composants calendrier — `CalendrierReservations` / `CalendrierPlanningAdmin`

### 4.1 `components/{agenda,planning}/planningEntries.ts` — mapping pur, sans JSX

Deux fichiers distincts (un par app), **volontairement non factorisés** dans `packages/shared` : la règle d'anonymisation diffère structurellement entre les deux apps (§4.1.1 vs §4.1.2), il ne s'agit pas d'un besoin identique dupliqué mais de deux comportements métier différents.

```typescript
export interface PlanningCalendarEvent {
  id: string;
  start: string;               // entry.dateDebut
  end: string;                 // entry.dateFin
  title: string;
  classNames: string[];        // ex. ["planning-event--mine"]
  extendedProps: {
    roleUtilisateur: UserRole;
    isMine: boolean;
  };
}
```

`PlanningCalendarEvent` est structurellement compatible avec le type `EventInput` de `@fullcalendar/core` (pas de dépendance d'import croisée nécessaire à ce niveau de conception ; le composant calendrier fait la jonction).

#### 4.1.1 `apps/user-app/src/components/agenda/planningEntries.ts`

```typescript
export function mapPlanningEntryToEvent(entry: PlanningEntryResponse): PlanningCalendarEvent;
export function mapPlanningEntriesToEvents(entries: PlanningEntryResponse[]): PlanningCalendarEvent[];

export function filterOwnEntries(entries: PlanningEntryResponse[], userId: string): PlanningEntryResponse[];
```

Règles (US-AGENDA-01/02, `services.md` "Consultation & anonymisation du planning") :
- `title` = `entry.estAnonymise ? "Créneau réservé" : \`${entry.prenomsUtilisateur} ${entry.nomUtilisateur}\``.
- `extendedProps.isMine` = `!entry.estAnonymise`. **Dérivé du même signal backend**, pas d'un second calcul client comparant `idUtilisateur` à l'utilisateur connecté : le composant n'applique toujours "aucune logique d'anonymisation" (`services.md`) — `isMine` ne fait que réutiliser le résultat déjà fourni par le backend pour piloter une seconde intention visuelle (surlignage), sans réévaluer la décision d'anonymisation elle-même. Correct par construction : seule une entrée dont le Veilleur connecté est le créateur peut avoir `estAnonymise=false` sur `/agenda` (règle confirmée en `prompt-frontend-revise.md` §6.1).
- `filterOwnEntries` (US-AGENDA-05, "filtre mes réservations") compare explicitement `entry.idUtilisateur === userId` — filtre distinct de l'anonymisation, appliqué en amont du mapping par `PageAgenda` (§5.3), jamais par le composant calendrier lui-même.

#### 4.1.2 `apps/admin-app/src/components/planning/planningEntries.ts`

```typescript
export function mapPlanningEntryToEvent(entry: PlanningEntryResponse): PlanningCalendarEvent;
export function mapPlanningEntriesToEvents(entries: PlanningEntryResponse[]): PlanningCalendarEvent[];
```

Règle (US-AGENDA-03, portée admin de `unit-of-work.md` : "affichage de toutes les identités sans anonymisation") :
- `title` = `\`${entry.prenomsUtilisateur} ${entry.nomUtilisateur}\`` **toujours**, quelle que soit la valeur de `entry.estAnonymise`. Décision explicite : l'admin-app ignore complètement `estAnonymise` plutôt que de s'y fier comme le fait `user-app` — cf. §9 point ouvert 5 (le comportement réel du backend pour ce rôle reste un risque déjà signalé dans `stories.md`/US-AGENDA-03).
- `extendedProps.isMine` = toujours `false` (pas de mise en évidence "Ma réservation" côté admin — non demandé par US-AGENDA-03).
- Pas de fonction `filterOwnEntries` : hors périmètre admin-app (l'Administrateur voit tout, pas de filtre "mes réservations").

### 4.2 `renderPlanningEvent.tsx` (les deux apps — présentation uniquement)

```typescript
import type { EventContentArg } from "@fullcalendar/core";

export function renderPlanningEvent(arg: EventContentArg): ReactNode;
```

Comportement attendu : affiche `arg.timeText` + `arg.event.title` ; si `arg.event.extendedProps.isMine`, ajoute un `Badge variant="info"` "Ma réservation" (`@chapelle/shared/ui`) — n'affiche jamais de bouton d'action (aucune annulation en U2, cf. §6). Côté admin-app, ajoute en plus un `Badge variant="neutral"` reprenant `roleUtilisateur` (utile pour distinguer un Veilleur d'un Administrateur bénéficiaire d'un coup d'œil).

### 4.3 `CalendrierReservations.tsx` / `CalendrierPlanningAdmin.tsx`

```typescript
export interface CalendrierReservationsProps {
  date: string;                        // yyyy-MM-dd, sert d'`initialDate` FullCalendar
  entries: PlanningEntryResponse[];    // déjà filtrées (user-app : "mes réservations" éventuel) par l'appelant
  isLoading: boolean;                  // premier chargement (query.isLoading) — pas isFetching
}

export default function CalendrierReservations(props: CalendrierReservationsProps): JSX.Element;
```

(`CalendrierPlanningAdmin` : signature identique, sans particularité — `entries` non filtrées côté admin puisqu'il n'existe pas de filtre "mes réservations" sur `/planning`.)

**Export par défaut** (dérogation à la convention `components/*` en export nommé par ailleurs, ex. `ProfileCard`, `MyBookingsList`) : requis par `React.lazy(() => import(...))`, qui attend un module avec `export default` (§4.3.1). Aucun composant n'était lazy-loadé en U0/U1, ce cas ne s'était pas présenté.

Comportement/configuration attendue (prose, pas de corps de fonction) :
- Import statique, en tête de ce seul module, de `@fullcalendar/react`, `@fullcalendar/core` (+ `@fullcalendar/core/locales/fr`), `@fullcalendar/daygrid`, `@fullcalendar/timegrid`.
- `plugins={[dayGridPlugin, timeGridPlugin]}`, `initialView="timeGridDay"`, `initialDate={date}`, `locale={frLocale}`, `headerToolbar={false}` (§5.1 explique pourquoi la navigation intégrée de FullCalendar est désactivée), `height="auto"`, `nowIndicator`, `editable={false}`, `selectable={false}` (pas d'`interactionPlugin` chargé en U2, cf. §0).
- `events={mapPlanningEntriesToEvents(entries)}`, `eventContent={renderPlanningEvent}`.
- `isLoading === true` → le composant rend `<Spinner size="lg" />` **à la place** du calendrier (pas de superposition) : évite de monter un `<FullCalendar/>` vide pendant le tout premier chargement. Les rechargements ultérieurs (`query.isFetching` sans `isLoading`, ex. changement de date déjà en cache mais `staleTime` dépassé) continuent d'afficher les `entries` précédemment connues sans flash — comportement standard TanStack Query, pas de logique supplémentaire à écrire dans ce composant.

#### 4.3.1 Frontière de code-splitting (NFR performance)

`CalendrierReservations`/`CalendrierPlanningAdmin` ne sont **jamais importés statiquement**, ni par `router.tsx`, ni par `PageAgenda.tsx`/`PagePlanning.tsx` :

```typescript
// PageAgenda.tsx / PagePlanning.tsx
const CalendrierReservations = lazy(() => import("../components/agenda/CalendrierReservations"));
```

`router.tsx` continue d'importer `PageAgenda`/`PagePlanning` de façon statique (aucun changement de style d'import par rapport à U1, cf. §7) : ces pages restent de petits composants d'orchestration (état + hooks) qui ne réexportent ni ne réimportent FullCalendar. C'est le `lazy()` posé dans la page elle-même qui matérialise la frontière de chunk : le bundle initial de `/agenda` et `/planning` ne contient FullCalendar que lorsque `<Suspense>` déclenche effectivement le rendu du calendrier. Ceci satisfait à la fois la contrainte de la tâche ("FullCalendar en import dynamique/lazy dans le composant calendrier, pas de chargement statique du bundle") et l'exigence NFR ("Code-splitting obligatoire pour AgendaPage/PlanningPage").

---

## 5. Filtres et pages d'orchestration

### 5.1 `FiltreDatePlanning.tsx` (les deux apps, dupliqué — petit composant de présentation)

```typescript
export interface FiltreDatePlanningProps {
  value: string;                    // yyyy-MM-dd
  onChange: (value: string) => void;
}

export function FiltreDatePlanning(props: FiltreDatePlanningProps): JSX.Element;
```

Un `Input type="date"` (`@chapelle/shared/ui`) + un bouton "Aujourd'hui" (`onChange(toISODateString(new Date()))`). C'est l'**unique** source de vérité de la date affichée (US-AGENDA-04, "sélecteur de période") : la navigation prev/next/today intégrée de FullCalendar est désactivée (`headerToolbar={false}`, §4.3) pour éviter deux sources de vérité concurrentes pour la même donnée. Pas de composant partagé dans `packages/shared/ui` : besoin trivial (un `Input` générique déjà exporté suffit à l'implémenter), aucune abstraction supplémentaire justifiée à ce stade.

### 5.2 `FiltreMesReservations.tsx` (user-app uniquement)

```typescript
export interface FiltreMesReservationsProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function FiltreMesReservations(props: FiltreMesReservationsProps): JSX.Element;
```

Une case à cocher (`Input type="checkbox"`, libellé "Mes réservations uniquement"). Rendue uniquement si `role === UserRole.VEILLEUR` — condition portée par `PageAgenda` (§5.3), pas par ce composant lui-même (même pattern que `{role === UserRole.VEILLEUR && <MyBookingsList .../>}` dans `PageMonCompte`, U1).

### 5.3 `pages/PageAgenda.tsx` (user-app)

```typescript
export default function PageAgenda(): JSX.Element;
```

Orchestration attendue (prose) :
- État local : `date` (`string`, initialisé via `toISODateString(new Date())`), `mesReservationsUniquement` (`boolean`, initialisé à `false`).
- `const { role, user } = useAuth();` (U1, non redéfini).
- `const planningQuery = usePlanning({ date });`.
- `const entries = planningQuery.data?.content ?? [];`
- `const visibleEntries = mesReservationsUniquement && user ? filterOwnEntries(entries, user.id) : entries;` — filtre appliqué uniquement si Veilleur (la case à cocher n'est de toute façon rendue que pour ce rôle, `user` est alors non nul).
- Rendu : titre, `FiltreDatePlanning`, `{role === UserRole.VEILLEUR && <FiltreMesReservations checked={...} onChange={...} />}`, puis `<Suspense fallback={<Spinner size="lg" />}><CalendrierReservations key={date} date={date} entries={visibleEntries} isLoading={planningQuery.isLoading} /></Suspense>`.
- `key={date}` sur `CalendrierReservations` : force un remontage complet de l'instance FullCalendar interne à chaque changement de date, ce qui réinitialise proprement `initialDate` sans recourir à une ref imperative (`calendarRef.current.getApi().gotoDate(...)`) — plus simple et strictement suffisant puisque FullCalendar n'a ici aucun état interne à préserver entre deux dates (pas de sélection en cours, lecture seule).

Route publique (`PublicLayout`, non protégée) : `useAuth()` fonctionne indifféremment connecté/non connecté (`user`/`role` valent `null` pour un visiteur anonyme, `usePlanning` n'a pas de garde `enabled`).

### 5.4 `pages/PagePlanning.tsx` (admin-app)

```typescript
export default function PagePlanning(): JSX.Element;
```

Identique à `PageAgenda` en plus simple : pas de `mesReservationsUniquement`, pas de `useAuth()` nécessaire au-delà de ce que `ProtectedRoute` a déjà vérifié en amont dans `router.tsx` (§7.2). État local : `date` uniquement. Rendu : titre, `FiltreDatePlanning`, `<Suspense fallback={<Spinner size="lg" />}><CalendrierPlanningAdmin key={date} date={date} entries={entries} isLoading={planningQuery.isLoading} /></Suspense>`.

---

## 6. Point d'extension pour U3 (réservation / annulation) — non implémenté ici

`unit-of-work.md` : "U3 bloqué par U2 : les actions de réservation s'accrochent au composant calendrier". Ce plan documente précisément le point d'ancrage sans l'implémenter :

- U3 ajoutera l'import dynamique d'`@fullcalendar/interaction` (`interactionPlugin`) **dans le même module** `CalendrierReservations.tsx`/`CalendrierPlanningAdmin.tsx` (pas de nouveau composant de calendrier — U3 étend celui-ci).
- U3 ajoutera deux props **optionnelles** à `CalendrierReservationsProps`/l'équivalent admin :
  - `onSelectSlot?: (info: DateSelectArg) => void` — branchée sur la prop FullCalendar `select` (nécessite aussi `selectable={true}`) ; ouvre `ReservationForm`/`ReservationConfirmModal` sur une plage libre (US-RESA-01/02/05).
  - `onEventClick?: (info: EventClickArg) => void` — branchée sur `eventClick` ; ouvre l'action d'annulation sur "Ma réservation" (US-ANNUL-01/04) ou, côté admin, sur n'importe quelle réservation (US-ANNUL-03).
- Ces deux props sont absentes par défaut (`undefined` → `selectable`/`eventClick` inopérants) : le comportement de lecture seule livré par U2 reste inchangé tant que U3 ne les fournit pas depuis `PageAgenda`/`PagePlanning`. Aucun des tests écrits en U2 sur ces composants n'a donc à être modifié par U3.
- `usePlanning`, `getPlanning`, `planningEntries.ts` (mapping/filtre) restent inchangés par U3 : les mutations (`useCreateBooking`/`useCancelBooking`) invalideront la queryKey `["planning"]` (cf. `services.md`, "Réservation / Annulation") pour déclencher un refetch, sans toucher au contrat de lecture posé par U2.

---

## 7. Routeur — modifications ponctuelles (les deux apps)

Conformément à la convention actée en U1 (§5.3 de sa conception) : U2 ne recrée pas `router.tsx`, il remplace uniquement l'`element` des routes marquées `// U2`/`// U2/U3`.

### 7.1 `apps/user-app/src/router.tsx`

```diff
- { path: "/agenda", element: <PagePlaceholder title="Agenda" /> }, // U2
+ { path: "/agenda", element: <PageAgenda /> },
```

Import ajouté : `import PageAgenda from "./pages/PageAgenda";`. La route reste dans le groupe `PublicLayout` (non protégée) — aucun changement de position dans l'arbre de routes.

### 7.2 `apps/admin-app/src/router.tsx`

```diff
  {
    path: "/planning",
    element: (
      <ProtectedRoute allowedRoles={ADMIN_ROLES}>
-       <PagePlaceholder title="Planning" /> {/* U2/U3 */}
+       <PagePlanning />
      </ProtectedRoute>
    ),
  },
```

Import ajouté : `import PagePlanning from "./pages/PagePlanning";`. `ProtectedRoute`/`ADMIN_ROLES` inchangés (déjà correctement positionnés par U1) — U2 n'a aucune garde de rôle supplémentaire à ajouter, `/planning` est déjà réservée à `[ADMINISTRATEUR, SUPERADMINISTRATEUR]`.

Dans les deux fichiers, l'import de `PagePlaceholder` est conservé (encore utilisé par les autres routes hors périmètre de U2).

---

## 8. Dépendances et respect des frontières (`component-dependency.md`)

Aucune dérogation à la règle fondamentale : `planning.ts`/`usePlanning.ts`/les composants calendrier de `user-app` ne dépendent que de `@chapelle/shared/{types,api,ui,utils}` et de FullCalendar (dépendance externe, pas `packages/shared`) — jamais de `apps/admin-app`, et réciproquement. `planningEntries.ts` des deux apps ont une forme quasi identique mais un contenu métier différent (§4.1) : duplication assumée, pas de fuite de logique entre apps.

---

## 9. Points ouverts pour l'orchestrateur

1. **Vue calendrier unique ("jour") plutôt que vue mois/semaine** : le contrat backend (`GET /api/v1/planning?date=&pageable=`, un seul paramètre `date` optionnel, pas de plage `from`/`to`) ne permet de récupérer que le planning d'**un seul jour** à la fois. Ce plan retient donc une vue FullCalendar unique en `timeGridDay`, navigable exclusivement via `FiltreDatePlanning` (§5.1), et charge `dayGridPlugin` par anticipation d'une vue mois future sans l'exposer dans l'UI de U2. Alternative rejetée : une vue mois dès U2, qui exigerait soit un endpoint de plage absent du swagger, soit N appels séquentiels (un par jour visible dans le mois) — jugé hors de portée d'une unité de consultation. À confirmer que l'UX "un jour à la fois" est acceptable en l'état.

2. ~~Noms exacts des paquets FullCalendar sur le registre npm~~ — **tranché** : vérifié en direct sur le registre npm (cf. §0). Versions exactes retenues : `@fullcalendar/{react,core,daygrid,timegrid}@6.1.21`, seule combinaison mutuellement compatible (le tag `latest` de `react`/`core` pointe vers une v7.1.0 incompatible avec `daygrid`/`timegrid`, qui n'ont pas de version 7 stable). Compatibilité peer avec React 19.2 confirmée pour `@fullcalendar/react@6.1.21`.

3. **Taille de page unique (`DEFAULT_PAGE_SIZE = 20`) pour le planning d'une journée entière** : repris par cohérence avec `useMyBookings` (U1), mais une chapelle d'adoration perpétuelle peut aligner plus de 20 réservations sur une seule journée (créneaux demi-heure/heure sur 24h) — les entrées au-delà de la première page seraient alors silencieusement absentes du calendrier, sans indication à l'utilisateur. Alternative non retenue faute de base objective sur la granularité réelle des créneaux : augmenter la taille de page (ex. 100) ou ajouter une pagination réelle (`Pagination` de `@chapelle/shared/ui`) au sein même de la vue jour. À trancher avec la volumétrie réelle attendue.

4. **"Voir le détail d'une réservation"** (mentionné dans `prompt-frontend-revise.md` §7.1 parmi les actions génériques de la route `/agenda`, mais absent des critères Gherkin US-AGENDA-01 à 05) : ce plan le considère hors périmètre strict de U2 et le regroupe avec le branchement `onEventClick` de U3 (§6), plutôt que d'ajouter une popover de détail non mutante dès maintenant. À confirmer que ce n'est pas une régression de périmètre attendu pour U2.

5. **`estAnonymise` ignoré côté admin-app** (§4.1.2) : décision explicite d'afficher systématiquement l'identité sur `/planning`, sans jamais lire la valeur réelle d'`estAnonymise` renvoyée pour les rôles Administrateur/SuperAdministrateur — risque déjà signalé dans `stories.md` (US-AGENDA-03 : "comportement à confirmer en recette selon la valeur réelle d'`estAnonymise` renvoyée à ce rôle"). Si le backend renvoie malgré tout `estAnonymise=true` pour certaines entrées consultées par un Administrateur, ce choix les affiche quand même en clair, conformément à la user story mais en s'écartant strictement du signal backend — à valider en recette.

6. **Absence de `date` dans `GET /planning`** : paramètre optionnel selon le swagger (comportement par défaut du backend non documenté — probablement "aujourd'hui", non confirmé), mais ce plan impose toujours une date explicite calculée côté frontend (`toISODateString(new Date())` à l'initialisation de `PageAgenda`/`PagePlanning`) et n'exploite jamais l'omission du paramètre. Comportement du backend en l'absence de `date` non testé par cette conception.

7. **Accessibilité du calendrier (WCAG 2.1 AA, NFR)** : FullCalendar fournit un support ARIA de base, mais ce plan ne prescrit pas de vue tabulaire alternative pour les lecteurs d'écran en complément du rendu graphique. À évaluer lors des tests d'accessibilité dédiés (hors périmètre de cette conception).
