# Conception — U0 : Fondation & Design System

Unité transverse, aucune logique métier. Portée : initialiser le monorepo npm workspaces, extraire `packages/shared` (types, client API, UI kit, utils), poser les squelettes `apps/user-app`/`apps/admin-app`, l'outillage (ESLint/Prettier/Vitest/Playwright) et Docker. Sources : `openspec/changes/socle-frontend/proposal.md`, `aidlc-docs/inception/application-design/{unit-of-work,components,component-methods}.md`, `prompt-frontend-revise.md` §0.1/5/5.1/5.2/9.1, état actuel du dépôt (`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/`, `public/images/`).

Ce document reste au niveau conception : schémas de fichiers de configuration (légitimes pour une unité d'infrastructure), signatures et contrats de types/fonctions — **pas de corps de fonction, pas de JSX de rendu métier**.

---

## 1. Arborescence cible (créations / déplacements / suppressions)

```
frontend/
├── package.json                        [MODIFIÉ] racine monorepo, workspaces
├── package-lock.json                   [GÉNÉRÉ] par npm install
├── tsconfig.base.json                  [CRÉÉ]
├── eslint.config.js                    [CRÉÉ] flat config partagée
├── .prettierrc.json                    [CRÉÉ]
├── .prettierignore                     [CRÉÉ]
├── .gitignore                          [MODIFIÉ] node_modules, dist, .env, coverage, playwright-report
├── docker-compose.yml                  [CRÉÉ]
├── vite.config.ts                      [SUPPRIMÉ] (racine — remplacé par un vite.config.ts par app)
├── tsconfig.json                       [SUPPRIMÉ] (racine — remplacé par tsconfig.base.json + 1 par package/app)
├── index.html                          [SUPPRIMÉ] (contenu statique + CDN Tailwind — remplacé par apps/user-app/index.html)
├── public/images/*.jpg                 [DÉPLACÉ] → apps/user-app/public/images/
├── src/                                [SUPPRIMÉ après migration] — voir mapping §2
│
├── apps/
│   ├── user-app/                                          [CRÉÉ]
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── vitest.config.ts
│   │   ├── vitest.setup.ts
│   │   ├── playwright.config.ts
│   │   ├── index.html
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   ├── public/images/{hero-bg,about-hero,interior,gallery-1,gallery-2,gallery-3,gallery-4}.jpg
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── index.css
│   │       ├── vite-env.d.ts
│   │       └── legacy-template/            # zone de transit — voir note §2.1
│   │           ├── components/{Navbar,Footer,ScrollToTop,AdorationLive,Lightbox}.tsx
│   │           └── pages/{Home,QuiSommesNous,Actualites,Contact,InscriptionLecteur,InscriptionVeilleur}.tsx
│   │
│   └── admin-app/                                         [CRÉÉ]
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── vitest.config.ts
│       ├── vitest.setup.ts
│       ├── playwright.config.ts
│       ├── index.html
│       ├── .env.example
│       ├── Dockerfile
│       ├── nginx.conf
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── index.css
│           └── vite-env.d.ts
│
└── packages/
    └── shared/                                            [CRÉÉ] @chapelle/shared
        ├── package.json
        ├── tsconfig.json
        ├── vitest.config.ts
        ├── vitest.setup.ts
        └── src/
            ├── types/
            │   ├── user.ts
            │   ├── auth.ts
            │   ├── reservation.ts
            │   ├── planning.ts
            │   ├── annonce.ts
            │   ├── common.ts
            │   └── index.ts
            ├── api/
            │   ├── client.ts
            │   └── index.ts
            ├── ui/
            │   ├── Button.tsx
            │   ├── Input.tsx
            │   ├── Select.tsx
            │   ├── Table.tsx
            │   ├── Pagination.tsx
            │   ├── Modal.tsx
            │   ├── Badge.tsx
            │   ├── Card.tsx
            │   ├── Spinner.tsx
            │   ├── Toast.tsx
            │   ├── theme.css
            │   └── index.ts
            └── utils/
                ├── cn.ts
                ├── validators.ts
                ├── formatters.ts
                ├── constants.ts
                └── index.ts
```

### 2. Mapping ancien → nouveau

| Ancien fichier | Traitement | Nouvel emplacement |
|---|---|---|
| `src/utils/cn.ts` | déplacé tel quel | `packages/shared/src/utils/cn.ts` |
| `index.html` (racine, CDN Tailwind, config `tailwind.config`) | **extrait puis supprimé** — palette/polices/animations migrées | config → `packages/shared/src/ui/theme.css` ; squelette HTML → `apps/user-app/index.html` (+ `apps/admin-app/index.html`) |
| `public/images/*.jpg` | déplacé tel quel | `apps/user-app/public/images/` |
| `src/App.tsx` (retournait `null`) | remplacé | `apps/user-app/src/App.tsx` (squelette de boot, §6) |
| `src/main.tsx` | remplacé | `apps/user-app/src/main.tsx` (entrée Vite standard) |
| `src/index.css` (commentaire seul, CDN utilisé) | remplacé | `apps/user-app/src/index.css` (`@import "tailwindcss"` + thème partagé) |
| `src/components/{Navbar,Footer,ScrollToTop,AdorationLive,Lightbox}.tsx` | **déplacés en l'état, non branchés** | `apps/user-app/src/legacy-template/components/` |
| `src/pages/{Home,QuiSommesNous,Actualites,Contact}.tsx` | **déplacés en l'état, non branchés** | `apps/user-app/src/legacy-template/pages/` |
| `src/pages/{InscriptionLecteur,InscriptionVeilleur}.tsx` | **déplacés en l'état** (référence de style uniquement, cf. §0.1 point 5 du prompt — champs non conformes au swagger) | `apps/user-app/src/legacy-template/pages/` |
| `vite-plugin-singlefile` (dépendance) | supprimée du projet, aucun remplacement | — |
| `vite.config.ts` (racine) | éclaté par app, sans `viteSingleFile()` | `apps/user-app/vite.config.ts`, `apps/admin-app/vite.config.ts` |
| `tsconfig.json` (racine) | éclaté | `tsconfig.base.json` + `tsconfig.json` par app/package |
| `package.json` (racine) | remplacé (workspaces) | `package.json` racine + un par app/package |

#### 2.1 Note sur `legacy-template/`

Le template (Navbar, Footer, pages vitrine) reste la **base de réutilisation obligatoire** pour U1 (RegisterForm), U6 (Actualités), U7 (Contact) et U8 (Vitrine, Navbar/Footer). Si ces fichiers restent à la racine (`frontend/src/`), ils sont perdus au moment où le dépôt racine est nettoyé (suppression de `index.html`, `vite.config.ts`, `tsconfig.json`, `src/` de premier niveau, conformément à l'impact décrit dans `proposal.md`). Ce plan les déplace donc **tels quels, non importés, non renommés** dans `apps/user-app/src/legacy-template/`, pour que les unités U1/U6/U7/U8 les adaptent en place (renommage en `*Page.tsx`, extraction des sous-composants génériques vers `@chapelle/shared/ui`, branchement au router) sans devoir aller chercher le contenu dans l'historique git.

`App.tsx` et `main.tsx` de `apps/user-app` **n'importent rien** de `legacy-template/` — dossier volontairement mort tant que U1/U8 n'ont pas démarré, donc aucune règle ESLint `no-unused-vars` ne se déclenche (rien n'y référence ces fichiers, mais rien ne les importe non plus : ils sont simplement présents sur disque).

**Point ouvert n°1** : cette lecture de la portée U0 (« squelette sans contenu applicatif ») est une interprétation — l'alternative est de laisser ces fichiers à la racine du dépôt (hors monorepo) jusqu'à ce que chaque unité U1/U6/U7/U8 vienne les chercher elle-même. À confirmer avec le porteur de projet avant implémentation ; ce plan retient la première option pour respecter l'impact « racine nettoyée » du `proposal.md`.

---

## 3. Fichiers de configuration — contenu/schéma exact

### 3.1 `package.json` (racine)

```jsonc
{
  "name": "adoration-tourcoing-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "test:coverage": "npm run test:coverage --workspaces --if-present",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "@eslint/js": "^9.x",
    "eslint": "^9.x",
    "typescript-eslint": "^8.x",
    "eslint-plugin-react-hooks": "^5.x",
    "eslint-plugin-react-refresh": "^0.4.x",
    "prettier": "^3.x",
    "typescript": "5.9.3"
  }
}
```

`dev`/`preview` ne sont **pas** définis à la racine : ils s'invoquent avec `--workspace=apps/user-app` ou `--workspace=apps/admin-app` (cf. §9.1 du prompt), chaque app déclarant son propre script `dev`/`preview`.

### 3.2 `tsconfig.base.json`

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Chaque `tsconfig.json` de package/app fait `"extends": "../../tsconfig.base.json"` et n'ajoute que ses spécificités (`paths`, `types`, `include`).

### 3.3 `packages/shared/package.json`

Reprend **exactement** le bloc `exports` de `prompt-frontend-revise.md` §5 :

```jsonc
{
  "name": "@chapelle/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "exports": {
    "./types": "./src/types/index.ts",
    "./api": "./src/api/index.ts",
    "./ui": "./src/ui/index.ts",
    "./utils": "./src/utils/index.ts"
  },
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src"
  },
  "peerDependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "dependencies": {
    "clsx": "2.1.1",
    "tailwind-merge": "3.4.0",
    "zod": "^3.23.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "typescript": "5.9.3",
    "vite": "7.3.2",
    "vitest": "^2.x",
    "jsdom": "^25.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "@vitest/coverage-v8": "^2.x"
  }
}
```

**Pas de dépendance à `react-hook-form`, `zustand`, `@tanstack/react-query`, `react-router` ni `fullcalendar`** dans `packages/shared` ou dans les `package.json` des apps à ce stade : ces dépendances sont ajoutées par les unités qui les consomment réellement (U1 pour RHF/Zustand/TanStack Query/React Router, U2 pour FullCalendar). U0 n'installe que ce qu'il utilise (`zod`, `date-fns` pour `validators.ts`/`formatters.ts`).

**Point ouvert n°2** : `date-fns` v3 seul ne gère pas la conversion de fuseau horaire IANA (`Europe/Paris`) — il faut soit `date-fns-tz`, soit `@date-fns/tz`, soit supposer que le poste client est déjà à l'heure de Paris (cas réaliste pour un public France) et s'appuyer sur `Intl.DateTimeFormat`/formatage natif sans conversion de fuseau explicite. À trancher avant d'écrire `formatters.ts` — ce plan ne fige pas ce choix pour ne pas ajouter une dépendance non listée dans `tech-stack.md` sans validation.

### 3.4 `packages/shared/tsconfig.json`

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

### 3.5 `apps/user-app/package.json` (identique en forme pour `admin-app`, nom/port différents)

```jsonc
{
  "name": "@chapelle/user-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@chapelle/shared": "*",
    "react": "19.2.6",
    "react-dom": "19.2.6"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.17",
    "@types/node": "22.19.17",
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "5.1.1",
    "tailwindcss": "4.1.17",
    "typescript": "5.9.3",
    "vite": "7.3.2",
    "vitest": "^2.x",
    "jsdom": "^25.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "@playwright/test": "^1.4x"
  }
}
```

`admin-app` : `"name": "@chapelle/admin-app"`, mêmes dépendances (pas de dépendance à `@chapelle/user-app`, ni l'inverse — règle de non-dépendance croisée).

### 3.6 `apps/user-app/tsconfig.json` (identique pour `admin-app`)

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["vite/client"],
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts"]
}
```

### 3.7 `apps/user-app/vite.config.ts`

```typescript
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: { port: 3000 },
  preview: { port: 3000 },
});
```

`apps/admin-app/vite.config.ts` : identique, `port: 3001`. **Pas de `vite-plugin-singlefile`**, pas de `viteSingleFile()` dans `plugins`.

### 3.8 `index.html` par app (Vite standard)

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0d1a" />
    <title>Adoration Chapelle du Vœux</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`apps/admin-app/index.html` : identique, `<title>Adoration Chapelle du Vœux — Administration</title>`. Aucun `<script>` CDN Tailwind, aucun contenu de page statique repris (galerie, hero, formulaires) — tout ce contenu vit désormais dans `legacy-template/` (§2.1), pas dans `index.html`.

### 3.9 `.env.example` par app

`apps/user-app/.env.example` :
```
VITE_API_BASE_URL=http://localhost:8085/api/v1
VITE_APP_NAME=Adoration Chapelle du Vœux
```

`apps/admin-app/.env.example` :
```
VITE_API_BASE_URL=http://localhost:8085/api/v1
VITE_APP_NAME=Adoration Chapelle du Vœux — Administration
```

`apps/*/src/vite-env.d.ts` :
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 4. `packages/shared/src/types` — contrats (section 5.2 du prompt, non réinventés)

### `types/user.ts`
- `enum UserRole { ADORATEUR, VEILLEUR, ADMINISTRATEUR, SUPERADMINISTRATEUR }`
- `enum StatutValidation { EN_ATTENTE, VALIDE, REJETE }`
- `interface UserResponse { id: string; email: string; telephone?: string; nom: string; prenoms: string; role: UserRole; statutValidation: StatutValidation; dateCreation: string }`
- `interface UserListFilters { email?: string; telephone?: string; nom?: string; prenoms?: string; statutValidation?: StatutValidation }`
- `interface CreateUserRequest { email: string; password: string; nom: string; prenoms: string; telephone?: string; role: UserRole }`
- `interface UpdateUserRequest { email: string; nom: string; prenoms: string; telephone?: string; role?: UserRole }`

### `types/auth.ts`
- `interface LoginRequest { email: string; password: string }`
- `interface RegisterRequest { email: string; password: string; nom: string; prenoms: string; telephone?: string; role: Extract<UserRole, "ADORATEUR" | "VEILLEUR"> }` (importe `UserRole` depuis `./user`, réexport local uniquement via l'`index.ts` de `types/`)
- `interface AuthResponse { user: UserResponse; authenticatedAt: string }`

### `types/reservation.ts`
- `enum StatutReservation { EFFECTUEE, ANNULEE }`
- `interface BookingResponse { id: string; idUtilisateur: string; creatorId: string; dateDebut: string; dateFin: string; status: StatutReservation; description?: string; dateCreation: string; dateModification?: string; estArchivee: boolean }`
- `interface CreateBookingRequest { idUtilisateur?: string; dateDebut: string; dateFin: string; description?: string }`

### `types/planning.ts`
- `interface PlanningEntryResponse { id: string; idUtilisateur: string; nomUtilisateur: string; prenomsUtilisateur: string; roleUtilisateur: UserRole; dateDebut: string; dateFin: string; description?: string; estArchivee: boolean; estAnonymise: boolean }`

### `types/annonce.ts`
- `enum StatutAnnonce { BROUILLON, PUBLIE, DEPUBLIE }`
- `interface AnnonceResponse { id: string; titre: string; contenu: string; datePublication: string; statut: StatutAnnonce }`
- `interface AnnonceCreateRequest { titre: string; contenu: string; datePublication: string }`

### `types/common.ts`
- `interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; last: boolean }`
- `interface SpringPage<T> { content: T[]; totalElements: number; totalPages: number; size: number; number: number; numberOfElements: number; first: boolean; last: boolean; empty: boolean }`
- `interface ApiError { code: string; message: string }` — **note** : ce type nommé `ApiError` dans le swagger (forme JSON `{code, message}`) coexiste avec la **classe** `ApiError extends Error` du client API (§5). Pour éviter le conflit de nom entre l'interface de payload et la classe levée par le client, `types/common.ts` exporte l'interface sous le nom `ApiErrorPayload`, et la classe `ApiError` (levée par `packages/shared/api`) l'utilise en interne (`code`, `status`, `message`) sans la réexporter depuis `types/`. **Point ouvert n°3** : confirmer ce renommage (`ApiErrorPayload`) avec l'équipe, ou accepter que `ApiError` ne soit exportée que depuis `@chapelle/shared/api`.
- `interface PageableParams { page: number; size: number; sort?: string[] }`

Chaque fichier de `types/` est indépendant ; `types/index.ts` réexporte uniquement le contenu de ces 6 fichiers (barrel local, pas de ré-export vers `api/`, `ui/`, `utils/`).

---

## 5. `packages/shared/src/api` — SharedApiClient

Signatures reprises de `component-methods.md` (déjà actées, non modifiées) :

```typescript
function createApiClient(baseURL: string): ApiClient;

interface ApiClient {
  get<T>(path: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T = void>(path: string, options?: RequestOptions): Promise<T>;
}

interface RequestOptions {
  signal?: AbortSignal;      // par défaut : AbortController interne, timeout 15s
  skipAuthRetry?: boolean;   // true pour /auth/login, /auth/register, /auth/refresh
}

class ApiError extends Error {
  code: string;
  status: number;
  message: string;
}
```

Comportement attendu (spécifié en §5.1 du prompt, à implémenter en Construction, pas ici) :
- `fetch(url, { ...options, credentials: "include", headers: { "Content-Type": "application/json" } })`
- `!response.ok` → lève `ApiError` (jamais de rejet silencieux ni de `throw response`)
- Timeout 15s par défaut via `AbortController` interne si aucun `signal` n'est fourni
- 401 hors `skipAuthRetry` → `POST /auth/refresh` puis retry une fois, sinon redirection `/connexion`
- 403 → redirection `/non-autorise`
- Sérialisation des query params de `get()` à plat (`?page=&size=&sort=`), jamais `?pageable=...` (note swagger §5.2 du prompt)

`api/index.ts` exporte `createApiClient`, `ApiClient`, `RequestOptions`, `ApiError` — uniquement le contenu de `client.ts`.

**Point ouvert n°4** : la redirection sur 401/403 (`window.location`, événement personnalisé, ou callback injecté à `createApiClient`) n'est pas spécifiée par `component-methods.md`. Deux options : (a) `createApiClient` accepte des callbacks `onUnauthorized`/`onForbidden` injectés par chaque app (garde le client sans dépendance à `react-router`) ; (b) le client émet un `CustomEvent` DOM écouté par `ProtectedRoute`/`router.tsx` de chaque app (U1). Recommandation : option (a), plus testable ; à confirmer avant l'implémentation de `client.ts`.

---

## 6. `packages/shared/src/utils`

### `cn.ts` — repris à l'identique du template

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `validators.ts` — schémas Zod (signatures, alignées swagger §6)

```typescript
const emailSchema: ZodString;                    // .email()
const passwordSchema: ZodString;                  // .min(8).regex(/^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/)
const nomSchema: ZodString;                       // .max(255)
const prenomsSchema: ZodString;                   // .max(255)
const telephoneSchema: ZodString;                 // .regex(/^\+?[0-9]{10,15}$/) — optionnel via .optional().or(z.literal(""))
const roleSchema: ZodNativeEnum<typeof UserRole>;

const loginSchema: ZodObject<{ email: typeof emailSchema; password: ZodString }>;
const registerSchema: ZodEffects<ZodObject<{
  email: typeof emailSchema;
  password: typeof passwordSchema;
  confirmPassword: ZodString;      // front-only, jamais envoyé au backend
  nom: typeof nomSchema;
  prenoms: typeof prenomsSchema;
  telephone: typeof telephoneSchema;
  role: ZodEnum<["ADORATEUR", "VEILLEUR"]>;
}>>;                                // .refine(password === confirmPassword)

const bookingSchema: ZodEffects<ZodObject<{
  idUtilisateur: ZodOptional<ZodString>;
  dateDebut: ZodString;             // ISO datetime
  dateFin: ZodString;
  description: ZodOptional<ZodString>; // .max(1000)
}>>;                                 // .refine(dateDebut < dateFin), .refine(dateDebut >= now)
```

### `formatters.ts` — signatures (dates FR, Europe/Paris — cf. point ouvert n°2)

```typescript
function formatDate(date: string | Date): string;       // "dd/MM/yyyy"
function formatDateTime(date: string | Date): string;   // "dd/MM/yyyy HH:mm"
function formatTime(date: string | Date): string;       // "HH:mm"
```

### `constants.ts` — valeurs transverses (pas de règle métier propre à une unité)

```typescript
const API_TIMEOUT_MS = 15000;
const DEFAULT_PAGE_SIZE = 20;
const PASSWORD_MIN_LENGTH = 8;
const TELEPHONE_PATTERN = /^\+?[0-9]{10,15}$/;
```

Les constantes propres à une règle métier (ex. délai d'annulation 24h, règle 2.3) sont ajoutées par l'unité qui les consomme (U3), pas ici, pour ne pas anticiper une règle non encore conçue en détail.

`utils/index.ts` réexporte `cn`, les schémas de `validators.ts`, les fonctions de `formatters.ts`, les constantes de `constants.ts`.

---

## 7. `packages/shared/src/ui` — SharedUIKit (contrats de props, sans JSX de rendu)

Tous les composants : fonction composant + `React.forwardRef` où pertinent (`Input`, `Select`), Tailwind-only (classes utilitaires + tokens `theme.css`), aucun CSS importé au niveau module.

```typescript
// Button.tsx
interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "outline" | "gold-outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

// Input.tsx (forwardRef<HTMLInputElement, InputProps>)
interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  label?: string;
  error?: string;
}

// Select.tsx (forwardRef<HTMLSelectElement, SelectProps>)
interface SelectProps extends React.ComponentPropsWithoutRef<"select"> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

// Table.tsx
interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}
interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

// Pagination.tsx
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Badge.tsx
interface BadgeProps {
  variant: "success" | "warning" | "danger" | "info" | "neutral";
  children: React.ReactNode;
}

// Card.tsx
interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

// Spinner.tsx
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

// Toast.tsx — provider + hook (pas de composant unique exposé aux apps)
type ToastVariant = "success" | "error" | "info" | "warning";
function ToastProvider(props: { children: React.ReactNode }): JSX.Element;
function useToast(): { show(message: string, variant?: ToastVariant): void };
```

`ui/index.ts` exporte `Button`, `Input`, `Select`, `Table`, `Pagination`, `Modal`, `Badge`, `Card`, `Spinner`, `ToastProvider`, `useToast`, et les types de props associés. **N'exporte pas** `theme.css` (importé séparément en CSS, cf. §7.1).

### 7.1 `ui/theme.css` — migration Tailwind 4 `@theme`

Migration directe de la config CDN de `index.html` (racine) vers des tokens `@theme` :

```css
@theme {
  --font-serif: "Playfair Display", "Cormorant Garamond", Georgia, serif;
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-display: "Cormorant Garamond", Georgia, serif;

  --color-gold-50: #fdf8ed;
  --color-gold-100: #f9edcc;
  --color-gold-200: #f3d994;
  --color-gold-300: #ecc25c;
  --color-gold-400: #e6ae36;
  --color-gold-500: #d4951e;
  --color-gold-600: #b07317;
  --color-gold-700: #8c5315;
  --color-gold-800: #754319;
  --color-gold-900: #643918;
  --color-gold-950: #3a1d0a;

  --color-night-50: #f0f2f7;
  --color-night-100: #e1e5ef;
  --color-night-200: #c3cbe0;
  --color-night-300: #95a2c4;
  --color-night-400: #6b79a3;
  --color-night-500: #525d89;
  --color-night-600: #424974;
  --color-night-700: #383d5f;
  --color-night-800: #1e2338;
  --color-night-900: #111627;
  --color-night-950: #0a0d1a;

  --color-ivory: #faf8f5;
  --color-ivory-dark: #f0ebe0;
  --color-pearl: #e8e4db;
  --color-pearl-dark: #d5cfc4;

  --animate-fade-in: fadeIn 0.8s ease-out;
  --animate-fade-up: fadeUp 0.8s ease-out;
  --animate-fade-down: fadeDown 0.6s ease-out;
  --animate-float: float 6s ease-in-out infinite;
  --animate-glow: glow 2.5s ease-in-out infinite alternate;
  --animate-ping-slow: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  --animate-shimmer: shimmer 3s linear infinite;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes glow { from { box-shadow: 0 0 5px rgba(212,149,30,.3); } to { box-shadow: 0 0 25px rgba(212,149,30,.6); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
```

`--animate-ping-slow` réutilise le mot-clé `ping`, gardé tel quel dans les `@keyframes` par défaut de Tailwind 4 (non redéfini ici, comme dans la config CDN d'origine).

Les utilitaires CSS globaux du template (`.glass`, `.btn-primary`, `.form-input`, `.section-title`, etc., lignes 74-212 de l'`index.html` actuel) **ne sont pas migrés dans `theme.css`** : ce sont des classes composites (pas des tokens de thème), à recréer sous forme de composants React (`Button`, `Input`, `Card`) dans `ui/` plutôt que dupliquées en CSS — cohérent avec « Tailwind-only, aucun CSS importé au niveau module ». **Point ouvert n°5** : confirmer qu'aucune page vitrine ne dépend de ces classes utilitaires globales telles quelles (sinon `legacy-template/` en gardera des références à corriger lors de l'adaptation en U6/U7/U8).

### 7.2 Import du thème depuis chaque application

`theme.css` n'est **pas** exposé via un sous-chemin `exports` du `package.json` de `packages/shared` (le prompt n'en déclare que 4 : `/types`, `/api`, `/ui`, `/utils`). Chaque `apps/*/src/index.css` l'importe donc par **chemin relatif de fichier**, pas via un import de package :

```css
/* apps/user-app/src/index.css */
@import "tailwindcss";
@import "../../../packages/shared/src/ui/theme.css";
```

(3 niveaux : `src/` → `user-app/` → `apps/` → racine, puis `packages/shared/src/ui/theme.css`.) Identique pour `apps/admin-app/src/index.css`. Cet import CSS relatif ne passe pas par la résolution `exports` de Node/TS (réservée aux imports JS/TS via `@chapelle/shared/...`) : il n'entre donc pas en contradiction avec la règle « aucun chemin profond accessible depuis les apps », qui vise les imports de **modules**, pas les `@import` CSS de build.

---

## 8. Squelettes `apps/*/src` (boot minimal, U0 uniquement)

### `main.tsx` (les deux apps, identique hors variable de nom)

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### `App.tsx` (squelette de vérification, à remplacer intégralement en U1/U8 par `RouterProvider`)

But unique : prouver que le bundling résout `@chapelle/shared/ui` et `@chapelle/shared/utils` via un import réel et un rendu minimal (pas de routing, pas de logique métier) :

```typescript
import { Button } from "@chapelle/shared/ui";
import { cn } from "@chapelle/shared/utils";

export default function App() {
  return (
    <div className={cn("flex min-h-screen items-center justify-center bg-ivory")}>
      <Button variant="primary">Chapelle du Vœux — socle prêt</Button>
    </div>
  );
}
```

`apps/admin-app/src/App.tsx` : même structure, texte adapté (ex. « Administration — socle prêt »).

### `index.css`

```css
@import "tailwindcss";
@import "../../../packages/shared/src/ui/theme.css";
```

---

## 9. ESLint + Prettier

### `eslint.config.js` (racine, flat config, `typescript-eslint`)

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  { ignores: ["**/dist", "**/node_modules", "**/coverage", "**/playwright-report"] },
  {
    files: ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
);
```

`strictTypeChecked` avec `projectService: true` fait porter le lint sur les `tsconfig.json` de chaque workspace (résolus automatiquement) — pas de `parserOptions.project` listé à la main.

### `.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### `.prettierignore`

```
dist
node_modules
coverage
playwright-report
public
```

---

## 10. Vitest (config uniquement, pas de tests métier)

`packages/shared/vitest.config.ts` (et un équivalent par app, `environment: "jsdom"` dans les trois cas car `ui/` contient des composants React testables) :

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: { lines: 80, functions: 80 },
    },
  },
});
```

`vitest.setup.ts` (identique dans les 3 workspaces) :
```typescript
import "@testing-library/jest-dom/vitest";
```

`apps/*/vitest.config.ts` : même forme, plus le plugin `@tailwindcss/vite` n'est pas nécessaire pour les tests (pas de rendu CSS en jsdom).

### Playwright (squelette, un par app)

`apps/user-app/playwright.config.ts` :
```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

`apps/admin-app/playwright.config.ts` : `baseURL: "http://localhost:3001"`, `port: 3001`. Aucun fichier `e2e/*.spec.ts` créé dans cette unité (scénarios métier hors périmètre U0).

---

## 11. Docker

### `apps/user-app/Dockerfile` (multi-stage, identique en forme pour `admin-app`)

```dockerfile
# ---- build ----
FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/user-app/package.json apps/user-app/package.json
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
RUN npm run build --workspace=apps/user-app

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime
COPY apps/user-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/user-app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Les `ARG`/`ENV` `VITE_*` sont indispensables **au moment du build** (Vite les inline en dur dans le bundle) : les passer seulement en variable d'environnement au conteneur `runtime` n'aurait aucun effet, le bundle étant déjà figé.

### `apps/user-app/nginx.conf` (fallback SPA)

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Identique pour `admin-app`.

### `docker-compose.yml` (racine)

```yaml
services:
  user-app:
    build:
      context: .
      dockerfile: apps/user-app/Dockerfile
      args:
        VITE_API_BASE_URL: http://localhost:8085/api/v1
        VITE_APP_NAME: "Adoration Chapelle du Vœux"
    ports:
      - "3000:80"

  admin-app:
    build:
      context: .
      dockerfile: apps/admin-app/Dockerfile
      args:
        VITE_API_BASE_URL: http://localhost:8085/api/v1
        VITE_APP_NAME: "Adoration Chapelle du Vœux — Administration"
    ports:
      - "3001:80"
```

**Point ouvert n°6** : le prompt mentionne une « intégration avec le backend » dans `docker-compose.yml` (§5, commentaire de l'arborescence) — le backend n'étant pas dans ce dépôt, aucun service backend n'est ajouté ici. À clarifier si un service `backend` (image externe) ou un réseau Docker partagé doit être préparé dès U0, ou si cela reste hors périmètre frontend.

---

## 13. Décisions de l'orchestrateur sur les points ouverts

1. **`legacy-template/`** → Retenu tel que proposé : déplacement non branché dans `apps/user-app/src/legacy-template/`. Évite la perte de contenu à la suppression de la racine, cohérent avec l'impact déjà annoncé dans `proposal.md`.
2. **Fuseau horaire** → Pas de nouvelle dépendance (`date-fns-tz`/`@date-fns/tz` non ajoutées). `formatters.ts` utilise `Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", ... })` pour l'affichage (formatage explicite au fuseau de Paris quel que soit le fuseau du poste client — plus robuste que de supposer un poste déjà à l'heure de Paris) ; `date-fns` reste utilisé pour l'arithmétique de dates sans dépendance de fuseau (comparaisons, ajout de durée).
3. **Collision `ApiError`** → Renommage retenu : `types/common.ts` exporte `ApiErrorPayload` (`{code, message}`) ; la classe `ApiError extends Error` reste propre à `@chapelle/shared/api`.
4. **Redirection 401/403** → Option (a) retenue : `createApiClient(baseURL: string, hooks?: { onUnauthorized?: () => void; onForbidden?: () => void })`. Chaque app injecte ses propres callbacks (redirection via son router) — le client HTTP ne dépend pas de `react-router`.
5. **Classes CSS globales du template** → Non migrées, confirmé. Traité au moment où U1/U6/U7/U8 adaptent `legacy-template/` (remplacement par les composants `ui/`).
6. **Service backend dans `docker-compose.yml`** → Hors périmètre confirmé : le backend est un dépôt séparé, aucun service factice ajouté ici. L'utilisateur pourra étendre `docker-compose.yml` lui-même pour une intégration locale s'il le souhaite.

## 12. Points ouverts (résumé)

1. **`legacy-template/`** : déplacement du template (Navbar/Footer/pages) dans `apps/user-app/src/legacy-template/` non branché — interprétation de la portée U0 à confirmer (alternative : laisser à la racine jusqu'à U1/U6/U7/U8).
2. **Fuseau horaire `Europe/Paris`** dans `formatters.ts` : besoin ou non de `date-fns-tz`/`@date-fns/tz` (dépendance non listée dans `tech-stack.md`) — à trancher avant l'implémentation.
3. **Collision de nom `ApiError`** : interface de payload swagger (`{code, message}`) vs. classe levée par le client HTTP — proposition de renommer l'interface `ApiErrorPayload` dans `types/common.ts`, à valider.
4. **Mécanisme de redirection 401/403** dans `createApiClient` : callbacks injectés (`onUnauthorized`/`onForbidden`) vs. `CustomEvent` DOM — à trancher avant l'implémentation de `api/client.ts` (impacte la signature de `createApiClient`, aujourd'hui `createApiClient(baseURL: string)` sans second paramètre).
5. **Classes utilitaires CSS globales du template** (`.btn-primary`, `.form-input`, `.glass`, etc.) : non migrées vers `theme.css` (ce sont des composants, pas des tokens) — à vérifier qu'aucune page de `legacy-template/` n'en dépendra silencieusement après suppression du CDN.
6. **Service backend dans `docker-compose.yml`** : absent de ce plan (backend hors dépôt) — à confirmer si une préparation (réseau Docker, service factice) est attendue dès U0.
