# Proposition — gestion-administrateurs

## Why
Le SuperAdministrateur doit pouvoir gérer l'équipe d'administrateurs, une permission explicitement exclue des Administrateurs simples.

## What Changes
- pages/superadmin/AdminsListPage, AdminCreatePage, garde de route SuperAdministrateur-only
- Réutilisation de UserForm/UserTable de gestion-utilisateurs avec role=ADMINISTRATEUR

## Impact
Dépend de socle-frontend, authentification-comptes, gestion-utilisateurs. Fichiers : apps/admin-app/src/pages/superadmin/.

*Référence AI-DLC* : unité U5 — voir `aidlc-docs/inception/application-design/unit-of-work.md`.
