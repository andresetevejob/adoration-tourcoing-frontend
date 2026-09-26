# Proposition — socle-frontend

## Why
Aucune fondation technique commune n'existe encore : le dépôt actuel est un template non branché (site statique + Tailwind CDN + vite-plugin-singlefile), incompatible avec le code-splitting obligatoire et la séparation en deux applications déployables indépendamment exigée par la spécification.

## What Changes
- Initialiser le monorepo npm workspaces (`apps/*`, `packages/shared`, `tsconfig.base.json`)
- Retirer `vite-plugin-singlefile`, le CDN Tailwind et le contenu statique d'`index.html` ; index.html Vite standard par app
- Implémenter `packages/shared` complet : types (aligné swagger), client API (`createApiClient`, `ApiError`), UI kit de base, thème Tailwind 4 `@theme` (migré du template), utils
- Configurer `exports` par sous-chemin + `sideEffects:false` sur `packages/shared/package.json`
- Mettre en place ESLint + Prettier, configuration Vitest par workspace, squelette Playwright par app
- Créer les `Dockerfile` (multi-stage + Nginx) et `docker-compose.yml` racine

## Impact
Bloquant pour toutes les autres capacités. Fichiers concernés : racine du dépôt (package.json, tsconfig, vite.config, index.html), nouveau `packages/shared/`, nouveaux `apps/user-app/`, `apps/admin-app/` (squelettes).

*Référence AI-DLC* : unité U0 — voir `aidlc-docs/inception/application-design/unit-of-work.md`.
