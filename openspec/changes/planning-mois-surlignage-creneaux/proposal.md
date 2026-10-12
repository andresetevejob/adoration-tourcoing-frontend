# Proposition — planning-mois-surlignage-creneaux

## Historique
Remplace `planning-mois-surlignage-aujourdhui` (implémenté puis jugé incorrect par l'utilisateur
après test manuel dans l'interface : seul le jour courant était surligné, alors que le besoin réel est
de surligner **tous** les créneaux réservés du mois). L'implémentation précédente (classe
`planning-event--today`, fonction `isToday`, paramètre `highlightToday`) doit être **retirée** et
remplacée par l'approche ci-dessous.

## Why
En vue "Mois" (`dayGridMonth`), sur `/agenda` (`user-app`) et `/planning` (`admin-app`), les créneaux
réservés ne se distinguent pas visuellement des jours vides de la grille — seul un créneau marqué
"Ma réservation" (user-app uniquement) bénéficie d'un surlignage gold. L'utilisateur veut que
**chaque créneau réservé, pour n'importe quel jour du mois affiché**, soit encadré en gold, afin de
repérer facilement la densité de réservations sur le mois.

## What Changes

### 1. Retirer l'implémentation précédente ("aujourd'hui uniquement")
- `packages/shared/src/utils/formatters.ts` : supprimer `isToday` (+ ses tests).
- `packages/shared/src/ui/fullcalendar-overrides.css` : supprimer la règle
  `.fc-event.planning-event--today`.
- `apps/user-app/src/components/agenda/planningEntries.ts` et
  `apps/admin-app/src/components/planning/planningEntries.ts` : retirer le paramètre
  `highlightToday` de `mapPlanningEntryToEvent`/`mapPlanningEntriesToEvents` (retour à la signature
  d'origine, un seul argument).
- `apps/user-app/src/components/agenda/CalendrierReservations.tsx` et
  `apps/admin-app/src/components/planning/CalendrierPlanningAdmin.tsx` : retirer l'argument
  `highlightToday: periode.mode === "mois"` à l'appel de `mapPlanningEntriesToEvents`.
- Nettoyer les tests ajoutés pour cette logique (`formatters.test.ts`, `planningEntries.test.ts` dans
  les deux apps, `CalendrierReservations.test.tsx`/`CalendrierPlanningAdmin.test.tsx`).

### 2. Nouvelle règle CSS scopée à la vue Mois
- `packages/shared/src/ui/fullcalendar-overrides.css` : ajouter
  `.fc-dayGridMonth-view .fc-event { background-color: var(--color-gold-100); border: 1px solid
  var(--color-gold-400); border-radius: 4px; }` — même déclarations que `.planning-event--mine`,
  mais scopée à la vue via la classe que FullCalendar pose lui-même sur le conteneur de la vue active
  (confirmé dans le repo : `CalendrierReservations.test.tsx`/`CalendrierPlanningAdmin.test.tsx`
  vérifient déjà `container.querySelector(".fc-view")).toHaveClass("fc-dayGridMonth-view")`).
- Aucune donnée par créneau nécessaire : pas de changement dans `planningEntries.ts` ni dans
  `mapPlanningEntryToEvent`/`mapPlanningEntriesToEvents` pour ce point — approche purement CSS, plus
  simple que l'implémentation précédente.
- S'applique aux deux apps (même fichier CSS partagé), peu importe l'anonymisation/l'identité du
  créneau (contrairement à "Ma réservation").

## Impact
- Affected specs : `consultation-planning` (sous-section "Surlignage de tous les créneaux réservés en
  vue Mois", déjà remplacée dans le spec à la place de l'ancienne sous-section "du jour").
- Affected code :
  - `packages/shared/src/utils/formatters.ts` (+ test) : retrait de `isToday`.
  - `packages/shared/src/ui/fullcalendar-overrides.css` : retrait de `.planning-event--today`, ajout
    de la règle scopée vue Mois.
  - `apps/user-app/src/components/agenda/{planningEntries.ts,CalendrierReservations.tsx}` (+ tests) :
    retrait de `highlightToday`.
  - `apps/admin-app/src/components/planning/{planningEntries.ts,CalendrierPlanningAdmin.tsx}` (+
    tests) : retrait de `highlightToday`.
- Pas de breaking change, pas d'appel API modifié — présentation uniquement.

## Questions de clarification
- [Réponse]: Comportement voulu confirmé par l'utilisateur après test manuel — **chaque créneau
  réservé d'un jour du mois** doit être encadré en gold en vue Mois (pas seulement ceux d'aujourd'hui).
- [Réponse]: Périmètre app (reporté de la proposition précédente) — **user-app ET admin-app**.

*Pas de conception applicative lourde nécessaire — approche purement CSS, plus simple que la
précédente. Traitée directement par la Construction après approbation.*
