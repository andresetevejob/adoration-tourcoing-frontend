# Proposition — planning-filtres-vue-periode

## Contexte

Aucune spec vivante n'existe encore pour la capacité "consultation du planning" : la change
`openspec/changes/consultation-planning/` (U2) a déjà été implémentée en pratique
(`PageAgenda.tsx`, `PagePlanning.tsx`, `FiltreDatePlanning`, `usePlanning`, `CalendrierReservations`/
`CalendrierPlanningAdmin` existent et fonctionnent) mais n'a jamais été graduée vers
`openspec/specs/`. Cette proposition documentera donc, à la graduation (étape 4), le comportement
actuel (vue "jour" unique) ET le nouveau comportement (vue jour/mois/intervalle) dans
`openspec/specs/consultation-planning/spec.md` créé à cette occasion.

Aucun conflit détecté avec les autres changes ouvertes : `reservation-adoration` (change ouverte,
U3) touche `ReservationForm`/`useBookings`/`bookings.ts`, des fichiers disjoints de ceux touchés
ici.

## Why

Aujourd'hui, `GET /planning?date=` (un seul jour) est le seul mode de consultation disponible côté
frontend, dans les deux apps. Le swagger backend expose désormais deux endpoints supplémentaires :
- `GET /planning/mensuel?annee=&mois=` — planning d'un mois
- `GET /planning/intervalle?dateDebut=&dateFin=` — planning sur un intervalle libre (backend
  rejette en 422 tout intervalle > 31 jours)

L'utilisateur souhaite pouvoir choisir, via des filtres placés au-dessus du calendrier FullCalendar
(user-app `/agenda` ET admin-app `/planning`), le mode de consultation : jour unique, mois, ou
intervalle libre (≤ 31 jours) — et voir l'affichage du calendrier s'adapter en conséquence.

## What Changes

- **Nouveau sélecteur de mode** (remplace `FiltreDatePlanning` actuel, ou l'étend) : trois modes
  "Jour" / "Mois" / "Intervalle", chacun avec son propre contrôle de saisie (`<input type="date">`,
  `<input type="month">`, deux `<input type="date">` pour l'intervalle). Composant dupliqué dans
  les deux apps (`apps/user-app/src/components/agenda/`, `apps/admin-app/src/components/planning/`),
  comme le reste des composants planning existants (pas de package partagé pour ces composants
  aujourd'hui — cohérent avec l'état actuel, non remis en cause ici).
- **Validation client de la borne 31 jours** sur le mode "Intervalle" (message d'erreur + blocage
  de soumission), en complément du 422 backend — évite un aller-retour réseau inutile pour une
  erreur détectable côté client.
- **Nouveaux endpoints côté `api/endpoints/planning.ts`** (les deux apps) : `getPlanningMensuel`
  et `getPlanningIntervalle`, en plus de `getPlanning` existant (inchangé).
- **`usePlanning` évolue** pour accepter un mode (`{ mode: "jour"; date }` |
  `{ mode: "mois"; annee; mois }` | `{ mode: "intervalle"; dateDebut; dateFin }`) et appeler le bon
  endpoint — la `queryKey` doit refléter le mode + les paramètres pour un cache TanStack Query
  correct.
- **`CalendrierReservations`/`CalendrierPlanningAdmin`** : la vue FullCalendar affichée doit
  correspondre au mode sélectionné (jour → `timeGridDay` inchangé ; mois → `dayGridMonth` ;
  intervalle → vue calquée sur `dayGridMonth`/`dayGrid` avec une durée dynamique égale au nombre de
  jours sélectionnés). Détail exact du mapping de vue laissé à la conception détaillée
  (`api-architect`, Construction).
- **Pagination** : `getPlanningMensuel`/`getPlanningIntervalle` sont paginés côté backend
  (`Pageable`) comme `getPlanning` ; un mois ou un intervalle de 31 jours peut dépasser
  `DEFAULT_PAGE_SIZE` (20) en nombre de créneaux. Stratégie de récupération complète (taille de
  page augmentée, ou agrégation de plusieurs pages) à trancher en conception détaillée.

## Impact

- Affected specs : `consultation-planning` (nouvelle, créée à la graduation — aucune spec
  existante à modifier via patch).
- Affected code :
  - `apps/user-app/src/components/agenda/FiltreDatePlanning.tsx` (+ test)
  - `apps/user-app/src/hooks/usePlanning.ts` (+ test)
  - `apps/user-app/src/api/endpoints/planning.ts` (+ test)
  - `apps/user-app/src/components/agenda/CalendrierReservations.tsx` (+ test)
  - `apps/user-app/src/pages/PageAgenda.tsx` (+ test)
  - `apps/admin-app/src/components/planning/FiltreDatePlanning.tsx` (+ test)
  - `apps/admin-app/src/hooks/usePlanning.ts` (+ test)
  - `apps/admin-app/src/api/endpoints/planning.ts` (+ test)
  - `apps/admin-app/src/components/planning/CalendrierPlanningAdmin.tsx` (+ test)
  - `apps/admin-app/src/pages/PagePlanning.tsx` (+ test)
- Dépend de : `consultation-planning` (base, déjà implémentée), `socle-frontend`.
- Ne bloque aucune autre capacité ouverte (`reservation-adoration` touche des fichiers disjoints).

## Décisions déjà tranchées avec l'utilisateur

- Récupération des données : trois endpoints backend dédiés existent déjà (jour/mois/intervalle),
  aucune agrégation côté client n'est nécessaire.
- Périmètre : les deux apps (user-app `/agenda` et admin-app `/planning`) reçoivent les trois modes.

## Points laissés à la conception détaillée (api-architect, Construction)

- Mapping exact vue FullCalendar ↔ mode (notamment la vue "intervalle" à durée variable).
- Stratégie de pagination pour mois/intervalle (taille de page vs agrégation multi-pages).
- Forme exacte du composant remplaçant `FiltreDatePlanning` (un seul composant avec état interne de
  mode, ou composition de sous-composants par mode).

## Amendement — sélecteur de mois avec navigation calendaire (2026-09-29)

Retour utilisateur après une première implémentation : le mode "Mois" basé sur
`<input type="month">` natif est jugé trop basique (rendu très inégal selon les navigateurs — pas
de bug fonctionnel, `min`/`max` non restreints, mais expérience de sélection pauvre). Décision de
remplacer ce contrôle par une UI de sélection mois/année avec navigation visuelle (précédent/suivant
+ grille de mois).

**Nouvelle dépendance** : `react-datepicker` (^9.x), ajoutée aux deux apps (`apps/user-app`,
`apps/admin-app`), utilisée en mode `showMonthYearPicker` (sélection mois/année uniquement, sans
jour). Choix motivé par :
- Support natif d'un mode "mois/année uniquement" (`showMonthYearPicker`), correspondant
  exactement au besoin — pas de détournement d'un composant "jour" via personnalisation lourde.
- Ships ses propres types TypeScript (pas de `@types/react-datepicker` nécessaire, package séparé
  obsolète/redondant avec les types inclus depuis la v9).
- Compatible React 19 (peer range `^16.9 || ^17 || ^18 || ^19`), aligné avec `react@19.2.6` déjà en
  place dans les deux apps.
- Dépendances transitives propres (`date-fns@^4`, `clsx`, `@floating-ui/react`), `date-fns-tz`
  listée en peer optionnelle (non utilisée ici, pas de gestion de fuseau horaire dans ce sélecteur).

Alternative écartée : composant `MonthPicker` maison (sans nouvelle dépendance) — envisagée
initialement pour rester cohérent avec le reste du kit UI 100% maison (`packages/shared/src/ui`,
aucune dépendance externe actuellement), mais l'utilisateur a explicitement préféré la solution
bibliothèque pour la rapidité de livraison et la robustesse d'un composant déjà éprouvé.

**Impact supplémentaire** :
- `apps/{user-app,admin-app}/package.json` : ajout de `react-datepicker` aux dépendances.
- `apps/{user-app,admin-app}/src/components/{agenda,planning}/FiltreDatePlanning.tsx` : le contrôle
  du mode "Mois" (actuellement `<Input type="month">`) est remplacé par `<ReactDatePicker
  showMonthYearPicker dateFormat="MM/yyyy" ...>`, la conversion `Date` ↔ `{annee, mois}` reste
  interne au composant (pas de changement du type `PlanningPeriode` ni de `usePlanning`).
- CSS de `react-datepicker` (`react-datepicker/dist/react-datepicker.css`) à importer une fois par
  app — point d'attention pour `code-reviewer` : vérifier la cohérence visuelle avec le thème
  Tailwind existant (`theme.css` de `packages/shared/src/ui`), un surcharge de style minimale sera
  probablement nécessaire.
- Aucun changement des modes "Jour"/"Intervalle", ni des endpoints, hooks, ou composants
  Calendrier* déjà livrés.
