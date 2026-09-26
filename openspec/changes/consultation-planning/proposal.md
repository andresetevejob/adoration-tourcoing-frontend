# Proposition — consultation-planning

## Why
Tout utilisateur (y compris anonyme) doit pouvoir consulter l'agenda d'adoration, avec une anonymisation de l'identité pilotée par le backend selon le rôle consultant.

## What Changes
- user-app : /agenda public, CalendrierReservations (FullCalendar lazy), affichage estAnonymise, mise en évidence "Ma réservation", filtres date/mes réservations
- admin-app : /planning, CalendrierPlanningAdmin (toutes identités visibles)
- Import dynamique des plugins FullCalendar dans le composant calendrier

## Impact
Dépend de socle-frontend, authentification-comptes. Bloque reservation-adoration (les actions de réservation s'accrochent au calendrier). Fichiers : apps/*/src/components/{agenda,planning}, apps/*/src/hooks/usePlanning.ts, apps/*/src/api/endpoints/planning.ts.

*Référence AI-DLC* : unité U2 — voir `aidlc-docs/inception/application-design/unit-of-work.md`.
