# Proposition — bandeau-erreur-formulaires-creation

## Contexte

Aucune spec vivante ne documente le comportement actuel des erreurs de soumission de formulaire
(ni `socle-frontend/spec.md` pour le composant `Toast`, ni `authentification-comptes/spec.md` —
dont le périmètre gradué se limite à `GuestRoute` —, ni de spec graduée pour `gestion-utilisateurs`).
Comportement actuel traité comme spec implicite, documenté ci-dessous.

Aucun conflit détecté avec les changes ouvertes `authentification-comptes`, `gestion-utilisateurs`
et `inscription-photo-veilleur` (cette dernière entièrement implémentée mais pas encore graduée) :
elles décrivent l'implémentation déjà livrée des formulaires concernés ; cette proposition modifie
uniquement la façon dont une erreur de soumission y est affichée, sans toucher aux champs ni à la
validation.

### Comportement actuel (implicite)

- `RegisterForm.tsx` (user-app, inscription publique) et `UserForm.tsx` mode `create` (admin-app,
  via `useCreateUser.ts`, utilisé par `PageGestionUtilisateurs.tsx` et `AdminCreatePage.tsx`)
  affichent toute erreur de soumission (y compris un 409 "email/téléphone déjà utilisé") via
  `ToastProvider` (`packages/shared/src/ui/Toast.tsx`) : encart fixe en bas à droite de l'écran,
  disparition automatique après 4s, sans bouton de fermeture.
- Précédent existant non généralisé : `LoginForm.tsx` (user-app ET admin-app) affiche déjà certaines
  erreurs (401, identifiants invalides) **inline**, sous les champs du formulaire, via un état local
  `formError` et `<p role="alert">` — mais sans bouton de fermeture, et seulement pour ce cas précis.

### Problème

Le toast bas-droite peut passer inaperçu (notamment sur mobile ou si l'utilisateur a déjà le regard
sur le formulaire plus haut dans la page) : un message d'erreur important (ex. "Cet email est déjà
utilisé") disparaît après 4s sans garantie d'avoir été vu.

## Why

Rendre visible et maîtrisable par l'utilisateur tout message d'erreur de soumission sur les deux
formulaires de création de compte (inscription publique user-app, création d'utilisateur admin-app) :
affichage en haut du formulaire plutôt qu'en toast bas-droite, fermeture manuelle (croix) plutôt
qu'une disparition automatique sur laquelle l'utilisateur n'a aucune prise.

## What Changes

### `socle-frontend` — kit UI (`packages/shared/src/ui`)
- Nouveau composant partagé `FormAlert` : bandeau `role="alert"`, variante erreur (fond/texte rouge
  cohérents avec la palette déjà utilisée par `Toast`), bouton de fermeture (✕) en haut à droite
  (`aria-label="Fermer"`). Pas d'auto-dismiss (fermeture manuelle uniquement, cf. clarification
  utilisateur). Même famille que les autres composants du kit (pas de dépendance externe).
- `ToastProvider`/`useToast` ne sont pas modifiés : ils restent le mécanisme utilisé pour les erreurs
  inattendues (non-`ApiError`) et les succès (ex. "Utilisateur créé."), inchangés par cette
  proposition.

### `authentification-comptes` — inscription publique (user-app)
- `RegisterForm.tsx` : état local `apiErrorMessage` (remplace l'appel `show(error.message, "error")`
  sur `ApiError` dans le `catch` de `onSubmit`). `<FormAlert>` rendu en tout premier enfant du
  formulaire (au-dessus du champ Email) quand `apiErrorMessage` est défini ; la croix appelle
  `setApiErrorMessage(null)`. Une nouvelle tentative de soumission réinitialise le message avant
  l'appel réseau. Erreurs non-`ApiError` (cas générique déjà existant) : comportement inchangé
  (toast générique), cas très rare (exception imprévue), hors périmètre de cette demande.

### `gestion-utilisateurs` — création d'utilisateur (admin-app)
- `useCreateUser.ts` : retrait du `onError` qui appelait `show(...)` (toast global) — la gestion de
  l'erreur de soumission remonte aux deux appelants plutôt que de rester implicite dans le hook
  partagé. `onSuccess` (toast "Utilisateur créé." + invalidation des requêtes) inchangé.
- `PageGestionUtilisateurs.tsx` et `AdminCreatePage.tsx` : état local `apiErrorMessage`, renseigné
  dans le `onError` passé à `createUser.mutate(...)`, réinitialisé à chaque nouvelle soumission et
  à la fermeture de la modale/navigation. Transmis à `UserForm` via une nouvelle prop.
- `UserForm.tsx` (mode `create` uniquement — le mode `edit`, hors périmètre, n'est pas concerné) :
  nouvelles props `apiErrorMessage?: string | null` et `onDismissError?: () => void` sur
  `CreateUserFormProps`. `<FormAlert>` rendu en tout premier enfant du formulaire quand
  `apiErrorMessage` est défini.

## Impact

Fichiers concernés :
- Nouveau : `packages/shared/src/ui/FormAlert.tsx` (+ `FormAlert.test.tsx`, export dans `index.ts`)
- `apps/user-app/src/components/auth/RegisterForm.tsx`
- `apps/admin-app/src/components/users/UserForm.tsx`
- `apps/admin-app/src/hooks/useCreateUser.ts`
- `apps/admin-app/src/pages/PageGestionUtilisateurs.tsx`
- `apps/admin-app/src/pages/superadmin/AdminCreatePage.tsx`

Non affectés : `LoginForm.tsx` (pattern existant différent, non demandé), `Toast.tsx`/`ToastProvider`
(aucune modification), mode `edit` de `UserForm`, toute autre capacité utilisant `useToast`.
