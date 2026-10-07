# Proposition — reservation-duree-max-24h

## Why
Aucune règle, ni dans les règles métier (`prompt-frontend-revise.md` §2.1-2.5), ni dans le swagger
(`CreateBookingRequest` ne porte aucune contrainte de durée), ni dans le code actuel, ne limite la
durée d'un créneau d'adoration. `selectAllow` (`CalendrierReservations.tsx` côté user-app,
`CalendrierPlanningAdmin.tsx` côté admin-app) ne vérifie aujourd'hui que `start >= maintenant` — rien
n'empêche un glisser-déposer sur plusieurs jours (vues `dayGrid` mois/intervalle) de produire un
créneau de plusieurs jours. La demande métier est d'interdire tout créneau dont la durée excède 24h.

## What Changes
- `selectAllow` (user-app `CalendrierReservations.tsx` + admin-app `CalendrierPlanningAdmin.tsx`) :
  ajout d'une condition rejetant toute sélection dont `end - start > 24h`, en plus de la condition
  existante `start >= maintenant`. Une sélection dépassant 24h n'aboutit simplement pas (pas de
  callback `onSelectSlot` déclenché, pas de `ReservationForm` ouvert) — même comportement que le
  rejet actuel d'une sélection dans le passé.
- Filet de sécurité côté soumission : `ReservationConfirmModal` (user-app + admin-app) vérifie aussi
  cette règle avant l'appel réseau et affiche un message d'erreur si elle est violée (cas d'un `slot`
  construit par un autre chemin que le drag-select, défense en profondeur cohérente avec la
  vérification déjà faite pour le délai d'annulation ≥24h, §6.4 de la conception U3).
- Nouvelle fonction utilitaire partagée `exceedsMaxDuration(dateDebut, dateFin, maxHeures = 24):
  boolean` dans `packages/shared/src/utils/formatters.ts` (réutilisée par les deux points de
  vérification ci-dessus et par les deux apps).

## Impact
- Affected specs : `reservation-adoration` (nouvelle section).
- Affected code : `apps/user-app/src/components/agenda/CalendrierReservations.tsx`,
  `apps/user-app/src/components/agenda/ReservationConfirmModal.tsx`,
  `apps/admin-app/src/components/planning/CalendrierPlanningAdmin.tsx`,
  `apps/admin-app/src/components/planning/ReservationConfirmModal.tsx`,
  `packages/shared/src/utils/formatters.ts`.
- Pas de rupture : restreint des sélections jusque-là possibles mais jamais voulues (aucune
  réservation existante ne peut dépasser 24h aujourd'hui en pratique via l'UI calendrier standard,
  donc aucune donnée existante n'est concernée).

## Hypothèse retenue (à confirmer)
« Ne peut excéder 24h » est interprété comme `dateFin - dateDebut ≤ 24h` (borne incluse : un créneau
de exactement 24h est autorisé, au-delà est refusé). Cette règle est une vérification **frontend
uniquement** (filet UX) ; la décision finale reste côté backend (`POST /bookings` peut malgré tout
rejeter une requête pour d'autres raisons, cf. pattern déjà en place pour l'annulation).
