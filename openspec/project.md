# Contexte du projet — OpenSpec

## Projet
Frontend de réservation de créneaux d'adoration eucharistique (Chapelle du Vœux). Monorepo npm workspaces avec deux applications React déployables indépendamment (`apps/user-app`, `apps/admin-app`) et un package partagé (`packages/shared`). Voir `aidlc-docs/inception/requirements/requirements.md` pour le détail complet.

## Stack technique
- TypeScript 5.9 strict, React 19.2, Vite 7.3 (+ `@vitejs/plugin-react`), sans `vite-plugin-singlefile`
- React Router 7 (data router, `createBrowserRouter`)
- Tailwind CSS 4 via `@tailwindcss/vite`, thème en `@theme` (migré du template CDN)
- TanStack Query 5 (state serveur), Zustand 4 (state local/UI, store d'auth par app)
- React Hook Form 7 + Zod 3 (formulaires/validation)
- `fetch` natif exclusivement (pas d'Axios), wrapper dans `packages/shared/api`
- FullCalendar (React), chargé en lazy avec ses plugins
- date-fns 3, npm workspaces (npm 10)
- Tests : Vitest + React Testing Library (unitaires/composants), MSW (intégration), Playwright (E2E)

## Conventions
- Composants fonctionnels uniquement, pas de logique métier dans les composants (déléguée aux hooks `hooks/useXxx.ts` et aux modules `api/endpoints/*.ts`)
- Imports depuis `@chapelle/shared` toujours via sous-chemin explicite (`/types`, `/api`, `/ui`, `/utils`) — jamais depuis la racine du package
- `apps/user-app` et `apps/admin-app` sans dépendance croisée — uniquement vers `packages/shared`
- PascalCase pour les composants, camelCase pour les utilitaires
- Code-splitting obligatoire (`React.lazy`+`Suspense`) pour toute page chargeant FullCalendar ou relevant de l'administration
- Interface entièrement en français, dates `dd/MM/yyyy`, fuseau Europe/Paris
- Authentification par cookie de session `httpOnly` (`credentials:"include"`), aucun token stocké côté client

## Organisation des capacités (`openspec/specs/`, `openspec/changes/`)
Alignée sur les unités de travail AI-DLC (`aidlc-docs/inception/application-design/unit-of-work.md`) :
`socle-frontend`, `authentification-comptes`, `consultation-planning`, `reservation-adoration`, `gestion-utilisateurs`, `gestion-administrateurs`, `gestion-annonces`, `contact-visiteurs`, `vitrine-acces`.

## Sources de vérité
- Spécification fonctionnelle complète : `prompt-frontend-revise.md` (racine du dépôt)
- Exigences AI-DLC : `aidlc-docs/inception/requirements/requirements.md`
- Récits utilisateur : `aidlc-docs/inception/user-stories/stories.md`
- Conception & unités : `aidlc-docs/inception/application-design/`
