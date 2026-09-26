# Conception — U1 : Authentification & Comptes

Sources : `aidlc-docs/inception/user-stories/stories.md` (US-AUTH-01 à 08, approuvés), `aidlc-docs/inception/application-design/{unit-of-work,components,component-methods,services,component-dependency}.md`, `prompt-frontend-revise.md` §5/§6/§7, `packages/shared/src/**` (contrats U0 déjà livrés, non redéfinis ici), `aidlc-docs/construction/plans/u0-socle-frontend-design.md` (point ouvert n°4 repris et tranché ci-dessous).

Niveau conception uniquement : signatures, contrats, arborescence, schéma de routes — **pas de corps de fonction, pas de JSX de rendu métier**.

---

## 0. Correctif prérequis — bug bloquant dans `packages/shared/src/api/client.ts`

Avant toute implémentation de U1, `packages/shared/src/api/client.ts` (livré par U0) doit être corrigé : la condition qui déclenche `onUnauthorized` (ligne ~122) ne tient pas compte de `skipAuthRetry` :

```typescript
// actuel (bug)
if (response.status === 401 && !isInternalRefresh) {
  hooks?.onUnauthorized?.();
}

// corrigé
if (response.status === 401 && !options?.skipAuthRetry && !isInternalRefresh) {
  hooks?.onUnauthorized?.();
}
```

**Pourquoi c'est bloquant** : `login()`/`register()` appellent `apiClient.post("/auth/login", dto, { skipAuthRetry: true })`. Avec le code actuel, un 401 sur `/auth/login` contourne bien la branche retry/refresh (grâce à `skipAuthRetry`), mais tombe quand même dans la seconde branche (`!isInternalRefresh` est vrai) et déclenche `onUnauthorized`. Dès que U1 câble `onUnauthorized` sur une navigation réelle (§4), toute tentative de connexion échouée (identifiants invalides, compte `EN_ATTENTE`/`REJETE`) provoquerait une redirection intempestive vers `/connexion`, en contradiction directe avec US-AUTH-04 ("aucune tentative de rafraîchissement de session ni redirection n'est déclenchée"). Ce correctif est un prérequis technique de U1, pas une extension de son périmètre — à traiter en premier, avec ses tests dans `packages/shared/src/api/client.test.ts`.

---

## 1. Arborescence cible

```
packages/shared/src/utils/
├── validators.ts                         [MODIFIÉ] + updateProfileSchema (§6)
└── index.ts                              [MODIFIÉ] réexporte updateProfileSchema

apps/user-app/src/
├── main.tsx                               [MODIFIÉ] QueryClientProvider + ToastProvider + App
├── App.tsx                                [MODIFIÉ] providers + <RouterProvider router={router} />
├── App.test.tsx                           [MODIFIÉ] adapté au nouveau contenu de App.tsx
├── vite-env.d.ts                          [inchangé]
├── lib/
│   ├── navigation.ts                      [CRÉÉ] pont apiClient <-> router (§4)
│   └── queryClient.ts                     [CRÉÉ] instance QueryClient partagée par l'app
├── router.tsx                             [CRÉÉ] arborescence de routes (§5)
├── store/
│   └── authStore.ts                       [CRÉÉ] Zustand, instance user-app (§3)
├── api/
│   ├── client.ts                          [CRÉÉ] apiClient = createApiClient(baseURL, hooks) (§4)
│   └── endpoints/
│       ├── auth.ts                        [CRÉÉ] register, login, logout, refresh
│       ├── users.ts                       [CRÉÉ] updateUser uniquement (U4 l'étendra)
│       └── bookings.ts                    [CRÉÉ] getMyBookings uniquement (U3 l'étendra)
├── hooks/
│   ├── useAuth.ts                         [CRÉÉ]
│   ├── useUpdateProfile.ts                [CRÉÉ]
│   └── useMyBookings.ts                   [CRÉÉ]
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx             [CRÉÉ]
│   │   ├── LoginForm.tsx                  [CRÉÉ]
│   │   └── RegisterForm.tsx               [CRÉÉ]
│   ├── profile/
│   │   ├── ProfileCard.tsx                [CRÉÉ] affichage lecture
│   │   ├── ProfileEditForm.tsx            [CRÉÉ] nom/prénoms/téléphone
│   │   └── MyBookingsList.tsx             [CRÉÉ] Veilleur uniquement
│   └── layout/
│       ├── PublicLayout.tsx               [CRÉÉ] <Outlet/> + entête minimale (§7)
│       ├── AppLayout.tsx                  [CRÉÉ] <Outlet/> + entête minimale authentifiée
│       └── AuthNav.tsx                    [CRÉÉ] liens Connexion/Inscription ou Mon compte/Déconnexion
├── pages/
│   ├── PageAccueil.tsx                    [CRÉÉ] contenu minimal (remplace le contenu de App.tsx actuel)
│   ├── PageConnexion.tsx                  [CRÉÉ]
│   ├── PageInscription.tsx                [CRÉÉ]
│   ├── PageConfirmationInscription.tsx    [CRÉÉ]
│   ├── PageMonCompte.tsx                  [CRÉÉ]
│   ├── Page403.tsx                        [CRÉÉ]
│   ├── Page404.tsx                        [CRÉÉ]
│   └── PagePlaceholder.tsx                [CRÉÉ] pages hors périmètre U1 (§5.3)
└── legacy-template/
    └── pages/
        ├── InscriptionLecteur.tsx          [SUPPRIMÉ] superseded par RegisterForm (§8)
        └── InscriptionVeilleur.tsx         [SUPPRIMÉ] superseded par RegisterForm (§8)

apps/admin-app/src/
├── main.tsx                               [MODIFIÉ] identique en forme à user-app
├── App.tsx                                [MODIFIÉ]
├── App.test.tsx                           [MODIFIÉ]
├── lib/
│   ├── navigation.ts                      [CRÉÉ]
│   └── queryClient.ts                     [CRÉÉ]
├── router.tsx                             [CRÉÉ]
├── store/
│   └── authStore.ts                       [CRÉÉ] instance admin-app, indépendante
├── api/
│   ├── client.ts                          [CRÉÉ]
│   └── endpoints/
│       ├── auth.ts                        [CRÉÉ] login, logout, refresh (pas de register)
│       └── users.ts                       [CRÉÉ] updateUser uniquement (U4 l'étendra)
├── hooks/
│   ├── useAuth.ts                         [CRÉÉ]
│   └── useUpdateProfile.ts                [CRÉÉ]
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx             [CRÉÉ]
│   │   └── LoginForm.tsx                  [CRÉÉ]
│   ├── profile/
│   │   ├── ProfileCard.tsx                [CRÉÉ]
│   │   └── ProfileEditForm.tsx            [CRÉÉ]
│   └── layout/
│       ├── PublicLayout.tsx               [CRÉÉ]
│       ├── AdminLayout.tsx                [CRÉÉ] Header + Sidebar + <Outlet/>
│       ├── Header.tsx                     [CRÉÉ]
│       └── Sidebar.tsx                    [CRÉÉ] liens filtrés par rôle
└── pages/
    ├── PageConnexion.tsx                  [CRÉÉ]
    ├── PageMonCompte.tsx                  [CRÉÉ]
    ├── Page403.tsx                        [CRÉÉ]
    ├── Page404.tsx                        [CRÉÉ]
    └── PagePlaceholder.tsx                [CRÉÉ] PageGestionUtilisateurs/Planning/Annonces/Administrateurs (§5.3)
```

Chaque fichier créé ci-dessus s'accompagne d'un `*.test.ts(x)` colocalisé (convention déjà en place en U0), non détaillé ici.

---

## 2. `packages/shared` — seule extension nécessaire

### `utils/validators.ts`

```typescript
export const updateProfileSchema = z.object({
  email: emailSchema,
  nom: nomSchema,
  prenoms: prenomsSchema,
  telephone: telephoneSchema,
});
```

Justifié par le besoin **identique dans les deux apps** (page "Mon compte") de valider le même sous-ensemble de champs que `RegisterRequest`/`UpdateUserRequest`, avec les mêmes règles déjà factorisées (`emailSchema`, `nomSchema`, `prenomsSchema`, `telephoneSchema`). Réexporté par `utils/index.ts`. Aucun autre ajout à `packages/shared` : `types`, `api`, `ui` restent inchangés (hors le correctif §0).

---

## 3. `store/authStore.ts` — une instance par app

Contrat repris de `component-methods.md`, complété par la persistance nécessaire à la restauration de session après rechargement (le swagger n'expose aucun endpoint `/auth/me` : `AuthResponse.user` n'est renvoyé que par `login`/`register`, jamais par `refresh`, qui répond `204` sans corps — cf. §9 point ouvert 1) :

```typescript
interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;   // dérivé : !!user
  isHydrated: boolean;        // false jusqu'à la réhydratation zustand/persist
  setUser(user: UserResponse | null): void;
  clear(): void;
}

function useAuthStore(): AuthState; // hook Zustand, créé via create<AuthState>()(persist(...))
```

- Middleware `zustand/middleware` `persist`, clé `chapelle-user-auth-store` (`chapelle-admin-auth-store` pour l'autre app), `storage: createJSONStorage(() => localStorage)`, `partialize` : persiste uniquement `{ user }` (aucun token, aucune donnée de mot de passe — conforme à la NFR sécurité). Callback `onRehydrateStorage` bascule `isHydrated` à `true`.
- Ce `user` persisté est une **information d'affichage optimiste** (évite un flash "non connecté" au rechargement) : la vérité de session reste le cookie `httpOnly` côté backend ; tout appel API réel qui échoue en 401 déclenche le flux refresh → `onUnauthorized` (§4), qui appelle `clear()` (et donc vide aussi le stockage persistant).

---

## 4. Câblage réel 401/403 — résolution du point ouvert n°4 de U0

### `lib/navigation.ts` (identique en forme dans les deux apps)

```typescript
type NavigateFn = (to: string, options?: { replace?: boolean }) => void;

function setNavigate(fn: NavigateFn): void;
function navigate(to: string, options?: { replace?: boolean }): void;
```

Module tampon sans dépendance à React Router ni à `api/client.ts` : `router.tsx` y enregistre la fonction de navigation du data router juste après sa création ; `api/client.ts` l'importe pour naviguer depuis un contexte hors-React. Aucun cycle d'import (`router.tsx` et `api/client.ts` dépendent tous deux de `lib/navigation.ts`, jamais l'un de l'autre) — c'est la condition qui permet à `router.tsx` d'importer statiquement les pages d'authentification sans créer de boucle avec le client HTTP qu'elles consomment indirectement via leurs hooks.

### `api/client.ts` (app-level, pas dans `packages/shared`)

```typescript
export const apiClient: ApiClient; // createApiClient(import.meta.env.VITE_API_BASE_URL, { onUnauthorized, onForbidden })
```

- `onUnauthorized` : `useAuthStore.getState().clear()` puis `navigate("/connexion", { replace: true })`.
- `onForbidden` : `navigate("/non-autorise", { replace: true })` (pas de `clear()` : un 403 ne signifie pas une session invalide, seulement un droit insuffisant sur la ressource).
- `router.tsx` appelle `setNavigate((to, options) => { router.navigate(to, options); })` immédiatement après `createBrowserRouter(...)`.

### `api/endpoints/auth.ts`

```typescript
function login(dto: LoginRequest): Promise<AuthResponse>;      // apiClient.post("/auth/login", dto, { skipAuthRetry: true })
function register(dto: RegisterRequest): Promise<AuthResponse>; // idem, user-app uniquement — apiClient.post("/auth/register", dto, { skipAuthRetry: true })
function logout(): Promise<void>;                                // apiClient.post("/auth/logout") — PAS de skipAuthRetry (hors liste d'exclusion, cf. §9 point ouvert 4)
function refresh(): Promise<void>;                                // apiClient.post("/auth/refresh", undefined, { skipAuthRetry: true }) — exposé pour complétude/tests ; jamais appelé directement par useAuth, le flux réel vit dans SharedApiClient
```

---

## 5. Routeur — `router.tsx` (les deux apps)

Première introduction de `react-router` dans le projet : ce routeur pose la structure complète issue de `prompt-frontend-revise.md` §7.1, pas seulement les routes d'auth, pour que U2-U8 y ajoutent leurs pages sans re-toucher `router.tsx` autrement que pour remplacer un `element` de placeholder par la vraie page.

### 5.1 `apps/user-app/src/router.tsx`

```
createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/",                          element: <PageAccueil /> },
      { path: "/connexion",                 element: <PageConnexion /> },
      { path: "/inscription",               element: <PageInscription /> },
      { path: "/inscription/confirmation",  element: <PageConfirmationInscription /> },
      { path: "/agenda",                    element: <PagePlaceholder title="Agenda" /> },        // U2
      { path: "/actualites",                element: <PagePlaceholder title="Actualités" /> },    // U6
      { path: "/qui-sommes-nous",           element: <PagePlaceholder title="Qui sommes-nous ?" /> }, // U8
      { path: "/contact",                   element: <PagePlaceholder title="Contact" /> },        // U7
      { path: "/non-autorise",              element: <Page403 /> },
      { path: "*",                          element: <Page404 /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/mon-compte",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ADORATEUR, UserRole.VEILLEUR]}>
            <PageMonCompte />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
```

### 5.2 `apps/admin-app/src/router.tsx`

```
createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/connexion",     element: <PageConnexion /> },
      { path: "/non-autorise",  element: <Page403 /> },
      { path: "*",              element: <Page404 /> },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: "/",                  element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PagePlaceholder title="Gestion des utilisateurs" /></ProtectedRoute> },       // U4
      { path: "/utilisateurs/:id",  element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PagePlaceholder title="Détail utilisateur" /></ProtectedRoute> },              // U4
      { path: "/planning",          element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PagePlaceholder title="Planning" /></ProtectedRoute> },                       // U2/U3
      { path: "/annonces",          element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PagePlaceholder title="Annonces" /></ProtectedRoute> },                       // U6
      { path: "/annonces/nouveau",  element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PagePlaceholder title="Nouvelle annonce" /></ProtectedRoute> },               // U6
      { path: "/annonces/:id",      element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PagePlaceholder title="Édition annonce" /></ProtectedRoute> },                // U6
      { path: "/administrateurs",         element: <ProtectedRoute allowedRoles={[UserRole.SUPERADMINISTRATEUR]}><PagePlaceholder title="Administrateurs" /></ProtectedRoute> },        // U5
      { path: "/administrateurs/nouveau", element: <ProtectedRoute allowedRoles={[UserRole.SUPERADMINISTRATEUR]}><PagePlaceholder title="Nouvel administrateur" /></ProtectedRoute> },  // U5
      { path: "/mon-compte",        element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PageMonCompte /></ProtectedRoute> },
    ],
  },
]);
```

`ADMIN_ROLES = [UserRole.ADMINISTRATEUR, UserRole.SUPERADMINISTRATEUR]` (constante module-level de `router.tsx`).

### 5.3 `pages/PagePlaceholder.tsx` (les deux apps)

```typescript
interface PagePlaceholderProps {
  title: string;
}
```

Rendu minimal (titre + message "Cette page sera disponible prochainement") — pas de logique. Chaque unité U2-U8 remplace, route par route, l'`element` de placeholder par sa vraie page dans `router.tsx` ; elle ne recrée jamais le routeur. `admin-app/pages/PageDetailUtilisateur` etc. ne sont pas créées nommément en U1 : le placeholder tient lieu de page jusqu'à l'unité correspondante.

### 5.4 `ProtectedRoute.tsx` (les deux apps)

```typescript
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}
```

Logique (pas de corps ici, comportement attendu) :
- `!isHydrated` → `<Spinner size="md" />` centré (évite un flash de redirection avant réhydratation `persist`)
- `!isAuthenticated` → `<Navigate to="/connexion" state={{ from: location }} replace />`
- `isAuthenticated && !allowedRoles.includes(role)` → `<Navigate to="/non-autorise" replace />`
- sinon → `children`

---

## 6. Hooks & mutations métier

### `hooks/useAuth.ts` (les deux apps, `register` absent côté admin-app)

```typescript
function useAuth(): {
  user: UserResponse | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login(dto: LoginRequest): Promise<AuthResponse>;      // appelle auth.ts#login, puis authStore.setUser(response.user), retourne response
  register(dto: RegisterRequest): Promise<AuthResponse>; // user-app uniquement ; N'appelle PAS authStore.setUser (US-AUTH-01 : pas de connexion auto après inscription)
  logout(): Promise<void>;                                // appelle auth.ts#logout puis authStore.clear() puis navigate("/connexion")
};
```

Écart mineur, volontaire, par rapport à `component-methods.md` (`login(): Promise<void>`) : `login`/`register` retournent l'`AuthResponse` complète pour permettre à l'appelant (`LoginForm`, `RegisterForm`) de lire immédiatement `user.role`/`user.statutValidation` sans dépendre d'un second rendu après mise à jour du store. Ce fichier est créé par U1 (pas un contrat déjà figé comme `SharedApiClient`), le raffinement n'entre donc en contradiction avec rien d'acté.

### Résolution de redirection post-connexion (fonction pure, utilitaire local à chaque app — pas dans `packages/shared`, dépend de `UserRole` uniquement)

```typescript
// apps/*/src/lib/resolvePostLoginRedirect.ts
function resolvePostLoginRedirect(
  role: UserRole,
  appAllowedRoles: UserRole[],
  from?: string,
): string;
// role non autorisé pour cette app -> "/non-autorise"
// sinon -> from ?? "/"
```

Utilisée par `LoginForm` (les deux apps) : `appAllowedRoles` = `[ADORATEUR, VEILLEUR]` (user-app) ou `[ADMINISTRATEUR, SUPERADMINISTRATEUR]` (admin-app). Si `from` pointe vers une route dont le rôle exact n'est pas couvert (ex. un Administrateur redirigé vers `/administrateurs` puis renvoyé sur `/connexion`), `ProtectedRoute` rattrapera le cas au rendu de `from` et renverra vers `/non-autorise` — pas de duplication de la logique de garde dans le formulaire de connexion.

### `hooks/useUpdateProfile.ts` (les deux apps)

```typescript
function useUpdateProfile(): UseMutationResult<UserResponse, ApiError, UpdateUserRequest>;
// mutationFn: usersEndpoints.updateUser(user!.id, dto) -> PUT /users/{id}
// onSuccess: authStore.setUser(response) (garde le profil local synchronisé), toast succès
```

`dto.role` n'est jamais renseigné depuis "Mon compte" (édition de son propre rôle hors périmètre US-AUTH-07 ; `UserManagementModule` de U4 réutilisera `UpdateUserRequest.role` pour éditer un tiers).

### `api/endpoints/users.ts` (les deux apps — fichier partagé dans le temps avec U4)

```typescript
function updateUser(id: string, dto: UpdateUserRequest): Promise<UserResponse>; // PUT /users/{id}
```

U4 (`UserManagementModule`, admin-app uniquement) étendra ce même fichier avec `listUsers`, `createUser`, `deleteUser`, `validerUser`, `rejeterUser` — U1 ne crée que ce qui est nécessaire à "Mon compte".

### `hooks/useMyBookings.ts` (user-app uniquement)

```typescript
function useMyBookings(): UseQueryResult<BookingResponse[]>;
// enabled: isAuthenticated && role === UserRole.VEILLEUR
// queryKey: ["bookings", "me", user?.id]
// queryFn: bookingsEndpoints.getMyBookings({ utilisateurId: user!.id, page: 0, size: DEFAULT_PAGE_SIZE })
// select: (page) => trie page.content par dateDebut croissant
```

### `api/endpoints/bookings.ts` (user-app uniquement — fichier partagé dans le temps avec U3)

```typescript
function getMyBookings(params: { utilisateurId: string; page?: number; size?: number }): Promise<PageResponse<BookingResponse>>;
// GET /bookings?utilisateurId=&page=&size=
```

U3 (`BookingModule`) étendra ce fichier avec `listBookings` (filtres complets), `createBooking`, `cancelBooking`.

---

## 7. Composants d'authentification et de profil

### `components/auth/LoginForm.tsx` (les deux apps)

```typescript
type LoginFormValues = z.infer<typeof loginSchema>; // { email: string; password: string }

interface LoginFormProps {
  onSuccess: (response: AuthResponse) => void;
}
```

Comportement attendu : RHF + `zodResolver(loginSchema)` ; à la soumission, `useAuth().login(values)` ; succès → `onSuccess(response)` (le composant appelant — `PageConnexion` — calcule la redirection via `resolvePostLoginRedirect` et navigue) ; échec avec `error instanceof ApiError && error.status === 401` → affichage du message fixe **"Identifiants invalides ou compte non encore validé."** (jamais `error.message`/`error.code` du backend, qui ne distingue pas les causes, cf. US-AUTH-04) ; tout autre statut d'erreur → toast générique ("Une erreur est survenue, veuillez réessayer.") sans redirection.

### `components/auth/RegisterForm.tsx` (user-app uniquement)

```typescript
type RegisterFormValues = z.infer<typeof registerSchema>; // { email, password, confirmPassword, nom, prenoms, telephone, role }

interface RegisterFormProps {
  onSuccess: (response: AuthResponse) => void;
}
```

RHF + `zodResolver(registerSchema)` : le `.refine` de `registerSchema` bloque déjà côté client toute soumission si `password !== confirmPassword` (US-AUTH-02) — `confirmPassword` n'apparaît jamais dans le corps envoyé (`useAuth().register` construit `RegisterRequest` en excluant `confirmPassword` des champs transmis à `api/endpoints/auth.ts#register`). Succès → `onSuccess(response)` ; `PageInscription` navigue vers `/inscription/confirmation` avec `state: { role: response.user.role, statutValidation: response.user.statutValidation }`.

### `pages/PageConfirmationInscription.tsx`

Lit `useLocation().state` (type `{ role: UserRole; statutValidation: StatutValidation } | undefined`). Message affiché selon `statutValidation` (`VALIDE` → "Votre compte est créé, vous pouvez vous connecter." / `EN_ATTENTE` → "Votre compte est en attente de validation par un administrateur."). Si `state` est absent (accès direct par URL) → redirection vers `/inscription`.

### `components/profile/ProfileEditForm.tsx` (les deux apps)

```typescript
type ProfileEditFormValues = z.infer<typeof updateProfileSchema>; // { email, nom, prenoms, telephone }

interface ProfileEditFormProps {
  defaultValues: ProfileEditFormValues;
  onSubmit: (dto: UpdateUserRequest) => void;
  isSubmitting: boolean;
}
```

Champ `email` rendu en lecture seule (`disabled`) mais inclus dans `defaultValues`/la soumission (requis par `UpdateUserRequest`, non modifiable par cette page — pas de champ mot de passe, US-AUTH-07). `ProfileCard`/`ProfileEditForm`/`MyBookingsList` sont dupliqués (non partagés via `packages/shared`) : petits composants de présentation, cohérent avec la duplication déjà actée pour `authStore` (une instance par app plutôt qu'une abstraction commune prématurée).

### `components/profile/MyBookingsList.tsx` (user-app uniquement)

```typescript
interface MyBookingsListProps {
  bookings: BookingResponse[];
  isLoading: boolean;
}
```

Affiche `dateDebut`/`dateFin`/`status` (via `Table` de `@chapelle/shared/ui`, formaté avec `formatDateTime` de `@chapelle/shared/utils`), déjà triés par `useMyBookings`. Aucune action (réserver/annuler) — hors périmètre U1 (U3).

---

## 8. Layouts (mise en place initiale d'AppShellModule)

Répartition héritée de `components.md` : U1 pose les layouts et le squelette de navigation minimal nécessaire à l'auth ; l'habillage visuel complet (`Navbar`/`Footer` du template, `VitrineModule`) reste porté par U8 pour `user-app`. `admin-app` n'a pas de `VitrineModule` : son `Header`/`Sidebar` sont donc construits intégralement ici (U1), même si leurs liens pointent vers des `PagePlaceholder` en attendant U2-U6.

- `PublicLayout.tsx` (les deux apps) : `<Outlet/>` + `AuthNav` minimal (user-app : liens Connexion/Inscription si non connecté, Mon compte/Déconnexion si connecté ; admin-app : rien de plus qu'un lien Connexion, cette page n'étant visible que non connecté ou en 403/404).
- `AppLayout.tsx` (user-app) : `<Outlet/>` + en-tête minimale authentifiée (nom + rôle + lien Déconnexion) — remplacée/enrichie par la vraie `Navbar` en U8.
- `AdminLayout.tsx` (admin-app) : `Header` (nom/rôle de l'utilisateur connecté + Déconnexion) + `Sidebar` (liens "Utilisateurs", "Planning", "Annonces", conditionnellement "Administrateurs" si `role === SUPERADMINISTRATEUR`, "Mon compte") + `<Outlet/>`.

Suppression de `legacy-template/pages/InscriptionLecteur.tsx` et `InscriptionVeilleur.tsx` : leur seul rôle (référence de style pour `RegisterForm`, cf. note U0 §2.1) est consommé par cette unité ; le formulaire unifié avec sélecteur de rôle (`RegisterForm`) les remplace. `Navbar.tsx`/`Footer.tsx`/`ScrollToTop.tsx`/`AdorationLive.tsx`/`Lightbox.tsx` restent inertes dans `legacy-template/`, propriété de U8.

`main.tsx`/`App.tsx` (les deux apps) : `App.tsx` compose désormais `QueryClientProvider` (`lib/queryClient.ts`) + `ToastProvider` (`@chapelle/shared/ui`) + `RouterProvider router={router}`. `App.test.tsx` doit être réécrit (le test actuel vérifie le contenu "socle prêt", qui disparaît).

---

## 9. Points ouverts pour l'orchestrateur

1. **Restauration de session sans `/auth/me`** : le swagger ne fournit aucun endpoint pour récupérer l'utilisateur courant à partir du seul cookie de session. La conception ci-dessus (§3) persiste `UserResponse` en `localStorage` comme indice d'affichage optimiste, invalidé lazily par le premier 401. Alternative rejetée : ne rien persister et forcer un état "non connecté" à chaque rechargement jusqu'au premier appel API (UX dégradée, mais 100% fidèle au backend). À confirmer.
2. **Nom/version exact du paquet React Router 7** : `react-router-dom` (historique) vs paquet unifié `react-router` pour `createBrowserRouter`/`RouterProvider`. À vérifier sur le registre npm au moment de l'implémentation plutôt que figé ici de mémoire.
3. **`Sidebar` admin-app pointant vers des `PagePlaceholder`** : liens visibles et cliquables dès U1 (valide le routing de bout en bout) plutôt que masqués jusqu'à l'unité correspondante. Alternative : les masquer tant que la page réelle n'existe pas (moins de "pages vides" visibles, mais routing non testable avant U2-U6).
4. **`logout()` hors de la liste d'exclusion `skipAuthRetry`** : `prompt-frontend-revise.md` §5.1 n'exclut explicitement que `/auth/login`, `/auth/register`, `/auth/refresh` de la logique refresh/retry — `/auth/logout` n'y figure pas. Ce plan laisse donc `logout()` suivre le flux standard (un 401 dessus tenterait un refresh puis, en cas d'échec, déclencherait `onUnauthorized`) : le résultat final (utilisateur non authentifié) est identique dans tous les cas, mais à confirmer que c'est bien le comportement voulu plutôt qu'un oubli de la spec source.
5. **Taille de page de `useMyBookings`** : appel unique `size: DEFAULT_PAGE_SIZE` (20) sans pagination UI pour l'historique de réservations du Veilleur — suffisant pour la US-AUTH-08 telle qu'écrite, mais pourrait être insuffisant pour un Veilleur avec un long historique ; U3/une évolution ultérieure pourra ajouter une pagination réelle sans changer le contrat de `getMyBookings`.
