# Proposition — gestion-annonces

## Why
Communiquer des annonces à la communauté (lecture publique côté user-app, CRUD côté admin-app) ; le backend n'expose pas encore /annonces, capacité développée contre des mocks MSW en attendant.

## What Changes
- user-app : ActualitesPage, useAnnonces (lecture, statut PUBLIE)
- admin-app : AnnonceForm, AnnonceList, pages liste/création/édition, publier/dépublier
- Handlers MSW partagés, contrat identique au futur backend réel pour rebranchement transparent

## Impact
⚠️ Dépendance backend non finalisée — capacité à re-valider en intégration. Dépend de socle-frontend, authentification-comptes. Fichiers : apps/*/src/{components/annonces,pages,hooks/useAnnonces.ts,api/endpoints/annonces.ts}.

*Référence AI-DLC* : unité U6 — voir `aidlc-docs/inception/application-design/unit-of-work.md`.
