# Proposition — gestion-utilisateurs

## Why
Un Administrateur/SuperAdministrateur doit pouvoir gérer les comptes Adorateur/Veilleur, notamment valider ou rejeter les inscriptions Veilleur en attente.

## What Changes
- UserTable, UserForm, UserProfile, StatutValidationBadge, ValidationActions, useUsers
- Pages / (liste), /utilisateurs/:id (détail/édition), raccourci "Comptes en attente"
- Validation/rejet de compte ; restriction : pas d'action sur les comptes Administrateur/SuperAdministrateur

## Impact
Dépend de socle-frontend, authentification-comptes. Bloque gestion-administrateurs (réutilisation des patterns). Fichiers : apps/admin-app/src/{components/users,pages,hooks/useUsers.ts,api/endpoints/users.ts}.

*Référence AI-DLC* : unité U4 — voir `aidlc-docs/inception/application-design/unit-of-work.md`.
