# Proposition — agenda-planning-vue-semaine

## Why
Seuls les modes "Jour" (un seul jour, grille horaire) et "Mois" (grille de cellules) sont
sélectionnables aujourd'hui sur `/agenda` (user-app) et `/planning` (admin-app) — le mode
"Intervalle" existe en code mais est volontairement caché du sélecteur (cf.
`openspec/specs/consultation-planning/spec.md`, "Mode Intervalle"). L'utilisateur souhaite une vue
"Semaine", dans les deux espaces.

## Décision de style confirmée avec l'utilisateur
Grille horaire native FullCalendar (`timeGridWeek`) — 7 colonnes (Lun–Dim) avec les heures en
lignes, même esprit que la vue "Jour" actuelle (`timeGridDay`) mais sur 7 jours, plutôt qu'une
grille de cellules façon Mois/Intervalle compressée sur une semaine.

## What Changes

### Type central (`hooks/planningPeriode.ts`, dupliqué dans les deux apps)
- Nouvelle variante `{ mode: "semaine"; dateDebut: string }` — `dateDebut` est **toujours le lundi**
  de la semaine affichée (yyyy-MM-dd) ; `dateFin` (dimanche) n'est jamais stocké, toujours dérivé
  (`dateDebut + 6 jours`) au point d'usage (requête réseau, config calendrier).
- `periodeCacheKey` : nouveau cas `semaine:${dateDebut}`.

### Récupération des données (`usePlanning`, `api/endpoints/planning.ts`)
- **Aucun nouvel endpoint backend** : réutilise `GET /planning/intervalle?dateDebut=&dateFin=` (déjà
  implémenté, déjà utilisé par le mode Intervalle cf. `getPlanningIntervalle`/
  `fetchAllPlanningPages`) — une semaine (7 jours) est un cas particulier d'intervalle, toujours
  largement sous le plafond `MAX_INTERVALLE_JOURS` (31). `usePlanning` dispatch "semaine" vers ce
  même chemin, avec `dateFin` calculé.

### Vue FullCalendar (`resolveCalendarConfig`, `Calendrier{Reservations,PlanningAdmin}.tsx`)
- Nouveau cas : `{ initialView: "timeGridWeek", initialDate: periode.dateDebut, views: undefined }`
  — vue **native** FullCalendar (déjà incluse dans `timeGridPlugin`, déjà importé pour le mode
  Jour), donc pas de mécanisme de durée dynamique custom comme pour Intervalle (`dayGrid` + `views`
  + remount). Le remount complet sur changement de période (`key={periodeCacheKey(periode)}`)
  s'applique comme pour tous les autres modes.
- Locale française (`frLocale`, déjà utilisée) : semaine Lundi–Dimanche par défaut — cohérent avec
  `dateDebut` toujours calculé comme un lundi.

### Affichage des créneaux (`renderPlanningEvent`)
- Heure affichée : **`arg.timeText` (début seul)**, comme en vue "Jour" — pas la plage
  `HH:mm – HH:mm` utilisée pour Mois/Intervalle. Condition actuelle
  (`arg.view.type !== "timeGridDay" ? plage : arg.timeText`) étendue pour traiter `"timeGridWeek"`
  comme `"timeGridDay"` (grille horaire : la hauteur du bloc montre déjà la durée, afficher la plage
  en texte serait redondant — même raisonnement déjà documenté pour "Jour").

### Contrôle (`FiltreDatePlanning.tsx`, dupliqué dans les deux apps)
- Nouvelle option `{ value: "semaine", label: "Semaine" }` dans `MODE_OPTIONS`, entre "Jour" et
  "Mois" (ordre croissant de granularité : Jour → Semaine → Mois).
- Contrôle : un seul `<Input type="date">` (n'importe quel jour) + bouton "Cette semaine" — même
  pattern minimal que le mode "Jour" (`<Input>` + bouton unique), pas de boutons
  précédent/suivant : cohérent avec la décision déjà prise pour tous les modes existants de
  désactiver la navigation intégrée de FullCalendar (`headerToolbar={false}`, "une seule source de
  vérité pour la période affichée") et de n'exposer qu'un filtre externe minimal.
- Quand l'utilisateur choisit une date (n'importe quel jour de la semaine visée) ou clique "Cette
  semaine", le composant calcule le **lundi** de la semaine correspondante (nouvelle fonction pure
  `lundiDeLaSemaine(dateISO): string`, `packages/shared/src/utils/formatters.ts` — **partagée, pas
  dupliquée** : même catégorie que `diffJoursInclusif`/`toISODateString`, déjà partagées ; seule la
  logique *de composant* comme `validateIntervalle` est dupliquée par app) et c'est ce lundi qui est
  stocké/affiché dans l'`<Input>` (comportement de normalisation, même esprit que le mode "Mois" qui
  normalise toujours au 1er du mois affiché).

## Hors périmètre (explicite)
- **Pas de boutons "Semaine précédente"/"Semaine suivante"** — cf. raisonnement ci-dessus
  (cohérence avec l'absence de navigation prev/next sur tous les modes existants).
- **Pas d'extension du surlignage "tous les créneaux réservés" (gold, actuellement scopé à
  `.fc-dayGridMonth-view`)** à la vue Semaine — cette fonctionnalité a été demandée et scoppée
  explicitement à la vue Mois (`openspec/changes/archive/2026-10-12-planning-mois-surlignage-creneaux/`).
  Le surlignage "Ma réservation" (`.planning-event--mine`), lui, n'est pas scopé par vue et
  s'appliquera donc normalement en Semaine sans changement.
- **Mode "Intervalle"** reste caché du sélecteur (hors périmètre, cf. proposition dédiée) — la
  nouvelle option "Semaine" ne le réactive pas.

## Impact
- Affected specs : `consultation-planning` (nouveau mode, section "Modes de consultation").
- Affected code (les deux apps, structure dupliquée) :
  - `apps/{user-app,admin-app}/src/hooks/planningPeriode.ts`
  - `apps/{user-app,admin-app}/src/api/endpoints/planning.ts`, `hooks/usePlanning.ts`
  - `apps/user-app/src/components/agenda/{CalendrierReservations.tsx,renderPlanningEvent.tsx,FiltreDatePlanning.tsx}`
  - `apps/admin-app/src/components/planning/{CalendrierPlanningAdmin.tsx,renderPlanningEvent.tsx,FiltreDatePlanning.tsx}`
  - `packages/shared/src/utils/formatters.ts` (+ test) : nouvelle fonction `lundiDeLaSemaine`.
- Pas de breaking change, pas de changement backend nécessaire — présentation et agrégation de
  données déjà existante, réutilisées.
