# Stack technique du projet

**Type de projet** : Frontend uniquement (monorepo). Aucun backend n'est développé ici — l'application consomme une API REST externe déjà spécifiée (swagger fourni, cf. `prompt-frontend-revise.md` §6 et `aidlc-docs/inception/requirements/requirements.md`).

## Structure du monorepo (npm workspaces)
- `apps/user-app` — application React (Anonyme, Adorateur, Veilleur)
- `apps/admin-app` — application React (Administrateur, SuperAdministrateur)
- `packages/shared` (`@chapelle/shared`) — types, client API, UI kit, utils partagés

## Langage & framework
- TypeScript 5.9 strict (`no-any`, `noUnusedLocals`, `noUnusedParameters`)
- React 19.2, composants fonctionnels uniquement (pas de classes)
- Vite 7.3 + `@vitejs/plugin-react` (pas de `vite-plugin-singlefile`)
- React Router 7 (data router, `createBrowserRouter`)

## Style
- Tailwind CSS 4 via `@tailwindcss/vite`, thème en `@theme` (`packages/shared/src/ui/theme.css`)
- Pas de CSS-in-JS, pas de librairie de composants lourde (pas de Material UI/Ant Design)
- `cn()` (`clsx` + `tailwind-merge`) pour la composition de classes

## Données & état
- TanStack Query 5 pour le state serveur (cache, invalidation)
- Zustand 4 pour le state local/UI (store d'authentification, une instance par app)
- React Hook Form 7 + Zod 3 pour les formulaires et leur validation

## Réseau
- `fetch` natif exclusivement — **pas d'Axios**
- Client HTTP unique : factory `createApiClient(baseURL)` dans `packages/shared/api`, `credentials:"include"` (cookie de session httpOnly), `ApiError` typée, timeout 15s via `AbortController`

## Autres dépendances notables
- FullCalendar (React) pour les calendriers, chargé en lazy avec ses plugins importés dynamiquement
- date-fns 3 pour le formatage des dates (français, `dd/MM/yyyy`, Europe/Paris)

## Tests
- Vitest + React Testing Library : tests unitaires (hooks, utils) et de composants
- MSW (Mock Service Worker) : tests d'intégration avec mocks réseau, y compris pour les capacités sans backend exposé (annonces, contact)
- Playwright : tests E2E, une configuration par application
- Coverage minimum : 80% sur les hooks et utilitaires

## Outillage
- ESLint (`typescript-eslint`, règles strictes) + Prettier, configuration partagée entre les deux apps
- Docker : un `Dockerfile` multi-stage (build + Nginx) par application, `docker-compose.yml` racine

## Conventions de code
- PascalCase pour les composants, camelCase pour les utilitaires
- Pas de logique métier dans les composants de présentation — déléguée aux hooks (`hooks/useXxx.ts`) et aux modules d'endpoints (`api/endpoints/*.ts`)
- Imports depuis `@chapelle/shared` toujours via un sous-chemin explicite (`/types`, `/api`, `/ui`, `/utils`) — jamais depuis la racine du package, jamais par chemin profond
- `apps/user-app` et `apps/admin-app` sans dépendance croisée — uniquement vers `packages/shared`
- Interface entièrement en français

## Sources de vérité pour la conception
- Spécification fonctionnelle complète : `prompt-frontend-revise.md` (racine du dépôt)
- Exigences, récits utilisateur, conception applicative et unités de travail : `aidlc-docs/inception/`
- Capacités OpenSpec : `openspec/changes/*/proposal.md`, `openspec/project.md`
