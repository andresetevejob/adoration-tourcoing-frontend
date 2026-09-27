# Conception — U6 : Annonces

Sources : `aidlc-docs/inception/user-stories/stories.md` (US-ANNONCES-01 à 04, Domaine 7), `aidlc-docs/inception/application-design/{unit-of-work,components,component-methods,services}.md` (contrat déjà figé : `useAnnonces`, `useCreateAnnonce`, `useUpdateAnnonce`, `useDeleteAnnonce`, `usePublishAnnonce` — signatures reprises telles quelles ci-dessous), `packages/shared/src/types/annonce.ts` (`StatutAnnonce`, `AnnonceResponse`, `AnnonceCreateRequest`, déjà exportés via `types/index.ts` — **aucun écart, rien à combler**), code déjà livré par U0/U1 (`createApiClient`/`ApiError`, `ProtectedRoute`, routes placeholder déjà posées dans les deux `router.tsx` — `/actualites` (user-app), `/annonces`, `/annonces/nouveau`, `/annonces/:id` (admin-app)) et par U4/U5 (patrons `PageDetailUtilisateur`/`UserForm`/`ConfirmActionModal` pour le CRUD+formulaire, `useVeilleurs`/`useAdmins` pour le listage à plat), et `apps/user-app/src/legacy-template/pages/Actualites.tsx` (gabarit visuel à reprendre).

Niveau conception uniquement : signatures, contrats, arborescence — **pas de corps de fonction, pas de JSX de rendu métier**.

**Rappel de périmètre (`unit-of-work.md`)** : U6 dépend de U0, U1 (auth admin pour le CRUD), ne bloque aucune unité suivante. **Première unité sans backend réel exposé** : toute la persistance passe par des handlers MSW dont le contrat HTTP est écrit pour être indiscernable d'un futur backend réel (mêmes chemins, mêmes types de requête/réponse déjà dans `SharedContracts`), afin qu'un rebranchement ultérieur ne touche que le fichier de handlers, jamais les hooks/composants consommateurs.

---

## 1. Décision structurante — emplacement des handlers MSW

**Handlers dans `packages/shared`, pas app-local.** Justification :

1. `unit-of-work.md`/`services.md` demandent explicitement un contrat MSW identique entre les deux apps (mêmes types de requête/réponse déjà partagés) pour permettre un rebranchement transparent — dupliquer les handlers dans `apps/user-app` et `apps/admin-app` créerait un risque de divergence (ex. une règle de validation ajoutée d'un côté et oubliée de l'autre) qu'un seul jeu de handlers partagé élimine par construction.
2. La règle « `apps/user-app`/`apps/admin-app` ne dépendent que de `packages/shared`, jamais l'une de l'autre » (`components.md`, rappelée dans `.claude/tech-stack.md`) est respectée : les handlers vivent dans `packages/shared`, chaque app les consomme via un sous-chemin `@chapelle/shared/mocks/*`, aucune dépendance croisée n'est introduite.
3. Limite assumée et non contournable : chaque app tourne comme un processus (onglet/serveur de dev) séparé — un worker MSW par app a donc son **propre état en mémoire**, non synchronisé entre `user-app` et `admin-app` en dev (cf. §7 point ouvert 1). Partager le code des handlers ne partage pas l'état runtime ; ce n'est de toute façon possible qu'avec un vrai backend, hors périmètre de cette unité.

Trois nouveaux sous-chemins déclarés dans `packages/shared/package.json > exports` (même logique qu'un sous-chemin par fichier que `/types`/`/api`/`/ui`/`/utils` — pas d'import profond non déclaré) :

```json
"./mocks/handlers": "./src/mocks/handlers.ts",
"./mocks/browser": "./src/mocks/browser.ts",
"./mocks/server": "./src/mocks/server.ts"
```

Trois entrées distinctes plutôt qu'un unique barrel `./mocks` : `browser.ts` importe `setupWorker` de `msw/browser` (API navigateur, `ServiceWorker`), `server.ts` importe `setupServer` de `msw/node` (API Node, utilisée par Vitest) — les mélanger dans un seul point d'entrée forcerait chaque consommateur (test Node comme bundle navigateur) à charger transitivement l'autre runtime, ce que `msw` ne garantit pas interopérable. `handlers.ts` (pur, sans dépendance de runtime) est importable des deux côtés sans risque.

### Nouvelle dépendance npm — `msw`

Ajoutée **uniquement** dans `packages/shared/package.json`, en `dependencies` (pas `devDependencies`) : `mocks/browser.ts` est importé — même conditionnellement, cf. §4 — depuis `main.tsx` de chaque app, un fichier source de production, pas un fichier de test ; la convention du monorepo (implicite dans U0-U5) réserve `devDependencies` aux fichiers `*.test.ts(x)`/config. Aucune des deux apps ne déclare `msw` dans son propre `package.json` : ni `user-app` ni `admin-app` n'importent jamais `msw` directement, uniquement `@chapelle/shared/mocks/*` — cohérent avec la règle « import via sous-chemin explicite de `@chapelle/shared`, jamais de chemin profond », ici étendue au fait qu'aucune app ne doit connaître l'existence de la librairie `msw` elle-même.

```json
// packages/shared/package.json — [MODIFIÉ]
"dependencies": {
  "clsx": "2.1.1",
  "tailwind-merge": "3.4.0",
  "zod": "^3.23.0",
  "msw": "^2.x"
}
```

---

## 2. Arborescence cible

```
packages/shared/
├── package.json                                [MODIFIÉ] +3 exports "./mocks/*", +dépendance msw (§1)
└── src/mocks/
    ├── annoncesStore.ts                         [CRÉÉ] "base de données" en mémoire + seed (§3)
    ├── annoncesStore.test.ts                    [CRÉÉ]
    ├── handlers.ts                              [CRÉÉ] handlers HTTP MSW pour /annonces (§4)
    ├── handlers.test.ts                         [CRÉÉ] (via `setupServer` local à ce fichier de test)
    ├── browser.ts                               [CRÉÉ] `setupWorker`, dev uniquement (§5.1)
    └── server.ts                                [CRÉÉ] `setupServer`, tests uniquement (§5.2)

apps/user-app/
├── public/
│   └── mockServiceWorker.js                     [GÉNÉRÉ] `npx msw init public/ --save` (§5.1)
├── vitest.setup.ts                               [MODIFIÉ] branchement `server` MSW (§5.2)
├── main.tsx                                       [MODIFIÉ] démarrage conditionnel du worker en dev (§5.1)
├── router.tsx                                     [MODIFIÉ] remplace le placeholder "/actualites" (§8)
└── src/
    ├── api/endpoints/
    │   ├── annonces.ts                          [CRÉÉ] `listAnnonces` (lecture seule) (§6.1)
    │   └── annonces.test.ts                      [CRÉÉ]
    ├── hooks/
    │   ├── useAnnonces.ts                        [CRÉÉ] (§6.2)
    │   └── useAnnonces.test.tsx                  [CRÉÉ]
    ├── lib/
    │   └── excerpt.ts                            [CRÉÉ] `truncateExcerpt` (§7.3)
    └── pages/
        ├── PageActualites.tsx                     [CRÉÉ] remplace `Actualites.tsx` (legacy) (§7)
        └── PageActualites.test.tsx                [CRÉÉ]

apps/admin-app/
├── public/
│   └── mockServiceWorker.js                     [GÉNÉRÉ] `npx msw init public/ --save` (§5.1)
├── vitest.setup.ts                               [MODIFIÉ] branchement `server` MSW (§5.2)
├── main.tsx                                       [MODIFIÉ] démarrage conditionnel du worker en dev (§5.1)
├── router.tsx                                     [MODIFIÉ] remplace les 3 placeholders "/annonces*" (§8)
└── src/
    ├── api/endpoints/
    │   ├── annonces.ts                          [CRÉÉ] CRUD complet + publier/dépublier (§6.1)
    │   └── annonces.test.ts                      [CRÉÉ]
    ├── hooks/
    │   ├── useAnnonces.ts                        [CRÉÉ] (§6.2, admin : tous statuts)
    │   ├── useAnnonce.ts                         [CRÉÉ] lecture unitaire (§6.3)
    │   ├── useCreateAnnonce.ts                   [CRÉÉ] (§6.4)
    │   ├── useUpdateAnnonce.ts                   [CRÉÉ] (§6.4)
    │   ├── useDeleteAnnonce.ts                   [CRÉÉ] (§6.4)
    │   ├── usePublishAnnonce.ts                  [CRÉÉ] (§6.4)
    │   └── *.test.tsx                             [CRÉÉ] un fichier par hook ci-dessus
    ├── components/
    │   ├── common/
    │   │   └── ConfirmActionModal.tsx            [DÉPLACÉ depuis components/users/] (§9.4)
    │   └── annonces/
    │       ├── AnnonceStatutBadge.tsx            [CRÉÉ] (§9.1)
    │       ├── AnnonceForm.tsx                    [CRÉÉ] (§9.2)
    │       └── AnnonceList.tsx                    [CRÉÉ] (§9.3)
    └── pages/
        ├── PageAnnonces.tsx                       [CRÉÉ] remplace le placeholder "/annonces" (§10.1)
        ├── PageAnnonceCreation.tsx                [CRÉÉ] remplace le placeholder "/annonces/nouveau" (§10.2)
        └── PageAnnonceEdition.tsx                 [CRÉÉ] remplace le placeholder "/annonces/:id" (§10.3)
```

Chaque fichier créé s'accompagne d'un `*.test.ts(x)` colocalisé (convention U0-U5), listé une seule fois par souci de lisibilité ci-dessus. Fichiers **explicitement réutilisés sans aucune modification** : `packages/shared/src/types/annonce.ts` (types déjà complets, cf. préambule), `ui/{Button,Card,Modal,Table,Pagination,Badge,Spinner,Toast}`, `utils/{cn,formatDate,DEFAULT_PAGE_SIZE}`, `api/client.ts` (les deux apps), `ProtectedRoute`.

---

## 3. « Base de données » en mémoire du mock — `packages/shared/src/mocks/annoncesStore.ts`

```typescript
// packages/shared/src/mocks/annoncesStore.ts

/** Seed déterministe (3-4 annonces, statuts variés BROUILLON/PUBLIE/DEPUBLIE, dates
 *  espacées) — même intention que les données statiques d'`Actualites.tsx` (legacy),
 *  conservée uniquement comme donnée de démo, jamais comme fallback de rendu (§7). */
function createInitialAnnonces(): AnnonceResponse[];

/** État module-level, **volontairement non persistant** au-delà du cycle de vie du
 *  processus qui l'héberge (onglet navigateur en dev, process Vitest en test) : pas de
 *  `localStorage`/`IndexedDB`. Un rechargement de page (dev) ou un nouveau fichier de
 *  test (module réinstancié par Vitest) repart du seed — cf. §7 point ouvert 2 sur les
 *  conséquences en dev, et §5.2 pour la remise à zéro entre tests. */
let annonces: AnnonceResponse[];

export function listAnnonces(statut?: StatutAnnonce): AnnonceResponse[];
// Tri par `datePublication` décroissant (annonce la plus récente en tête) — règle du mock,
// cf. §7 point ouvert 3 (aucun tri n'est spécifié par le Gherkin, décision arbitraire assumée).

export function getAnnonceById(id: string): AnnonceResponse | undefined;

export function createAnnonce(dto: AnnonceCreateRequest): AnnonceResponse;
// id via `crypto.randomUUID()`, statut initial toujours `StatutAnnonce.BROUILLON`
// (US-ANNONCES-02, non paramétrable par le dto — même verrouillage que `createUser`
// forçant `statutValidation: VALIDE`, U4 §2).

export function updateAnnonce(id: string, dto: Partial<AnnonceCreateRequest>): AnnonceResponse | undefined;
// Ne modifie jamais `statut` (absent de `AnnonceCreateRequest`) — seul `setAnnonceStatut`
// y touche, séparation volontaire (§4, §6.4).

export function deleteAnnonce(id: string): boolean;

export function setAnnonceStatut(id: string, statut: StatutAnnonce): AnnonceResponse | undefined;
// Transition valide uniquement vers PUBLIE/DEPUBLIE (jamais vers BROUILLON une fois
// l'annonce créée) — cf. §4 pour la réponse HTTP en cas de violation.

/** Réinitialise `annonces` au seed — appelé en `beforeEach` par les tests consommateurs
 *  (hooks/pages des deux apps, cf. §5.2) pour garantir l'isolation entre cas de test. */
export function resetAnnoncesStore(): void;
```

---

## 4. Handlers HTTP — `packages/shared/src/mocks/handlers.ts`

```typescript
// packages/shared/src/mocks/handlers.ts
import { http, HttpResponse, type HttpHandler } from "msw";
```

Chemins matchés en **wildcard d'origine** (`"*/annonces"`, pas une URL absolue) : les handlers ne connaissent pas `VITE_API_BASE_URL` (spécifique à chaque app, non lisible depuis `packages/shared`) — le préfixe `*` de `msw` fait correspondre n'importe quelle origine/base path se terminant par le chemin donné, ce qui découple totalement `packages/shared` de la configuration d'environnement de chaque app.

```typescript
export const annoncesHandlers: HttpHandler[] = [
  http.get("*/annonces", resolver),        // query optionnelle ?statut=; -> listAnnonces(statut)
  http.get("*/annonces/:id", resolver),    // 404 { code: "ANNONCE_NOT_FOUND", message } si absent
  http.post("*/annonces", resolver),       // body: AnnonceCreateRequest -> createAnnonce
  http.put("*/annonces/:id", resolver),    // body: Partial<AnnonceCreateRequest> -> updateAnnonce
  http.delete("*/annonces/:id", resolver), // -> deleteAnnonce, 204
  http.post("*/annonces/:id/publier", resolver),    // -> setAnnonceStatut(id, PUBLIE)
  http.post("*/annonces/:id/depublier", resolver),  // -> setAnnonceStatut(id, DEPUBLIE)
];
```

Choix `/annonces/:id/publier` + `/annonces/:id/depublier` (deux routes d'action dédiées, sans corps) plutôt qu'une unique route générique avec `{ statut }` en body : reprend exactement le patron déjà établi par `/users/{id}/valider`/`/users/{id}/rejeter` (U4, `api/endpoints/users.ts`) — cohérence transverse du contrat HTTP simulé avec celui déjà en usage, plutôt qu'un style ad hoc propre à cette unité.

Forme de réponse d'erreur : `HttpResponse.json({ code, message }, { status })`, même enveloppe `{code, message}` que `ApiErrorPayload` (`packages/shared/src/types/common.ts`) consommée par `parseErrorBody` (`createApiClient`) — garantit que `ApiError` (code/status/message) est levée côté client exactement comme avec un vrai backend. Cas gérés : 404 (`id` inconnu, sur GET détail / PUT / DELETE / publier / depublier), 400 (validation absente côté mock : champs `AnnonceCreateRequest` non vérifiés au-delà de leur présence, cf. §7 point ouvert 4 sur la validation Zod déjà faite côté formulaire, redondance non dupliquée ici).

---

## 5. Câblage du worker MSW

### 5.1 Dev — `browser.ts` + `main.tsx` (les deux apps)

```typescript
// packages/shared/src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { annoncesHandlers } from "./handlers";

export const worker: ReturnType<typeof setupWorker> = setupWorker(...annoncesHandlers);
```

```typescript
// apps/{user-app,admin-app}/src/main.tsx — [MODIFIÉ]
async function prepareMocks(): Promise<void>;
// if (import.meta.env.MODE !== "development") return;
// const { worker } = await import("@chapelle/shared/mocks/browser");
// await worker.start({ onUnhandledRequest: "bypass" });

// prepareMocks().then(() => { createRoot(...).render(...) });
```

Import dynamique (`await import(...)`), pas statique : gardé derrière `import.meta.env.MODE !== "development"`, Rollup élimine la branche (et donc le chunk `@chapelle/shared/mocks/browser` + `msw/browser`) du bundle de production — c'est le mécanisme documenté par MSW pour Vite, indispensable ici puisque `msw` ne doit jamais s'exécuter (ni même être chargé) en production. `onUnhandledRequest: "bypass"` : toute requête vers un chemin non intercepté (`/users`, `/planning`, etc., déjà servis par le vrai backend U0-U5) passe telle quelle au réseau — seules les routes `/annonces*` sont interceptées.

Asset généré (non écrit par ce plan, commande à exécuter une fois par app) :
```
cd apps/user-app  && npx msw init public/ --save
cd apps/admin-app && npx msw init public/ --save
```
Produit `public/mockServiceWorker.js` dans chaque app (fichier statique servi tel quel par Vite/Nginx, à committer) — sans lui, `worker.start()` échoue au runtime (le navigateur ne trouve pas le service worker à enregistrer).

### 5.2 Tests — `server.ts` + `vitest.setup.ts` (les deux apps)

```typescript
// packages/shared/src/mocks/server.ts
import { setupServer } from "msw/node";
import { annoncesHandlers } from "./handlers";

export const server: ReturnType<typeof setupServer> = setupServer(...annoncesHandlers);
```

```typescript
// apps/{user-app,admin-app}/vitest.setup.ts — [MODIFIÉ, ajout après le contenu existant]
import { server } from "@chapelle/shared/mocks/server";
import { resetAnnoncesStore } from "@chapelle/shared/mocks/handlers"; // ré-exporté depuis annoncesStore, cf. §3

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => { server.resetHandlers(); resetAnnoncesStore(); });
afterAll(() => server.close());
```

`onUnhandledRequest: "error"` sans risque de régression sur les tests U0-U5 existants : ceux-ci mockent `apiClient` via `vi.mock("../client", ...)` (cf. `users.test.ts`, `bookings.test.ts`) — le `fetch` réel n'est donc jamais invoqué, MSW n'intercepte rien pour ces tests, `onUnhandledRequest` ne s'applique qu'aux requêtes qui atteignent réellement `fetch`. Seuls les nouveaux tests de cette unité (§6, §9, §10) invoquent `apiClient` sans le mocker (cf. stratégie de test ci-dessous) et transitent donc réellement par MSW.

**Stratégie de test différenciée, décidée pour cette unité** :
- `api/endpoints/annonces.ts` (les deux apps) : convention U0-U5 inchangée, `vi.mock("../client")` — vérifie method/path/params/body envoyés, sans réseau (§6.1).
- Hooks (`useAnnonces`, `useAnnonce`, `useCreateAnnonce`, `useUpdateAnnonce`, `useDeleteAnnonce`, `usePublishAnnonce`) et pages (`PageActualites`, `PageAnnonces`, `PageAnnonceCreation`, `PageAnnonceEdition`) : **pas** de `vi.mock("../client")` — `apiClient` réel, intercepté par le `server` MSW global (§5.2). Choix motivé par l'absence de backend réel à ce jour pour cette unité : c'est la seule façon de vérifier, sans double d'implémentation divergent, que le contrat HTTP simulé (chemins, query params, formes de requête/réponse) est correctement consommé de bout en bout — une régression du contrat MSW (ex. mauvais nom de query param) serait invisible à un simple `vi.mock("../client")` mais détectée ici.

---

## 6. Endpoints & hooks partagés par les deux apps (dupliqués par fichier, jamais par code)

Chaque app conserve son propre `api/endpoints/annonces.ts` et `hooks/useAnnonces.ts` (aucune dépendance croisée `user-app`/`admin-app`, règle rappelée en préambule) — seule la partie strictement nécessaire à chaque app est présente (user-app : lecture seule ; admin-app : CRUD complet).

### 6.1 `api/endpoints/annonces.ts`

```typescript
// apps/user-app/src/api/endpoints/annonces.ts
export interface ListAnnoncesParams {
  statut?: StatutAnnonce;
}

/** GET /annonces?statut= — endpoint public, aucune garde d'authentification (US-ANNONCES-01,
 *  persona Anonyme inclus), même absence de garde que `getPlanning` (U2). */
export function listAnnonces(params: ListAnnoncesParams): Promise<AnnonceResponse[]> {
  return apiClient.get<AnnonceResponse[]>("/annonces", { statut: params.statut });
}
```

```typescript
// apps/admin-app/src/api/endpoints/annonces.ts
export interface ListAnnoncesParams {
  statut?: StatutAnnonce;
}

export function listAnnonces(params: ListAnnoncesParams): Promise<AnnonceResponse[]>;
// GET /annonces?statut=

export function getAnnonce(id: string): Promise<AnnonceResponse>;
// GET /annonces/{id}

export function createAnnonce(dto: AnnonceCreateRequest): Promise<AnnonceResponse>;
// POST /annonces, { skipForbiddenRedirect: true } — même précaution que `createUser` (U4) :
// un refus scoped à cette route ne doit pas rediriger toute l'admin-app vers /non-autorise.

export function updateAnnonce(id: string, dto: Partial<AnnonceCreateRequest>): Promise<AnnonceResponse>;
// PUT /annonces/{id}, { skipForbiddenRedirect: true }

export function deleteAnnonce(id: string): Promise<void>;
// DELETE /annonces/{id}, { skipForbiddenRedirect: true }

export function publishAnnonce(id: string, statut: StatutAnnonce): Promise<AnnonceResponse>;
// POST /annonces/{id}/publier ou /annonces/{id}/depublier selon `statut`
// (branchement sur le nom de route interne à cette fonction, cf. §4), { skipForbiddenRedirect: true }
```

Réponse du mock non paginée (`AnnonceResponse[]`, pas `SpringPage<AnnonceResponse>`) : contrairement à `GET /users`/`GET /planning` (vrai backend, pagination Spring), il n'existe aucune spécification de pagination côté serveur pour `/annonces` dans les récits — traité comme une liste à plat, pagination éventuelle purement côté client (§7, §10.1), cf. §7 point ouvert 5.

### 6.2 `hooks/useAnnonces.ts` — contrat déjà figé (`component-methods.md`)

```typescript
// signature identique dans les deux apps
export function useAnnonces(filters?: { statut?: StatutAnnonce }): UseQueryResult<AnnonceResponse[]> {
  // queryKey: ["annonces", "list", filters?.statut]
  // queryFn: () => listAnnonces({ statut: filters?.statut })
}
```

`user-app` (`PageActualites`, §7) appelle systématiquement `useAnnonces({ statut: StatutAnnonce.PUBLIE })` — jamais sans filtre, conformément à US-ANNONCES-01 (« je vois la liste des annonces au statut PUBLIE »). `admin-app` (`PageAnnonces`, §10.1) appelle `useAnnonces()` sans filtre (visibilité de toutes les annonces quel que soit leur statut, y compris `BROUILLON`/`DEPUBLIE`, nécessaire pour les publier/dépublier/modifier).

### 6.3 `hooks/useAnnonce.ts` (admin-app uniquement)

```typescript
// apps/admin-app/src/hooks/useAnnonce.ts
export function useAnnonce(id: string): UseQueryResult<AnnonceResponse> {
  // queryKey: ["annonces", "detail", id]
  // queryFn: () => getAnnonce(id)
}
```

Nécessaire pour `PageAnnonceEdition` (`/annonces/:id`, §10.3) accédée par URL directe — même rôle que `useUser(id)` pour `PageDetailUtilisateur` (U4).

### 6.4 Mutations (admin-app uniquement) — contrat déjà figé (`component-methods.md`)

```typescript
export function useCreateAnnonce(): UseMutationResult<AnnonceResponse, ApiError, AnnonceCreateRequest>;
export function useUpdateAnnonce(): UseMutationResult<AnnonceResponse, ApiError, { id: string; dto: Partial<AnnonceCreateRequest> }>;
export function useDeleteAnnonce(): UseMutationResult<void, ApiError, string>;
export function usePublishAnnonce(): UseMutationResult<AnnonceResponse, ApiError, { id: string; statut: StatutAnnonce }>;
```

Toutes invalident par préfixe `["annonces"]` (`queryClient.invalidateQueries({ queryKey: ["annonces"] })`), même patron que `["users"]` (U4 §5.3) : couvre `["annonces", "list", ...]` (`useAnnonces`, les deux apps **si elles partageaient le même `queryClient`** — ce qui n'est pas le cas, deux apps = deux `QueryClient` séparés, §7 point ouvert 1) et `["annonces", "detail", id]` (`useAnnonce`). `usePublishAnnonce.mutate({ id, statut })` : `statut` attendu ∈ `{PUBLIE, DEPUBLIE}` uniquement — imposé par les deux seuls call sites (`AnnonceList`, §9.3, boutons "Publier"/"Dépublier"), jamais par une validation locale au hook (le mock renvoie une erreur si violé, cf. §4). Toast de succès/erreur sur chaque mutation, même patron que `useCreateUser`/`useUpdateUser`/`useDeleteUser` (U4) : « Annonce créée. »/« Annonce modifiée. »/« Annonce supprimée. »/« Statut de l'annonce mis à jour. ».

---

## 7. `user-app` — `pages/PageActualites.tsx` (remplace `legacy-template/pages/Actualites.tsx`)

Reprend la structure visuelle du template legacy (Hero statique inchangé, grille de cartes, pagination, modal de détail) en la reconnectant à `useAnnonces({ statut: StatutAnnonce.PUBLIE })` au lieu du tableau `allNews` statique. `legacy-template/pages/Actualites.tsx` n'est plus référencé par aucune route après ce remplacement — conservé tel quel dans `legacy-template/` (non supprimé, même sort que les autres pages legacy déjà « absorbées » par U0-U5, à titre de référence visuelle) mais son import dans `router.tsx` disparaît (§8).

**Écarts de contrat à documenter — `AnnonceResponse` n'a ni `image`, ni `category`, ni `excerpt` :**

| Élément visuel (legacy) | Origine avec `AnnonceResponse` |
|---|---|
| `item.title` | `titre` |
| `item.date` | `formatDate(datePublication)` (`@chapelle/shared/utils`, `dd/MM/yyyy`) |
| `item.excerpt` (carte) | `truncateExcerpt(contenu, 220)` (§7.3, nouvelle fonction) |
| `item.content` (modal détail) | `contenu` intégral, sans troncature |
| `item.category` (badge coloré) | **Supprimé** — aucun équivalent dans le contrat, badge non affiché plutôt qu'une valeur inventée |
| `item.image` (photo de couverture) | **Supprimé** — remplacé par un bandeau ornemental statique (même traitement visuel que le hero, ex. motif doré/icône `✦`), pas d'`<img>` : aucune source d'image n'existe dans `AnnonceCreateRequest`, en inventer une (placeholder générique) serait trompeur |

### 7.1 États de la page

- `annoncesQuery.isLoading` → `Spinner` (`@chapelle/shared/ui`), remplace l'absence de gestion de chargement du template legacy (données statiques, jamais async).
- `annoncesQuery.isError` → message « Impossible de charger les actualités. Veuillez réessayer plus tard. » (même sobriété que `PageGestionUtilisateurs`, U4).
- `annoncesQuery.data` vide → conserve le message legacy « Aucune actualité pour le moment. ».

### 7.2 Pagination et modal — composants partagés au lieu du markup bespoke

Remplace la pagination custom (boutons ronds numérotés, JSX dupliqué du template) par `<Pagination page totalPages onPageChange>` (`@chapelle/shared/ui`, déjà utilisée par `PageGestionUtilisateurs`) appliquée à un découpage client (`useAnnonces` renvoie un tableau à plat, sans pagination serveur, cf. §6.1) — état local `page: number`, `ITEMS_PER_PAGE` repris du legacy (`4`). Remplace la modal de détail bespoke (`div` `fixed inset-0` custom) par `<Modal isOpen title={selected.titre} onClose={...}>{selected.contenu}</Modal>` (`@chapelle/shared/ui`, déjà utilisée par tout le reste du projet) — écart assumé par rapport au rendu pixel-perfect du template (fond doré/photo dans l'en-tête de la modal legacy disparaît, cohérent avec l'absence d'`image`), au bénéfice de la cohérence transverse avec le design system déjà en place plutôt qu'une deuxième implémentation de modal.

### 7.3 `lib/excerpt.ts`

```typescript
// apps/user-app/src/lib/excerpt.ts
const EXCERPT_MAX_LENGTH = 220;

/** Tronque `contenu` à `EXCERPT_MAX_LENGTH` caractères pour l'aperçu en carte, ajoute
 *  une ellipse si tronqué ; retourne `contenu` inchangé si déjà plus court. Coupe sur
 *  un espace (pas au milieu d'un mot) quand c'est possible. */
export function truncateExcerpt(contenu: string, maxLength?: number): string;
```

---

## 8. Routage — `router.tsx` (les deux apps)

```typescript
// apps/user-app/src/router.tsx — [MODIFIÉ] seul le contenu de la route change
{ path: "/actualites", element: <PageActualites /> }, // public, pas de ProtectedRoute (US-ANNONCES-01, persona Anonyme)
```

```typescript
// apps/admin-app/src/router.tsx — [MODIFIÉ] les 3 routes gardent leur ProtectedRoute existante
{
  path: "/annonces",
  element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PageAnnonces /></ProtectedRoute>,
},
{
  path: "/annonces/nouveau",
  element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PageAnnonceCreation /></ProtectedRoute>,
},
{
  path: "/annonces/:id",
  element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PageAnnonceEdition /></ProtectedRoute>,
},
```

`ADMIN_ROLES = [ADMINISTRATEUR, SUPERADMINISTRATEUR]` déjà défini dans `router.tsx` (admin-app) et déjà appliqué à ces trois routes par un unité antérieure (U1/U8, hors périmètre ici) — seul le remplacement des trois imports `PagePlaceholder` par `PageAnnonces`/`PageAnnonceCreation`/`PageAnnonceEdition` est à faire, aucune garde nouvelle. Cohérent avec `unit-of-work.md` (« CRUD » ouvert à Administrateur et SuperAdministrateur, contrairement à U5 réservée au seul SuperAdministrateur).

---

## 9. `admin-app` — composants `components/annonces/`

### 9.1 `AnnonceStatutBadge.tsx`

Composant additionnel non nommé explicitement par `components.md` mais suivant le précédent direct `StatutValidationBadge` (U4) — même patron `Record<Statut, variant>`/`Record<Statut, label>` :

```typescript
// apps/admin-app/src/components/annonces/AnnonceStatutBadge.tsx
export interface AnnonceStatutBadgeProps {
  statut: StatutAnnonce;
}

// BROUILLON -> variant "neutral", label "Brouillon"
// PUBLIE    -> variant "success", label "Publié"
// DEPUBLIE  -> variant "warning", label "Dépublié"
export function AnnonceStatutBadge(props: AnnonceStatutBadgeProps): JSX.Element;
```

### 9.2 `AnnonceForm.tsx`

Patron direct de `UserForm` (U4) : union discriminée `mode: "create" | "edit"`, schéma Zod local (pas dans `@chapelle/shared/utils`, structure propre à ce formulaire, même choix que U4 §6.7).

```typescript
export type AnnonceFormProps =
  | {
      mode: "create";
      isSubmitting: boolean;
      onSubmit: (dto: AnnonceCreateRequest) => void;
      onCancel: () => void;
    }
  | {
      mode: "edit";
      defaultValues: { titre: string; contenu: string; datePublication: string };
      isSubmitting: boolean;
      onSubmit: (dto: Partial<AnnonceCreateRequest>) => void;
      onCancel?: () => void;
    };

function buildAnnonceFormSchema(): z.ZodSchema<{ titre: string; contenu: string; datePublication: string }>;
// titre: z.string().min(1).max(255) ; contenu: z.string().min(1).max(5000) ;
// datePublication: z.string() au format `yyyy-MM-dd` (`<input type="date">`), converti en
// ISO avant envoi si nécessaire — cf. §11 point ouvert sur le format exact attendu par le mock.

export function AnnonceForm(props: AnnonceFormProps): JSX.Element;
```

Pas de champ `statut` dans ce formulaire (ni en création ni en édition) : la transition de statut passe exclusivement par `usePublishAnnonce` (§6.4, §9.3) — même séparation que `updateAnnonce`/`setAnnonceStatut` côté mock (§3).

### 9.3 `AnnonceList.tsx`

Patron direct de `UserTable` (U4/U5), sans le paramètre `renderRowActions` générique (un seul appelant ici, `PageAnnonces`, contrairement à `UserTable` réutilisée par U4 et U5) :

```typescript
export interface AnnonceListProps {
  annonces: AnnonceResponse[];
  isLoading: boolean;
  onEdit: (annonce: AnnonceResponse) => void;
  onDelete: (annonce: AnnonceResponse) => void;
  onTogglePublication: (annonce: AnnonceResponse) => void;
  isTogglingId?: string; // id de l'annonce dont la mutation publier/dépublier est en cours (désactive son bouton)
}

// Colonnes : Titre, Date de publication (formatDate), Statut (AnnonceStatutBadge),
// Actions (bouton "Modifier" -> onEdit, "Publier"/"Dépublier" -> onTogglePublication
// selon `annonce.statut` — libellé "Publier" si BROUILLON/DEPUBLIE, "Dépublier" si PUBLIE,
// "Supprimer" -> onDelete).
export function AnnonceList(props: AnnonceListProps): JSX.Element;
```

### 9.4 Écart — déplacement de `ConfirmActionModal.tsx`

`ConfirmActionModal` (U4 §6.5, `apps/admin-app/src/components/users/ConfirmActionModal.tsx`) est déjà documenté comme « seul composant réellement générique du module `UserManagementModule` » (trois usages : `ValidationActions`, `PageDetailUtilisateur`, `AdminsListPage`). `AnnonceList`/`PageAnnonces` (§10.1) en ont besoin pour la suppression — un quatrième usage, cette fois hors du module utilisateurs. Le laisser sous `components/users/` rendrait l'import `AnnonceList` (`../users/ConfirmActionModal`) trompeur (dépendance apparente d'un module fonctionnel sur un autre). Ce plan déplace le fichier vers `components/common/ConfirmActionModal.tsx` (nouveau dossier, non existant), sans modifier son contrat :

Fichiers impactés par le déplacement (imports à réécrire, aucun changement de comportement) :
- `apps/admin-app/src/components/users/ValidationActions.tsx`
- `apps/admin-app/src/pages/PageDetailUtilisateur.tsx`
- `apps/admin-app/src/pages/superadmin/AdminsListPage.tsx`
- `apps/admin-app/src/components/users/ConfirmActionModal.test.tsx` → déplacé vers `components/common/ConfirmActionModal.test.tsx`

---

## 10. `admin-app` — pages

### 10.1 `pages/PageAnnonces.tsx`

Remplace le `PagePlaceholder title="Annonces"` sur `/annonces`. État local : `editingAnnonce`/`deletingAnnonce: AnnonceResponse | null` — mais **contrairement à `AdminsListPage` (U5)**, l'édition n'ouvre pas de modale inline : elle navigue vers `/annonces/{id}` (§10.3), cohérent avec le fait que `unit-of-work.md`/`router.tsx` nomment une route d'édition dédiée pour cette unité (absente en U5). Seule `deletingAnnonce` reste un état local (modale de confirmation, pas de route dédiée pour la suppression).

- `useAnnonces()` (sans filtre, §6.2), `useDeleteAnnonce()`, `usePublishAnnonce()` (§6.4), `useNavigate()`.
- En-tête : titre « Gestion des annonces » + `Button onClick={() => navigate("/annonces/nouveau")}` « Ajouter une annonce ».
- `annoncesQuery.isError` → message « Impossible de charger les annonces. Veuillez réessayer plus tard. ».
- Sinon : `<AnnonceList annonces={annoncesQuery.data ?? []} isLoading={annoncesQuery.isLoading} onEdit={(a) => navigate(`/annonces/${a.id}`)} onDelete={setDeletingAnnonce} onTogglePublication={(a) => publishAnnonce.mutate({ id: a.id, statut: a.statut === PUBLIE ? DEPUBLIE : PUBLIE })} isTogglingId={publishAnnonce.isPending ? publishAnnonce.variables?.id : undefined} />`.
- `<ConfirmActionModal isOpen={deletingAnnonce !== null} title="Supprimer l'annonce" message="Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible." confirmLabel="Supprimer" confirmVariant="danger" isSubmitting={deleteAnnonce.isPending} onConfirm={...} onClose={...} />` (composant déplacé, §9.4, quatrième usage).

### 10.2 `pages/PageAnnonceCreation.tsx`

Remplace le `PagePlaceholder title="Nouvelle annonce"` sur `/annonces/nouveau`. Patron identique à `AdminCreatePage` (U5) : lien « Retour à la liste » (`Link to="/annonces"`), `<Card title="Nouvelle annonce"><AnnonceForm mode="create" isSubmitting={createAnnonce.isPending} onSubmit={(dto) => createAnnonce.mutate(dto, { onSuccess: () => navigate("/annonces") })} onCancel={() => navigate("/annonces")} /></Card>`.

### 10.3 `pages/PageAnnonceEdition.tsx`

Remplace le `PagePlaceholder title="Édition annonce"` sur `/annonces/:id`. Patron `PageDetailUtilisateur` (U4) simplifié (pas de sous-composant `UserProfile`/`ValidationActions` équivalent ici, une annonce n'a pas de profil à afficher séparément du formulaire) :

- `useParams<{ id: string }>()`, `useAnnonce(id)` (§6.3), `useUpdateAnnonce()`, `useNavigate()`.
- `annonceQuery.isLoading` → `Spinner`.
- `annonceQuery.isError || !annonceQuery.data` → « Annonce introuvable. » + lien retour (même sobriété que `PageDetailUtilisateur`).
- Sinon : `<Card title="Modifier l'annonce"><AnnonceForm mode="edit" defaultValues={{ titre, contenu, datePublication }} isSubmitting={updateAnnonce.isPending} onSubmit={(dto) => updateAnnonce.mutate({ id, dto })} onCancel={() => navigate("/annonces")} /></Card>`.
- Pas d'action Publier/Dépublier/Supprimer sur cette page : ces actions restent exclusivement sur `PageAnnonces` (§10.1) — cohérent avec le fait qu'US-ANNONCES-04 (modifier/supprimer) et US-ANNONCES-03 (publier/dépublier) sont deux récits distincts, et qu'`unit-of-work.md` ne nomme pas de bouton de publication sur une page de détail dédiée. Cf. §11 point ouvert 1.

---

## 11. Points ouverts pour l'orchestrateur

1. **Publier/dépublier absent de `PageAnnonceEdition`** (§10.3) : un administrateur arrivé sur `/annonces/{id}` par URL directe doit revenir à `/annonces` pour changer le statut de publication. Défendable (séparation stricte des deux récits US-ANNONCES-03/04) mais une lecture plus permissive du Gherkin ("étant donné une annonce existante", sans préciser la page) autoriserait tout aussi bien à dupliquer l'action sur cette page. À trancher si l'ergonomie décrite ici surprend.
2. **Non-synchronisation de l'état mock entre `user-app` et `admin-app`** (§1) : publier une annonce dans `admin-app` (un onglet/serveur de dev) ne la rend pas visible dans `user-app` (un autre onglet/serveur de dev) tant qu'aucun rechargement complet des deux workers n'a eu lieu avec le même seed — chacun a son propre état en mémoire, propre au processus. Limitation inhérente à l'absence de backend réel pour cette unité, non résolue par le partage du *code* des handlers (§1). À vérifier que cette limitation est acceptable pour les démonstrations/recette manuelle de cette unité.
3. **Tri par défaut des annonces (`datePublication` décroissant, §3)** et **pagination `ITEMS_PER_PAGE=4` reprise du template legacy (§7.2)** : aucun des deux n'est spécifié par le Gherkin — choix arbitraires assumés, à confirmer ou ajuster.
4. **Absence de validation de format sur `datePublication`** côté mock (§4, §9.2) : le schéma Zod du formulaire (`AnnonceForm`) contraint la saisie, mais le handler MSW ne revalide rien côté "serveur" — écart mineur par rapport à un vrai backend qui validerait indépendamment de l'UI ; sans conséquence pratique tant que `AnnonceForm` reste l'unique point d'entrée des mutations.
5. **Absence de pagination serveur sur `GET /annonces`** (§6.1, réponse `AnnonceResponse[]` à plat) : si le nombre d'annonces croît significativement une fois un vrai backend branché, ce contrat non paginé devrait être revu en même temps que le remplacement des handlers MSW par de vrais appels HTTP — signalé ici pour que ce point ne soit pas oublié lors du rebranchement (hors périmètre de cette unité).
