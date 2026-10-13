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
  | { mode: "semaine"; dateDebut: string }            // yyyy-MM-dd, toujours un lundi
  | { mode: "mois"; annee: number; mois: number }     // mois 1-12
  | { mode: "intervalle"; dateDebut: string; dateFin: string }; // yyyy-MM-dd, bornes incluses
```

### Mode Jour
- Contrôle : `<Input type="date">` + bouton "Aujourd'hui".
- Source de données : `GET /planning?date=` (endpoint historique, un seul jour).
- Vue FullCalendar : `timeGridDay`.

### Mode Semaine
- Contrôle : un seul `<Input type="date">` (n'importe quel jour de la semaine visée) + bouton
  "Cette semaine". Pas de boutons précédent/suivant — cohérent avec l'absence de navigation
  intégrée FullCalendar sur tous les modes (`headerToolbar={false}`, une seule source de vérité
  pour la période affichée, exposée par le filtre externe).
- Normalisation : seul le **lundi** de la semaine est stocké dans `PlanningPeriode` (`dateDebut`) ;
  `dateFin` (dimanche) n'est jamais stocké, toujours dérivé au point d'usage. Choisir n'importe
  quel jour de la semaine dans l'`<Input>`, ou cliquer "Cette semaine", normalise au lundi
  correspondant via `lundiDeLaSemaine` (`packages/shared/src/utils/formatters.ts`, fonction
  partagée entre les deux apps) — même esprit que le mode "Mois" qui normalise toujours au 1er du
  mois affiché.
- Source de données : `GET /planning/intervalle?dateDebut=&dateFin=` — pas d'endpoint dédié, une
  semaine (7 jours) est traitée comme un cas particulier d'intervalle (`dateFin` calculé comme
  `dateDebut + 6 jours`), toujours largement sous le plafond `MAX_INTERVALLE_JOURS` (31).
- Vue FullCalendar (`user-app`, **≥768px**) : `timeGridWeek` (vue **native** FullCalendar, incluse
  dans `timeGridPlugin` déjà importé pour le mode Jour) — pas de mécanisme de durée dynamique
  custom comme pour "Intervalle". Locale française (`frLocale`) : semaine Lundi–Dimanche par
  défaut, cohérent avec `dateDebut` toujours calculé comme un lundi.
- Adaptation mobile (`user-app` uniquement, **<768px**, cf. "Adaptation mobile de l'Agenda"
  ci-dessous) : bascule vers `listWeek` (liste chronologique) au lieu de `timeGridWeek`.
- Affichage des créneaux : heure affichée = `arg.timeText` (début seul), comme en vue "Jour" — voir
  "Affichage des créneaux" ci-dessous.
- Hors périmètre : le surlignage "tous les créneaux réservés" (gold) n'est pas étendu à cette vue,
  scopé explicitement à la vue Mois (cf. "Affichage des créneaux"). Le surlignage "Ma réservation"
  n'est pas scopé par vue et s'applique normalement.

### Mode Mois
- Contrôle : sélecteur `react-datepicker` (`showMonthYearPicker`, locale française via
  `registerLocale("fr", fr)` de `date-fns/locale/fr`) + bouton "Ce mois-ci". Rendu dans un portail
  React (`portalId="datepicker-portal"`, attaché à `document.body`) — nécessaire pour que le popup
  se peigne au-dessus de la grille FullCalendar plutôt que derrière (voir "Limitations connues").
- Source de données : `GET /planning/mensuel?annee=&mois=`.
- Vue FullCalendar : `dayGridMonth` — inchangé quel que soit le viewport.
- Adaptation mobile (`user-app` uniquement, **<768px**, cf. "Adaptation mobile de l'Agenda"
  ci-dessous) : la grille reste affichée telle quelle (pas de changement de vue), mais devient
  tactile — taper un jour affiche la liste des créneaux de ce jour sous la grille.

### Mode Intervalle (temporairement retiré du sélecteur "Vue")

> **Retiré de l'UI depuis 2026-10-12, réactivation prévue plus tard.** L'option "Intervalle" a été
> retirée de `MODE_OPTIONS` (`FiltreDatePlanning.tsx`, dupliqué dans les deux apps) : impossible de
> l'atteindre via le `Select`. Tout le reste décrit ci-dessous (logique, validation, endpoint,
> vue FullCalendar) reste intact dans le code, inchangé, prêt à être réactivé en remettant
> `{ value: "intervalle", label: "Intervalle" }` dans `MODE_OPTIONS`.

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

## Adaptation mobile de l'Agenda (`user-app` uniquement)

`admin-app` (`/planning`) n'est pas concerné par cette section : comportement inchangé quel que
soit le viewport.

Seuil responsive : **768px**, cohérent avec le drawer de navigation (`openspec/specs/
socle-frontend/spec.md`, section "Navigation"). Détection via un hook réactif
`useIsMobileViewport()` (`apps/user-app/src/hooks/useIsMobileViewport.ts`,
`window.matchMedia("(max-width: 767px)")`, écoute les changements — rotation d'écran,
redimensionnement) qui pilote le rendu de `CalendrierReservations`, en complément (pas en
remplacement) du mode choisi via `FiltreDatePlanning`.

### Mode Semaine, mobile
WHEN la largeur d'écran est inférieure à 768px THEN la vue FullCalendar bascule de `timeGridWeek`
vers `listWeek` (plugin `@fullcalendar/list`) — liste chronologique des créneaux groupés par jour.
La colonne heure native du plugin (`.fc-list-event-time`) affiche déjà l'heure de début :
`renderPlanningEvent` ne rend aucune heure pour cette vue (ni `arg.timeText`, ni la plage calculée),
pour éviter un doublon visuel — seuls le titre et le badge « Ma réservation » éventuel sont rendus.

### Mode Mois, mobile
WHEN la largeur d'écran est inférieure à 768px THEN taper un jour (`dateClick`) affiche la liste des
créneaux de ce jour sous la grille (`ListeCreneauxJour.tsx`, lecture seule pour cette itération —
aucune action tactile sur ses lignes), calculée côté client depuis les `entries` déjà chargées
(`filterEntriesByDay`, `planningEntries.ts` — aucun nouvel appel réseau). Taper à nouveau le même
jour referme le panneau. Le *drag-select* (`selectable`, création de réservation en glissant sur la
grille) est désactivé pour cette seule combinaison (Mode Mois + mobile), pour éviter un conflit
d'interprétation entre `select` et `dateClick` sur un simple tap — la création de réservation reste
pleinement disponible via Mode Jour/Semaine, et le drag-select reste inchangé en Mode Mois desktop.
L'annulation d'une réservation reste accessible uniquement via la puce d'événement dans la grille
(`eventClick`, inchangé), pas depuis le panneau du jour.

WHY : les vues "Semaine" (7 colonnes) et "Mois" (grille 7×5/6) deviennent illisibles sous 768px sans
adaptation — choix de rapprocher visuellement l'expérience de l'app Google Agenda plutôt que de
forcer une grille compressée ou de limiter les modes disponibles sur mobile.

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

WHEN le mode est "Mois" ou "Intervalle" (vue FullCalendar différente de `timeGridDay`/`timeGridWeek`)
THEN l'heure affichée sur le créneau est la plage complète `HH:mm – HH:mm` (début **et** fin),
calculée depuis `arg.event.start`/`arg.event.end` (`formatTime`, fuseau Europe/Paris) — pas
seulement le début (`arg.timeText` fourni par défaut par FullCalendar).

WHEN le mode est "Jour" (`timeGridDay`) ou "Semaine" (`timeGridWeek`) THEN l'heure affichée reste
`arg.timeText` (début seul) : ces grilles horaires rendent déjà visuellement la durée du créneau
(hauteur du bloc), afficher la plage en texte serait redondant.

WHEN la vue est `listWeek` (Mode Semaine, mobile, `user-app` uniquement, cf. "Adaptation mobile de
l'Agenda") THEN **aucune heure n'est rendue** par `renderPlanningEvent` (ni `arg.timeText`, ni la
plage calculée) : la colonne `.fc-list-event-time`, native au rendu du plugin `@fullcalendar/list`,
affiche déjà l'heure de début — ne rien afficher ici évite la duplication visuelle.

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
(`fc-timeGridDay-view`), "Semaine" (`fc-timeGridWeek-view`) ni "Intervalle" (vue `dayGrid` custom,
classe de vue différente) : seule la vue Mois est concernée.

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
