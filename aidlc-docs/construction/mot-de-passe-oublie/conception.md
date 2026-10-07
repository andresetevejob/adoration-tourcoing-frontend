# Conception — mot-de-passe-oublie

Sources : `openspec/changes/mot-de-passe-oublie/{proposal.md,patches/authentification-comptes/spec.md.diff,tasks.md}`, `prompt-frontend-revise.md` §6 (endpoints lignes ~1036-1090, schémas lignes ~1641-1665), code existant `packages/shared/src/{types/auth.ts,utils/validators.ts,ui/{FormAlert,Toast}.tsx}`, `apps/{user-app,admin-app}/src/{api/endpoints/auth.ts,components/auth/{LoginForm,RegisterForm,GuestRoute}.tsx,hooks/{useAuth,useSendContactMessage,useCreateBooking}.ts,pages/{PageConnexion,PageContact}.tsx,router.tsx}`.

Niveau conception uniquement : signatures, contrats, arborescence — pas de JSX de rendu métier, pas de corps de fonction métier.

> Note de convention : les documents de conception existants vivent à plat dans `aidlc-docs/construction/plans/u{n}-*-design.md`. Ce document est écrit à l'emplacement demandé (`aidlc-docs/construction/mot-de-passe-oublie/conception.md`) ; à déplacer/renommer si l'équipe souhaite rester strictement alignée sur la convention `plans/`.

---

## 0. Décision d'architecture structurante

Deux patrons de composition coexistent déjà dans le code :

- **Patron A (session-affecting)** — `LoginForm`/`RegisterForm` : la fonction d'API est appelée directement depuis le formulaire via `useAuth()` (pas de React Query), avec un état local `formError`/`apiErrorMessage` et un `try/catch` manuel. Réservé aux flux qui modifient l'état de session (`setUser`/`clear`).
- **Patron B (action générique sans effet sur la session)** — `ContactForm`/`useSendContactMessage`/`PageContact` : le formulaire est un composant **présentationnel pur** (`isSubmitting` + `onSubmit` en props, aucun appel réseau), un hook dédié `useXxx` encapsule `useMutation` (React Query), et c'est la **page** qui orchestre l'état (succès affiché inline, navigation).

`forgotPassword`/`resetPassword` ne touchent ni `setUser` ni `clear` (pas de cookie posé, pas de connexion automatique — cf. swagger). Ils suivent donc le **patron B**, pas `useAuth()`. C'est le principal écart par rapport à une lecture naïve de `LoginForm`/`RegisterForm` comme unique modèle — à valider si l'équipe préférait au contraire étendre `useAuth()` pour rester visuellement proche des deux formulaires d'auth existants.

---

## 1. Arborescence cible (identique dans `user-app` et `admin-app`, sauf mention contraire)

```
packages/shared/src/
├── types/auth.ts                                  [MODIFIÉ] + ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest
└── utils/validators.ts                            [MODIFIÉ] + forgotPasswordSchema, resetPasswordSchema

apps/{user-app,admin-app}/src/
├── api/endpoints/auth.ts                           [MODIFIÉ] + forgotPassword, resetPassword
├── hooks/
│   ├── useForgotPassword.ts                        [CRÉÉ]
│   └── useResetPassword.ts                         [CRÉÉ]
├── components/auth/
│   ├── LoginForm.tsx                               [MODIFIÉ] + lien "Mot de passe oublié ?"
│   ├── ForgotPasswordForm.tsx                      [CRÉÉ] présentationnel
│   └── ResetPasswordForm.tsx                       [CRÉÉ] présentationnel
├── pages/
│   ├── PageMotDePasseOublie.tsx                    [CRÉÉ]
│   └── PageReinitialisationMotDePasse.tsx          [CRÉÉ]
└── router.tsx                                      [MODIFIÉ] + 2 routes, gardées GuestRoute
```

`packages/shared/src/{types,utils}/index.ts` : aucune modification — ré-export déjà fait via `export * from "./auth"` / `export * from "./validators"`.

---

## 2. Types partagés — `packages/shared/src/types/auth.ts`

Alignés sur le swagger (`ForgotPasswordRequest`, `ForgotPasswordResponse`, `ResetPasswordRequest` — §6 du prompt, lignes 1641-1665) :

```typescript
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

Pas de type de réponse dédié pour `resetPassword` : la réponse `204` n'a pas de corps, la fonction d'API renvoie `Promise<void>` (cf. §4, même patron que `refresh()`).

---

## 3. Schémas Zod — `packages/shared/src/utils/validators.ts`

```typescript
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
```

- Réutilise `emailSchema`/`passwordSchema` déjà définis, même règle de robustesse que `registerSchema` (8 car. min., 1 chiffre, 1 spécial).
- `resetPasswordSchema` ne modélise **que** les champs du formulaire (`newPassword`, `confirmPassword`) : `token` n'est pas une saisie utilisateur (lu dans l'URL via `useSearchParams`), il est ajouté au DTO au moment de l'appel API, pas dans le schéma de validation du formulaire — même logique que `confirmPassword` exclu du DTO `RegisterRequest` dans `RegisterForm`.

---

## 4. API — `api/endpoints/auth.ts` (`user-app` + `admin-app`)

```typescript
export function forgotPassword(dto: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", dto, { skipAuthRetry: true });
}

export async function resetPassword(dto: ResetPasswordRequest): Promise<void> {
  await apiClient.post("/auth/reset-password", dto, { skipAuthRetry: true });
}
```

- `skipAuthRetry: true` sur les deux : endpoints publics, un 401 sur `/auth/reset-password` n'a aucun rapport avec une session expirée (même exclusion que `login`/`register`/`refresh`).
- `resetPassword` suit exactement le patron de `refresh()` existant (wrapper `async` sans paramètre générique, le corps `204` est vide donc ignoré).

---

## 5. Hooks — `hooks/useForgotPassword.ts` / `hooks/useResetPassword.ts`

Patron B (`useSendContactMessage`/`useCreateBooking`) : `useMutation` de React Query, un hook par action.

```typescript
export function useForgotPassword(): UseMutationResult<ForgotPasswordResponse, ApiError, ForgotPasswordRequest> {
  // mutationFn: forgotPassword
  // onError: toast générique (ApiError.message || GENERIC_ERROR_MESSAGE) — cf. §8 point ouvert
}

export function useResetPassword(): UseMutationResult<void, ApiError, ResetPasswordRequest> {
  // mutationFn: resetPassword
  // PAS de toast onError ici : contrairement aux autres mutations, l'échec (401) doit être
  // affiché *sur la page*, pas en notification transitoire (cf. spec "message affiché sur la
  // page"). C'est la page qui gère l'erreur via le callback `onError` passé à `.mutate(...)`.
}
```

---

## 6. Composants présentationnels — `components/auth/{ForgotPasswordForm,ResetPasswordForm}.tsx`

Patron `ContactForm` : aucun appel réseau, aucun hook d'API importé.

```typescript
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  isSubmitting: boolean;
  onSubmit: (dto: ForgotPasswordRequest) => void;
}
export function ForgotPasswordForm(props: ForgotPasswordFormProps): JSX.Element;
// 1 champ Input (Email, type="email", autoComplete="email"), 1 Button "Envoyer le lien de réinitialisation"
```

```typescript
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  isSubmitting: boolean;
  onSubmit: (values: ResetPasswordFormValues) => void;
}
export function ResetPasswordForm(props: ResetPasswordFormProps): JSX.Element;
// 2 champs Input type="password" autoComplete="new-password" (Nouveau mot de passe / Confirmation),
// mêmes erreurs de validation que le bloc mot de passe de RegisterForm, 1 Button "Réinitialiser le mot de passe"
```

---

## 7. Pages — `pages/{PageMotDePasseOublie,PageReinitialisationMotDePasse}.tsx`

Patron `PageContact` : la page détient l'état de flux (soumis/erreur), construit le DTO, appelle `.mutate(...)`.

### `PageMotDePasseOublie`
- État local : `isSubmitted: boolean`.
- `handleSubmit(dto)` → `forgotPassword.mutate(dto, { onSuccess: () => setIsSubmitted(true) })`.
- Rendu : si `!isSubmitted` → `<ForgotPasswordForm isSubmitting={...} onSubmit={handleSubmit} />` ; si `isSubmitted` → message de confirmation **générique systématique**, texte figé côté frontend (indépendant du corps de la réponse `ForgotPasswordResponse.message`) :
  > « Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé. »
- Un lien retour `/connexion` peut être ajouté sous le message de confirmation (confort, non prescrit par la spec).

### `PageReinitialisationMotDePasse`
- Lecture du token : `const [searchParams] = useSearchParams(); const token = searchParams.get("token");` (react-router).
- État local : `hasFailed: boolean` (mis à `true` dans le callback `onError` de `.mutate(...)`).
- `showError = !token || hasFailed` — le token absent de l'URL est traité **avant tout appel API**, de la même façon qu'un 401 (cf. spec).
- Si `showError` → formulaire remplacé par un message générique bloquant + `Link to="/mot-de-passe-oublie"` ("Redemander un email de réinitialisation"). **Décision** : pas de `FormAlert` dismissible au-dessus d'un formulaire laissé visible — le token est invalide/expiré indépendamment de ce que l'utilisateur ressaisit, resoumettre le même formulaire échouera systématiquement ; remplacer le formulaire évite une fausse promesse de retry. Cf. point ouvert §8 si ce choix doit être revu.
- Sinon → `<ResetPasswordForm isSubmitting={resetPassword.isPending} onSubmit={handleSubmit} />`.
- `handleSubmit(values)` construit `{ token: token!, newPassword: values.newPassword }` (comme pour `RegisterRequest`, `confirmPassword` n'est jamais transmis) et appelle `.mutate(...)` :
  - `onSuccess` → `Toast` succès ("Mot de passe réinitialisé. Vous pouvez vous connecter.") + `navigate("/connexion", { replace: true })`.
  - `onError` → `setHasFailed(true)` (affichage inline, pas de toast).

---

## 8. `LoginForm.tsx` (`user-app` + `admin-app`) — lien « Mot de passe oublié ? »

Ajout d'un `<Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>` (import `Link` depuis `"react-router"`), positionné immédiatement sous le champ « Mot de passe », avant le bloc `formError`. Aucun changement de `LoginFormProps` ni de logique de soumission.

---

## 9. Routes — `router.tsx` (`user-app` + `admin-app`)

Deux entrées ajoutées dans le groupe de routes `PublicLayout` existant (celui qui contient déjà `/connexion`), gardées par `GuestRoute` — même structure que `/connexion`/`/inscription` :

```typescript
{
  path: "/mot-de-passe-oublie",
  element: <GuestRoute><PageMotDePasseOublie /></GuestRoute>,
},
{
  path: "/reinitialiser-mot-de-passe",
  element: <GuestRoute><PageReinitialisationMotDePasse /></GuestRoute>,
},
```

Import direct (pas de `lazy`), comme `PageConnexion`/`PageInscription` — ces pages sont légères (un formulaire), pas de budget de bundle à ménager comme `PageAccueil`/`PageQuiSommesNous`.

`admin-app/router.tsx` : les deux routes rejoignent le premier groupe `PublicLayout` (celui qui contient déjà `/connexion`, `/non-autorise`, `*`), avant l'entrée `*`/`Page404` (ordre des routes important dans `createBrowserRouter`).

---

## 10. Points ouverts

1. **Message de succès `forgot-password` figé côté frontend** : le texte affiché est une constante frontend, indépendante de `ForgotPasswordResponse.message` renvoyé par le backend (qui est déjà générique côté serveur selon le swagger). Double sécurité volontaire contre toute dérive future du message backend, mais à confirmer que c'est bien l'intention — une alternative serait d'afficher `response.message` directement.
2. **Erreurs inattendues (réseau/5xx) sur `/auth/forgot-password`** : non décrites par la spec (qui ne couvre que la réponse `200` systématique). Traitement proposé : `Toast` d'erreur générique via `useForgotPassword` (symétrique à `useSendContactMessage`/`useCreateBooking`). Si une telle erreur survient, l'utilisateur ne voit donc *pas* le message de confirmation — légère fuite d'information potentielle ("une erreur technique est survenue" ≠ "votre email est inconnu"), jugée acceptable mais à valider.
3. **Erreurs inattendues (ni `204` ni `401`) sur `/auth/reset-password`** : traitées comme un `401` (message générique inline, pas de distinction), par cohérence avec "sans distinction des cas" de la spec — à confirmer.
4. **Remplacement du formulaire vs bandeau `FormAlert` dismissible** pour le cas 401/token absent de `reset-password` (cf. §7) : choix pris pour éviter une resoumission vouée à l'échec ; l'alternative (garder le formulaire visible avec `FormAlert` au-dessus, comme `RegisterForm`) reste possible si l'équipe préfère une cohérence stricte de pattern visuel entre tous les formulaires d'auth.
5. **Format du lien email** (`?token=`, chemin `/reinitialiser-mot-de-passe`) : hypothèse déjà actée dans `proposal.md`, non re-discutée ici — dépend de la génération réelle du lien côté backend.
