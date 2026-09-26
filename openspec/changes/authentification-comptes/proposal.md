# Proposition — authentification-comptes

## Why
Les deux applications nécessitent une authentification par cookie de session, avec des règles d'accès par rôle strictes et symétriques (chaque application rejette les rôles qui ne lui sont pas destinés).

## What Changes
- user-app : RegisterForm (RHF+Zod), LoginForm, pages Connexion/Inscription/Confirmation, ProtectedRoute, authStore, api/endpoints/auth.ts
- admin-app : LoginForm (sans inscription), ProtectedRoute, authStore, api/endpoints/auth.ts
- Page Mon compte dans les deux apps (tous rôles peuvent modifier leurs informations, y compris Adorateur)
- Rejet de connexion pour rôle inapproprié à l'application (redirection /non-autorise)
- Câblage réel du refresh/retry 401 et de l'exclusion /auth/* défini dans packages/shared

## Impact
Bloque consultation-planning, reservation-adoration, gestion-utilisateurs, gestion-administrateurs, gestion-annonces, vitrine-acces. Fichiers : apps/user-app/src/{components/auth,pages,store,api/endpoints/auth.ts}, apps/admin-app/src/{components/auth,pages,store,api/endpoints/auth.ts}.

*Référence AI-DLC* : unité U1 — voir `aidlc-docs/inception/application-design/unit-of-work.md`.
