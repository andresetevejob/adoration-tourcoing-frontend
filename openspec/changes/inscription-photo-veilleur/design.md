# Conception détaillée — inscription-photo-veilleur

Conception applicative allégée (pas de code d'implémentation), en réponse aux points 1.1/1.2/1.3
de `tasks.md`. Aucun fichier de code n'a été modifié.

## 1. Support `FormData` dans `ApiClient` (`packages/shared/src/api/client.ts`)

### Décision : ne pas changer les signatures publiques

`post<T>(path, body?: unknown, options?)` / `put<T>(path, body?: unknown, options?)` acceptent déjà
`unknown` : un `FormData` est une valeur `unknown` valide, donc **aucun changement de signature
n'est nécessaire** dans `ApiClient`/`RequestOptions`. Seule la fonction interne `request()` doit
détecter le type du corps et adapter `fetch()` en conséquence. C'est le point le plus sûr pour
garantir la non-régression JSON demandée : zéro appelant existant à retoucher côté typage.

### Logique interne (dans `request()`, avant l'appel `fetch`)

```ts
const isFormData = body instanceof FormData;

response = await fetch(`${baseURL}${path}`, {
  method,
  credentials: "include",
  // Ne PAS fixer Content-Type pour un FormData : le navigateur calcule lui-même
  // `multipart/form-data; boundary=...`, un header manuel casserait le parsing serveur.
  headers: isFormData ? undefined : { "Content-Type": "application/json" },
  body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  signal: options?.signal ?? controller?.signal,
});
```

Tout le reste de `request()` (gestion 401/retry-refresh, 403, parsing d'erreur, timeout,
`AbortController`) est inchangé : ces branches ne dépendent pas de la forme du corps. Le retry sur
401 rappelle `request(method, path, body, options, true)` avec le même `body` (le `FormData` original,
pas encore consommé par `fetch` à ce stade) — aucun souci de relecture de flux puisque `FormData`
n'est pas un stream à usage unique comme `Response.body`.

### Point ouvert tranché : pas de type dédié `RequestBody`

On pourrait introduire `type RequestBody = FormData | Record<string, unknown>` pour documenter
l'intention. Recommandation : **ne pas le faire** — `unknown` reste plus simple, n'oblige aucun
appelant JSON à un cast, et la seule owner du branchement est la fonction interne `request()`,
jamais un appelant. Documenté par un simple commentaire au point de branchement plutôt que par un
type public, cohérent avec le style existant du fichier (peu d'abstractions, commentaires ciblés
sur le "pourquoi").

## 2. Composant `FileInput` (`packages/shared/src/ui`)

### Props

```ts
export interface FileInputProps extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  label?: string;
  error?: string;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  { label, error, id, className, ...props },
  ref,
) { /* ... */ });
```

Même famille que `Input`/`Select` (`label`, `error`, `forwardRef`, `useId` pour l'association
`label`/`input`, classes Tailwind cohérentes, message d'erreur sous le champ). `type` est omis des
props et fixé en dur à `"file"` sur le `<input>` rendu : un `FileInput` n'a pas vocation à être
autre chose qu'un input fichier (contrairement à `Input` qui sert aussi de champ password). Le
consommateur passe `accept="image/jpeg,image/png"` via les props natives héritées.

Pas d'aperçu ni de drag-and-drop (tranché dans `proposal.md`) : uniquement le style natif du
navigateur pour le nom de fichier sélectionné, éventuellement stylé via les pseudo-classes
Tailwind `file:*` pour rester visuellement cohérent avec le reste du kit (pas de composant custom
qui masque l'`<input>` natif — le nom de fichier reste géré par le navigateur, jamais recalculé en
React, ce qui évite tout état local superflu).

### Intégration `react-hook-form`

`register("photo")` fonctionne nativement sur un `<input type="file">` : RHF est **non contrôlé**
sur ce type de champ (obligatoire — un input file ne peut pas recevoir de valeur programmatique
pour raisons de sécurité navigateur) et lit directement `event.target.files` dans son `onChange`
interne, donc `values.photo` est bien un `FileList`. Aucune intégration `Controller` n'est
nécessaire ni souhaitable ici : `{...register("photo")}` suffit, exactement comme
`{...register("email")}` sur `Input`.

Usage dans les formulaires appelants :
```tsx
<FileInput
  label="Photo"
  accept={PHOTO_ACCEPTED_MIME_TYPES.join(",")}
  error={errors.photo?.message}
  {...register("photo")}
/>
```

### Nouvelles constantes (`packages/shared/src/utils/constants.ts`)

```ts
export const PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const PHOTO_ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png"];
```
Réutilisées à la fois par le schéma Zod (validation) et par l'attribut `accept` du `FileInput`
(filtrage natif du sélecteur de fichier) — une seule source de vérité, cohérent avec
`PASSWORD_MIN_LENGTH`/`TELEPHONE_PATTERN` déjà centralisés ici.

## 3. Schéma Zod conditionnel (`role === VEILLEUR`)

### Helper partagé (`packages/shared/src/utils/validators.ts`)

`registerSchema` (user-app) et le schéma local `buildCreateUserFormSchema` (`UserForm.tsx`,
admin-app) ont besoin de **la même règle** (requis + type + taille, uniquement si VEILLEUR), mais
sur deux objets Zod distincts et non partagés (cf. convention déjà actée dans
`manageableRoles.ts` : pas de factorisation d'objet complet entre les deux apps indépendantes).
Le bon niveau de partage est donc la fonction de validation elle-même, pas le schéma racine :

```ts
// validators.ts
export const photoSchema = z.custom<FileList | undefined>().optional();

export function validatePhotoForRole(
  role: UserRole,
  photo: FileList | undefined,
  ctx: z.RefinementCtx,
): void {
  if (role !== UserRole.VEILLEUR) return;
  const file = photo?.[0];
  if (!file) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La photo est obligatoire pour un compte Veilleur",
      path: ["photo"],
    });
    return;
  }
  if (!PHOTO_ACCEPTED_MIME_TYPES.includes(file.type)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Format de photo non supporté (jpeg ou png uniquement)",
      path: ["photo"],
    });
  }
  if (file.size > PHOTO_MAX_SIZE_BYTES) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La photo ne doit pas dépasser 5 Mo",
      path: ["photo"],
    });
  }
}
```

`z.custom(...)` plutôt que `z.instanceof(FileList)` : `FileList` est bien défini en environnement
de test (`vitest.config.ts` → `environment: "jsdom"`), donc les deux fonctionneraient, mais
`z.custom` évite de coupler le schéma à la disponibilité du global `FileList` si jamais un schéma
partagé était un jour exécuté côté SSR/Node sans jsdom — défensif à coût nul.

### `registerSchema` (user-app, partagé)

```ts
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    nom: nomSchema,
    prenoms: prenomsSchema,
    telephone: telephoneSchema,
    role: z.enum([UserRole.ADORATEUR, UserRole.VEILLEUR]),
    photo: photoSchema,
  })
  .superRefine((data, ctx) => {
    validatePhotoForRole(data.role, data.photo, ctx);
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
```
`ZodEffects` s'enchaîne sans problème (`.superRefine(...).refine(...)`) : ordre indifférent, les
deux refinements sont indépendants (chemins d'erreur différents : `photo` vs `confirmPassword`).

### `buildCreateUserFormSchema` (admin-app, local à `UserForm.tsx`)

```ts
function buildCreateUserFormSchema(allowedRoles: UserRole[]) {
  return z
    .object({ ...buildBaseUserFormSchemaShape(allowedRoles), password: passwordSchema, photo: photoSchema })
    .superRefine((data, ctx) => {
      validatePhotoForRole(data.role, data.photo, ctx);
    });
}
```
Import de `photoSchema`/`validatePhotoForRole` depuis `@chapelle/shared/utils`, comme les autres
primitives déjà réutilisées (`emailSchema`, `passwordSchema`, ...). Comme `AdminCreatePage` construit
toujours `allowedRoles = [ADMINISTRATEUR]` (`ADMIN_ROLE_OPTIONS`), `data.role` ne vaut jamais
`VEILLEUR` sur cet écran : `validatePhotoForRole` retourne immédiatement, **zéro changement de
comportement** pour la création d'un compte Administrateur — confirme par le schéma, pas
seulement par l'UI, la garantie déjà énoncée dans `proposal.md`.

## 4. Bascule JSON ↔ multipart

### `apps/user-app/src/api/endpoints/auth.ts`

```ts
export function register(dto: RegisterRequest, photo?: File): Promise<AuthResponse> {
  const body = photo ? toMultipartFormData(dto, photo) : dto;
  return apiClient.post<AuthResponse>("/auth/register", body, { skipAuthRetry: true });
}

function toMultipartFormData(dto: RegisterRequest, photo: File): FormData {
  const formData = new FormData();
  formData.append("email", dto.email);
  formData.append("password", dto.password);
  formData.append("nom", dto.nom);
  formData.append("prenoms", dto.prenoms);
  if (dto.telephone) formData.append("telephone", dto.telephone);
  formData.append("role", dto.role);
  formData.append("photo", photo);
  return formData;
}
```
Construction champ par champ (pas de boucle générique `Object.entries`) : cohérent avec le style
déjà en place dans `RegisterForm.tsx` (le DTO y est aussi construit champ par champ, avec le
commentaire explicite sur l'exclusion volontaire de `confirmPassword`), et plus sûr côté typage
(chaque `formData.append` est vérifié contre les champs réels de `RegisterRequest`, pas de `String(value)`
générique qui masquerait un champ oublié ou un renommage futur).

`RegisterRequestMultipart` (swagger) attend les mêmes clés que `RegisterRequest` en parts de
formulaire séparées + une part binaire `photo` — pas de JSON imbriqué sous une clé unique.

### `apps/user-app/src/hooks/useAuth.ts`

```ts
register: (dto: RegisterRequest, photo?: File) => Promise<AuthResponse>;
// ...
async function register(dto: RegisterRequest, photo?: File): Promise<AuthResponse> {
  return registerRequest(dto, photo);
}
```
Signature propagée telle quelle, aucun autre changement dans le hook (pas de `setUser`, cf.
commentaire existant US-AUTH-01 inchangé).

### `apps/user-app/src/components/auth/RegisterForm.tsx`

```tsx
const {
  register,
  handleSubmit,
  control,
  formState: { errors, isSubmitting },
} = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { role: UserRole.ADORATEUR } });
const role = useWatch({ control, name: "role" });

async function onSubmit(values: RegisterFormValues): Promise<void> {
  const dto: RegisterRequest = { /* inchangé */ };
  // Gate explicite sur `role`, pas seulement sur `values.photo` : RHF ne désinscrit pas
  // par défaut (`shouldUnregister: false`) un champ dont l'input a été démonté, donc
  // `values.photo` peut rester une FileList "orpheline" si l'utilisateur choisit Veilleur,
  // sélectionne une photo, puis repasse à Adorateur avant de soumettre. Sans ce garde, une
  // photo serait envoyée pour un compte Adorateur : régression du flux JSON existant.
  const photo = values.role === UserRole.VEILLEUR ? values.photo?.[0] : undefined;
  try {
    const response = await registerUser(dto, photo);
    onSuccess(response);
  } catch (error) { /* inchangé */ }
}

// JSX : entre le Select rôle et les champs mot de passe
{role === UserRole.VEILLEUR && (
  <FileInput
    label="Photo"
    accept={PHOTO_ACCEPTED_MIME_TYPES.join(",")}
    error={errors.photo?.message}
    {...register("photo")}
  />
)}
```

### `apps/admin-app/src/api/endpoints/users.ts`

```ts
export function createUser(dto: CreateUserRequest, photo?: File): Promise<UserResponse> {
  return apiClient.post<UserResponse>("/users", photo ? toMultipartFormData(dto, photo) : dto, {
    skipForbiddenRedirect: true,
  });
}

function toMultipartFormData(dto: CreateUserRequest, photo: File): FormData {
  const formData = new FormData();
  formData.append("email", dto.email);
  formData.append("password", dto.password);
  formData.append("nom", dto.nom);
  formData.append("prenoms", dto.prenoms);
  if (dto.telephone) formData.append("telephone", dto.telephone);
  formData.append("role", dto.role);
  formData.append("photo", photo);
  return formData;
}
```
`toMultipartFormData` est dupliquée à l'identique entre `auth.ts` et `users.ts` plutôt que
remontée dans `packages/shared` : même raisonnement que `MANAGEABLE_ROLE_OPTIONS`/
`ADMIN_ROLE_OPTIONS` déjà dupliqués — deux apps indépendantes, deux DTO distincts
(`RegisterRequest` vs `CreateUserRequest`, qui divergent déjà et pourraient diverger davantage),
duplication de 8 lignes largement sous le seuil qui justifierait un couplage inter-apps.

### `apps/admin-app/src/components/users/UserForm.tsx` (mode `create`)

Même bascule JSON/multipart, mais propagée **jusqu'à l'appelant** (`onSubmit` prop) puisque
`UserForm` ne connaît pas la mutation React Query :

```ts
type CreateUserFormProps = Extract<UserFormProps, { mode: "create" }> & {
  // onSubmit devient : (dto: CreateUserRequest, photo?: File) => void
};
```

```ts
function submit(values: CreateUserFormValues): void {
  const dto: CreateUserRequest = { /* inchangé */ };
  const photo = values.role === UserRole.VEILLEUR ? values.photo?.[0] : undefined;
  onSubmit(dto, photo);
}
```

Et dans `CreateUserForm`, même `useWatch({ control, name: "role" })` + rendu conditionnel du
`FileInput` que côté `RegisterForm.tsx`.

## 5. Décision non couverte par `proposal.md`/`tasks.md` : ripple sur la mutation React Query admin

`createUser` passe de `(dto) => Promise<UserResponse>` à `(dto, photo?) => Promise<UserResponse>`.
Or `useMutation` (`apps/admin-app/src/hooks/useCreateUser.ts`) type ses variables sur un seul
argument (`TVariables`), et `mutationFn: createUser` est aujourd'hui branché directement dessus.
Ce fichier n'est **pas** listé dans `proposal.md` → « Affected code », mais il doit être modifié
pour que la fonctionnalité compile et fonctionne. Idem pour ses deux appelants
(`PageGestionUtilisateurs.tsx`, `AdminCreatePage.tsx`), qui appellent aujourd'hui
`createUser.mutate(dto, { onSuccess })`.

Décision : introduire un type de variables explicite plutôt que changer `TVariables` en tuple :

```ts
// useCreateUser.ts
export interface CreateUserVariables {
  dto: CreateUserRequest;
  photo?: File;
}

export function useCreateUser(): UseMutationResult<UserResponse, ApiError, CreateUserVariables> {
  // ...
  return useMutation<UserResponse, ApiError, CreateUserVariables>({
    mutationFn: ({ dto, photo }) => createUser(dto, photo),
    // onSuccess/onError inchangés
  });
}
```

```ts
// PageGestionUtilisateurs.tsx
function handleCreateSubmit(dto: CreateUserRequest, photo?: File): void {
  createUser.mutate({ dto, photo }, { onSuccess: () => setIsCreateModalOpen(false) });
}

// AdminCreatePage.tsx — photo toujours undefined ici (ADMIN_ROLE_OPTIONS n'inclut jamais VEILLEUR)
function handleSubmit(dto: CreateUserRequest, photo?: File): void {
  createUser.mutate({ dto, photo }, { onSuccess: () => void navigate("/administrateurs") });
}
```

Un objet `{ dto, photo }` plutôt qu'un tuple `[dto, photo?]` : plus lisible aux deux call sites,
et cohérent avec le style du reste du repo qui n'utilise pas de tuples positionnels pour des
variables de mutation. **Recommandation à l'équipe** : ajouter ces trois fichiers
(`useCreateUser.ts`, `useCreateUser.test.tsx`, `PageGestionUtilisateurs.tsx`,
`AdminCreatePage.tsx` + leurs tests) à la liste « Affected code » de `proposal.md` avant
l'implémentation, faute de quoi 2.7/2.8 ne compileront pas de bout en bout.

## 6. `UserResponse.photo`

```ts
export interface UserResponse {
  // ... champs existants inchangés
  photo: string | null;
}
```
Type `string | null` (pas `string | undefined`) : le swagger précise que le backend renvoie
toujours la clé (jamais absente), avec `null` explicite en l'absence de photo — cohérent avec le
contrat `UpdateUserRequestMultipart`/doc associée (`GET /users/{id}/photo` réutilisera ce champ
plus tard pour savoir s'il y a quelque chose à récupérer). Aucun écran ne consomme ce champ dans
cette proposition (tranché dans les Clarifications) ; l'ajout ne change donc aucun rendu.

## Récapitulatif des fichiers concernés (au-delà de la liste `proposal.md`)

- `packages/shared/src/utils/constants.ts` : + `PHOTO_MAX_SIZE_BYTES`, `PHOTO_ACCEPTED_MIME_TYPES`
- `apps/admin-app/src/hooks/useCreateUser.ts` (+ test) : nouveau type `CreateUserVariables`
- `apps/admin-app/src/pages/PageGestionUtilisateurs.tsx` (+ test) : `handleCreateSubmit` à 2 args
- `apps/admin-app/src/pages/superadmin/AdminCreatePage.tsx` (+ test) : `handleSubmit` à 2 args
  (photo toujours `undefined` en pratique)
