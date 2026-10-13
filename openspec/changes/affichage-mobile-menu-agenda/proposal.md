# Proposition — affichage-mobile-menu-agenda

## Why
`apps/user-app` (seule cible — `admin-app` est explicitement hors périmètre, l'utilisateur a demandé
"la plateforme utilisateur") n'est pas correctement utilisable sur téléphone mobile à deux endroits
précis :
- **Menu principal** (`Navbar.tsx`) : les 5 liens + bloc auth (`AuthNav`) sont en `flex flex-wrap`,
  sans bascule vers un menu replié sous un certain seuil — sur un écran étroit, les liens se
  compressent/empilent de façon désordonnée au lieu d'un menu mobile propre.
- **Agenda** (`CalendrierReservations.tsx`, FullCalendar) : les vues "Semaine" (7 colonnes) et
  "Mois" (grille 7×5/6) deviennent illisibles sous ~768px — aucune adaptation de la vue rendue
  selon la largeur d'écran aujourd'hui.

**Audit du reste du site** (fait dans le cadre de ce triage, cf. exploration jointe) : toutes les
autres pages (`PageAccueil`, `PageActualites`, `PageQuiSommesNous`, `PageContact`, pages
auth/compte, formulaires de réservation, composants partagés `Table`/`Modal`/`Footer`) utilisent
déjà des classes Tailwind responsive cohérentes (`sm:`/`md:`/`lg:`), des largeurs fluides
(`max-w-* px-4`, pas de largeur fixe débordante) et des composants partagés déjà adaptatifs
(`Table` a déjà `overflow-x-auto`, `Modal` est déjà `max-w-lg` avec marge externe). **Aucun autre
changement n'est nécessaire ailleurs sur le site pour la conformité mobile.**

## Décision de style confirmée avec l'utilisateur
- Menu mobile : drawer (panneau coulissant), pas un simple empilement des liens.
- Agenda mobile : style "Google Agenda" — l'utilisateur souhaite se rapprocher visuellement de
  l'app Google Agenda plutôt que d'une grille FullCalendar compressée. Design concret retenu
  (détaillé ci-dessous) : vue liste chronologique pour "Semaine", grille mensuelle compacte +
  liste du jour sélectionné pour "Mois" — à valider/ajuster lors de la revue de cette proposition.

## What Changes

### 1. Menu mobile — drawer (`apps/user-app/src/components/layout/`)
- Nouveau seuil de bascule : **`md` (768px)**, cohérent avec le seuil utilisé côté Agenda
  (ci-dessous) — une seule notion de "mobile" dans toute cette proposition.
- **Sous 768px** : les liens `SITE_LINKS` et le contenu d'`AuthNav` disparaissent de la barre
  visible ; un bouton hamburger (icône SVG inline, cohérent avec la convention du projet — pas de
  dépendance d'icônes externe, cf. `openspec/specs/socle-frontend/spec.md`) apparaît à droite du
  logo, cible tactile ≥44px, `aria-expanded`/`aria-controls`/`aria-label` ("Ouvrir le menu" /
  "Fermer le menu").
- Au clic : un panneau (`role="dialog"`, `aria-modal="true"`) glisse depuis le bord (droite),
  recouvrant le contenu sous un overlay semi-transparent (même teinte que `Modal`,
  `bg-night-950/60`) — fermeture par clic sur l'overlay, touche `Échap`, ou clic sur un lien du
  menu (navigation = fermeture).
- Contenu du drawer : les mêmes liens `SITE_LINKS` que la barre desktop + le contenu actuel
  d'`AuthNav`, empilés verticalement.
- **À partir de 768px** : comportement actuel inchangé (barre horizontale, pas de bouton
  hamburger, pas de drawer monté).
- Pas de nouvelle dépendance (drawer construit avec les primitives déjà utilisées par `Modal` :
  `fixed`/`absolute`, pas de librairie d'animation).

### 2. Agenda mobile — vue adaptée par mode (`apps/user-app/src/components/agenda/`)
Nouveau hook `useIsMobileViewport()` (`apps/user-app/src/hooks/`, basé sur
`window.matchMedia("(max-width: 767px)")`, réactif au resize/rotation) pilotant le rendu de
`CalendrierReservations` :

- **Mode "Jour"** : inchangé (`timeGridDay` déjà une seule colonne, déjà lisible sur mobile).
- **Mode "Semaine"** : sous 768px, bascule de `timeGridWeek` vers **`listWeek`** (vue liste
  chronologique groupée par jour, le rendu natif FullCalendar le plus proche visuellement d'un
  "Google Agenda") — nécessite l'ajout de la dépendance `@fullcalendar/list` (même version que les
  autres paquets `@fullcalendar/*` déjà installés, `6.1.21`). Au-dessus de 768px : `timeGridWeek`
  inchangé.
- **Mode "Mois"** : sous 768px, la grille `dayGridMonth` reste affichée (compacte, surlignage gold
  des jours réservés inchangé) mais devient **tactile** : taper un jour (`dateClick`, plugin
  `interactionPlugin` déjà importé) affiche la liste des créneaux de ce jour en dessous de la
  grille, calculée côté client depuis `entries` déjà chargées (aucun nouvel appel réseau) — reproduit
  le combo "mini-grille du mois + agenda du jour" de l'app Google Agenda. Au-dessus de 768px :
  comportement actuel inchangé (pas de panneau de jour, clic sur un créneau = `onEventClick`
  existant comme aujourd'hui).
- `renderPlanningEvent.tsx` : la vue `listWeek` affiche nativement une colonne heure séparée
  (`.fc-list-event-time`) — `estGrilleHoraire` doit être réévalué pour ce nouveau type de vue
  (éviter d'afficher la plage `HH:mm – HH:mm` en double avec la colonne native).

## Hors périmètre (explicite)
- `admin-app` (`/planning`) : non touché par cette proposition — l'utilisateur a demandé la
  "plateforme utilisateur" spécifiquement. Une proposition séparée serait nécessaire si souhaité
  pour l'admin.
- Reste du site (pages vitrine, auth, compte, formulaires, composants partagés) : audité, déjà
  conforme, aucun changement.
- Amélioration cosmétique mineure relevée lors de l'audit (`FiltreDatePlanning.tsx`, espacement
  `gap-2`→`gap-3` en cas de wrap sur très petit écran ≤360px) : non bloquante, non incluse — à
  traiter séparément si jugé utile.

## Impact
- Affected specs :
  - `socle-frontend` (nouvelle section "Navigation" documentant `Navbar`/drawer mobile — jusqu'ici
    cette partie de la capacité n'était pas documentée, cf. note de périmètre en tête de
    `spec.md`).
  - `consultation-planning` (nouvelle section "Adaptation mobile" sous "Modes de consultation").
- Affected code :
  - `apps/user-app/src/components/layout/Navbar.tsx` (+ nouveau composant drawer, + tests)
  - `apps/user-app/src/hooks/useIsMobileViewport.ts` (nouveau, + tests)
  - `apps/user-app/src/components/agenda/CalendrierReservations.tsx`,
    `renderPlanningEvent.tsx` (+ tests)
  - `apps/user-app/package.json` : nouvelle dépendance `@fullcalendar/list@6.1.21`
- Pas de changement backend. Pas de changement sur `admin-app` ni `packages/shared`.
