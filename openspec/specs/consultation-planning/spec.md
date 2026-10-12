# Spec — consultation-planning

> Première spec vivante pour cette capacité (aucune n'existait avant — l'implémentation
> `PageAgenda.tsx`/`PagePlanning.tsx`, `usePlanning`, `CalendrierReservations`/
> `CalendrierPlanningAdmin` existait déjà mais n'avait jamais été graduée). Documente à la fois le
> comportement pré-existant (mode "Jour") et le nouveau comportement (modes "Mois"/"Intervalle" +
> sélecteur de mois `react-datepicker`).

## Vue d'ensemble

Deux pages affichent le planning d'adoration via FullCalendar, alimentées par des filtres placés
au-dessus du calendrier :
- `user-app` : `/agenda` (publique, actions de réservation conditionnées au rôle)
- `admin-app` : `/planning` (Administrateur/SuperAdministrateur, toutes identités visibles)

Les deux pages partagent la même structure (composants dupliqués intentionnellement entre les deux
apps, pas de package partagé pour ces composants) :
`FiltreDatePlanning` (filtres) → `usePlanning` (hook de données) → `Calendrier{Reservations,
PlanningAdmin}` (rendu FullCalendar).

## Modes de consultation

L'utilisateur choisit un mode via un `Select` ("Vue") au-dessus du calendrier. Changer de mode
calcule immédiatement une valeur par défaut sensée pour le nouveau mode et déclenche une nouvelle
requête — jamais d'état à moitié initialisé.

Type central (`hooks/planningPeriode.ts`, dupliqué dans les deux apps) :
```ts
type PlanningPeriode =
  | { mode: "jour"; date: string }                    // yyyy-MM-dd
  | { mode: "mois"; annee: number; mois: number }     // mois 1-12
  | { mode: "intervalle"; dateDebut: string; dateFin: string }; // yyyy-MM-dd, bornes incluses
```

### Mode Jour
- Contrôle : `<Input type="date">` + bouton "Aujourd'hui".
- Source de données : `GET /planning?date=` (endpoint historique, un seul jour).
- Vue FullCalendar : `timeGridDay`.

### Mode Mois
- Contrôle : sélecteur `react-datepicker` (`showMonthYearPicker`, locale française via
  `registerLocale("fr", fr)` de `date-fns/locale/fr`) + bouton "Ce mois-ci". Rendu dans un portail
  React (`portalId="datepicker-portal"`, attaché à `document.body`) — nécessaire pour que le popup
  se peigne au-dessus de la grille FullCalendar plutôt que derrière (voir "Limitations connues").
- Source de données : `GET /planning/mensuel?annee=&mois=`.
- Vue FullCalendar : `dayGridMonth`.

### Mode Intervalle
- Contrôle : deux `<Input type="date">` (début/fin), avec état local (brouillon) : la valeur n'est
  propagée au parent (et ne déclenche une requête) que lorsque la combinaison est valide.
- Validation client (`validateIntervalle`, exportée et testable) : les deux dates sont requises,
  `dateFin >= dateDebut`, et l'écart ne doit pas dépasser `MAX_INTERVALLE_JOURS` (31, bornes
  incluses) — en complément du rejet 422 backend, pour éviter un aller-retour réseau inutile.
  Comptage identique au backend (vérifié empiriquement contre l'API : un intervalle de 31 jours
  inclus passe, 32 jours est rejeté).
- Source de données : `GET /planning/intervalle?dateDebut=&dateFin=`.
- Vue FullCalendar : vue `dayGrid` custom à durée dynamique (`duration: { days: N }`, `N` calculé
  via `diffJoursInclusif`), recréée par remount complet (`key={periodeCacheKey(periode)}` sur le
  composant Calendrier) à chaque changement de période — FullCalendar traite `initialView`/
  `initialDate`/`views` comme des props "initial-only", ignorées après le montage.

## Récupération des données (`api/endpoints/planning.ts`, `usePlanning`)

- `usePlanning(periode: PlanningPeriode)` dispatch vers le bon endpoint selon `periode.mode`.
  `queryKey: ["planning", periodeCacheKey(periode)]` (TanStack Query, `staleTime: 60s`).
- `getPlanning` (mode jour) : appel simple, une page (`DEFAULT_PAGE_SIZE`, 20).
- `getPlanningMensuel`/`getPlanningIntervalle` : **agrégation multi-pages côté client**
  (`fetchAllPlanningPages`) — appelle l'endpoint backend en boucle (taille de page interne 100)
  jusqu'à épuisement (`last: true`), puis fusionne tout le contenu en une seule réponse. Décision
  motivée par le risque métier d'une page tronquée sur un calendrier (créneau existant invisible).

## Limitations connues (documentées, non bloquantes)

- **Troncature silencieuse au-delà de 5000 créneaux** : `fetchAllPlanningPages` s'arrête après
  `PLANNING_AGGREGATE_MAX_PAGES` (50) pages de 100, comme garde-fou anti-boucle infinie si `last`
  ne devient jamais vrai (régression backend). Au-delà, le résultat serait tronqué sans signal
  visible. Jugé sans impact pratique pour le volume réel d'une chapelle sur une fenêtre de 31 jours
  maximum ; à revisiter si ce volume devait un jour être atteint.
- **`resolveCalendarConfig` (mode intervalle) ne se protège pas explicitement contre une durée
  ≤ 0** : précondition implicite garantie par `validateIntervalle` en amont (seul point d'écriture
  de `periode` en mode intervalle dans les pages actuelles) — resterait un risque si un futur appel
  contournait ce filtre (ex. navigation programmatique, lien profond).
- **`draftIntervalle` (état local du mode Intervalle)** ne se resynchronise que sur changement de
  `mode`, pas si `dateDebut`/`dateFin` étaient modifiées par le parent en restant en mode
  intervalle — non exploité aujourd'hui (`FiltreDatePlanning` est la seule source d'écriture), à
  garder en tête si un contrôle externe du filtre est ajouté plus tard.
- **Portail + z-index du sélecteur de mois** : le popup `react-datepicker` (mode "Mois") doit être
  rendu via `portalId` et `.react-datepicker-popper` doit rester en `z-index: 50 !important` dans
  `packages/shared/src/ui/react-datepicker-overrides.css` — sans ces deux éléments, le popup se
  peint derrière la grille FullCalendar et la sélection de mois devient impossible en pratique (bug
  réel constaté, non détectable par les tests automatisés jsdom qui ne simulent pas la peinture/
  l'empilement CSS réels).

## Affichage des créneaux (`renderPlanningEvent`)

Composant dupliqué intentionnellement dans les deux apps (`apps/user-app/src/components/agenda/
renderPlanningEvent.tsx`, `apps/admin-app/src/components/planning/renderPlanningEvent.tsx`), même
raison que le reste de cette spec (pas de package partagé pour ces composants).

### Plage horaire affichée

WHEN le mode est "Mois" ou "Intervalle" (vue FullCalendar différente de `timeGridDay`) THEN l'heure
affichée sur le créneau est la plage complète `HH:mm – HH:mm` (début **et** fin), calculée depuis
`arg.event.start`/`arg.event.end` (`formatTime`, fuseau Europe/Paris) — pas seulement le début
(`arg.timeText` fourni par défaut par FullCalendar).

WHEN le mode est "Jour" (`timeGridDay`) THEN l'heure affichée reste `arg.timeText` (début seul) : la
grille horaire rend déjà visuellement la durée du créneau, afficher la plage en texte serait redondant.

WHY : un créneau d'adoration reste toujours sur un seul jour calendaire (garanti côté backend), donc
aucune variante de format `dd/MM` n'est nécessaire pour distinguer un éventuel chevauchement de
minuit.

### Surlignage "Ma réservation" (`user-app` uniquement)

WHEN `extendedProps.isMine` est vrai (`user-app` uniquement — toujours `false` côté `admin-app`, cf.
Hors périmètre) THEN le créneau est surligné visuellement : fond `gold-100`/bordure `gold-400`
(`.fc-event.planning-event--mine`, `packages/shared/src/ui/fullcalendar-overrides.css`, importé
uniquement par `apps/user-app/src/index.css`), en complément du badge texte « Ma réservation »
existant (la couleur seule ne suffit pas comme signal d'accessibilité — WCAG 1.4.1).

### Surlignage de tous les créneaux réservés en vue Mois (`user-app` et `admin-app`)

WHEN le mode est "Mois" (`dayGridMonth`) THEN chaque créneau affiché — quel que soit son propriétaire,
anonymisé ou non — est encadré visuellement (fond `gold-100`/bordure `gold-400`), pour distinguer au
premier coup d'œil les créneaux réservés des jours vides dans la grille du mois. But : lisibilité de
la densité de réservations sur le mois, pas un signal propre à l'utilisateur connecté (contrairement à
"Ma réservation" ci-dessus).

Implémentation : règle CSS scopée à la vue (`.fc-dayGridMonth-view .fc-event`,
`packages/shared/src/ui/fullcalendar-overrides.css`), s'appuyant sur la classe que FullCalendar pose
lui-même sur le conteneur de la vue active (`.fc-view.fc-dayGridMonth-view`) — aucune donnée par
créneau n'est nécessaire, donc aucun changement dans `mapPlanningEntryToEvent`/
`mapPlanningEntriesToEvents` ni dans `planningEntries.ts`. Jamais actif en vue "Jour"
(`fc-timeGridDay-view`) ni "Intervalle" (vue `dayGrid` custom, classe de vue différente) : seule la
vue Mois est concernée.

Un créneau qui est à la fois "Ma réservation" et affiché en vue Mois cumule les deux règles CSS (même
déclarations, pas de conflit visuel) ; le badge texte « Ma réservation » reste le seul signal qui
distingue ce créneau des autres dans cette vue.

## Hors périmètre de cette spec

- Format de date à la création d'une réservation (`CreateBookingRequest.dateDebut`/`dateFin`) :
  voir `openspec/specs/reservation-adoration/spec.md`.
- Anonymisation des identités selon le rôle consultant, actions de réservation/annulation sur le
  calendrier : comportement déjà en place, non modifié par cette spec, non détaillé ici plus avant
  faute de spec source dédiée existante — cf. code (`mapPlanningEntriesToEvents`)
  et `aidlc-docs/construction/plans/u2-agenda-planning-design.md`/`u3-reservation-annulation-design.md`.
- Badge rôle/« Ma réservation » (texte), titre du créneau (identité ou "Créneau réservé") : rendu déjà
  en place, non modifié par ce qui précède, cf. code.
