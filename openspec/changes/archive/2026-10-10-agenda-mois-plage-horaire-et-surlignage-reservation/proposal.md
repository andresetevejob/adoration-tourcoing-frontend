# Proposition — agenda-mois-plage-horaire-et-surlignage-reservation

## Why
Sur `/agenda` (`user-app`), en vue "Mois" (`dayGridMonth`), chaque créneau n'affiche aujourd'hui que
son heure de **début** (`renderPlanningEvent.tsx`, `arg.timeText`, calculé par FullCalendar) — l'heure
de fin n'est jamais visible sans cliquer. Par ailleurs, la classe CSS `planning-event--mine` (posée
sur chaque créneau de l'utilisateur connecté par `mapPlanningEntryToEvent`,
`apps/user-app/src/components/agenda/planningEntries.ts`, commentaire : « pilote une seconde intention
visuelle (surlignage) ») n'a **jamais été stylée** — aucune règle CSS ne la référence dans tout le
repo. Seul un badge texte « Ma réservation » signale aujourd'hui la réservation de l'utilisateur,
sans mise en évidence visuelle du bloc lui-même (contrairement à la cellule "aujourd'hui" de
FullCalendar, qui bénéficie elle d'un fond coloré par défaut).

Ni l'une ni l'autre de ces deux lacunes n'est couverte par `openspec/specs/consultation-planning/spec.md`
(section "Hors périmètre" : « Anonymisation des identités selon le rôle consultant, actions de
réservation/annulation sur le calendrier : comportement déjà en place, non modifié par cette spec, non
détaillé ici plus avant »). Ce n'est donc pas un bug au sens OpenSpec (rien ne contredit une spec
existante) mais un changement de comportement/présentation à documenter — d'où cette proposition.

## What Changes

### 1. Vue "Mois" : afficher le début ET la fin du créneau
- `renderPlanningEvent.tsx` (`apps/user-app/src/components/agenda/`) construit lui-même le texte
  horaire à partir de `arg.event.start`/`arg.event.end` (au lieu du seul `arg.timeText` fourni par
  FullCalendar), via `formatTime`/`formatDateTime` (`@chapelle/shared/utils`, déjà DST-safe,
  `Europe/Paris`) :
  - Toujours `HH:mm – HH:mm` (ex. `14:30 – 15:30`) — un créneau reste sur un seul jour calendaire,
    garanti par une règle backend (hors de ce repo), donc aucune variante `dd/MM` nécessaire.
- Appliqué uniquement en vue "Mois" (`dayGridMonth`) — en vue "Jour" (`timeGridDay`), la grille horaire
  rend déjà visuellement la durée du créneau (hauteur du bloc), afficher la plage en texte y serait
  redondant ; la vue "Intervalle" (`dayGrid` custom) partage le même rendu de cellule que "Mois", donc
  en bénéficie aussi mécaniquement.

### 2. Surlignage visuel de "Ma réservation"
- Ajout d'une règle CSS pour `.planning-event--mine` (nouveau fichier ou ajout à
  `packages/shared/src/ui/theme.css`, à trancher en conception) : fond teinté + bordure dans la palette
  `gold` déjà utilisée pour les accents du site (`--color-gold-400`/`500`, cf. CTA, badge "En ce moment"
  de `AdorationLive`) — distincte de la couleur du badge "Ma réservation" existant (`Badge variant="info"`,
  teinte `night`), pour que le surlignage ne se confonde pas avec un simple badge informatif.
- Le badge texte « Ma réservation » est conservé en complément (la couleur seule ne suffit pas comme
  signal d'accessibilité — WCAG 1.4.1).

## Questions de clarification

- [Réponse]: Couleur du surlignage — **`gold`** (fond `gold-100`/bordure `gold-400`, même logique que
  `Badge variant="warning"` qui utilise déjà `bg-gold-100`).
- [Réponse]: **`admin-app` inclus** pour la partie 1 (affichage début/fin, même composant
  `renderPlanningEvent.tsx` dupliqué). La partie 2 (surlignage) reste hors scope côté admin —
  confirmé sans objet, `isMine` y est figé à `false` par conception déjà en place.
- [Réponse]: **Pas de chevauchement de deux jours calendaires à gérer** — confirmé par l'utilisateur :
  une règle backend (hors de ce repo frontend) garantit qu'un créneau reste sur un seul jour
  calendaire. Format simplifié en conséquence : toujours `HH:mm – HH:mm`, pas de variante `dd/MM`.

## Impact
- Fichiers : `apps/user-app/src/components/agenda/renderPlanningEvent.tsx` (parties 1 et 2),
  `apps/admin-app/src/components/planning/renderPlanningEvent.tsx` (partie 1 seulement, sous réserve
  de la réponse ci-dessus), `packages/shared/src/ui/theme.css` (ou nouveau fichier CSS partagé) pour la
  règle `.planning-event--mine` (user-app uniquement). Aucun changement sur `planningEntries.ts` dans
  les deux apps — le câblage `isMine`/`classNames` existe déjà.
- Capacité affectée : `consultation-planning` (section "Hors périmètre" à réviser après implémentation
  pour documenter ce qui devient dans le périmètre).
- Pas de breaking change, pas d'appel API modifié — présentation uniquement.

*Pas de conception applicative lourde nécessaire (un seul composant existant par app, pas de nouveau
composant, pas de nouvelle capacité) — proposition traitée directement par la Construction après
approbation.*
