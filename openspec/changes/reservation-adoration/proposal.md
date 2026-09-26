# Proposition — reservation-adoration

## Why
Cœur métier de l'application : réserver et annuler des créneaux d'adoration, avec des règles de délai et de permissions différenciées par rôle.

## What Changes
- ReservationForm, ReservationConfirmModal, useBookings/useCreateBooking/useCancelBooking
- Règles : pas de réservation passée/occupée/archivée ; annulation ≥24h avant pour un Veilleur ; annulation libre pour Administrateur/SuperAdministrateur
- admin-app : réservation pour un Veilleur (sélecteur de bénéficiaire)

## Impact
Dépend de socle-frontend, authentification-comptes, consultation-planning. Ne bloque aucune autre capacité. Fichiers : apps/*/src/components/{agenda,planning}/Reservation*, apps/*/src/hooks/useBookings.ts, apps/*/src/api/endpoints/bookings.ts.

*Référence AI-DLC* : unité U3 — voir `aidlc-docs/inception/application-design/unit-of-work.md`.
