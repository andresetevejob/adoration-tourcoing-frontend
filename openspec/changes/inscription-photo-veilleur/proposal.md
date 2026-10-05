# Proposition — inscription-photo-veilleur

## Contexte

Aucune spec vivante complète n'existe encore pour `authentification-comptes` (seul le garde
`GuestRoute` y est gradué, cf. `openspec/specs/authentification-comptes/spec.md`) ni pour
`gestion-utilisateurs` (aucune spec graduée, capacité entièrement implicite — code actuel de
`openspec/changes/gestion-utilisateurs/`). Cette proposition documentera donc, à la graduation, le
comportement actuel (création sans photo) ET le nouveau comportement (photo obligatoire pour un
compte Veilleur) pour les deux capacités.

Aucun conflit détecté avec les changes ouvertes `authentification-comptes` et
`gestion-utilisateurs` : elles décrivent l'implémentation déjà livrée (non graduée), cette
proposition les étend sans les contredire.

## Why

Le swagger backend (`prompt-frontend-revise.md` §6) a évolué : `POST /auth/register` (inscription
publique), `POST /users` (création par un Administrateur) et `PUT /users/{id}` acceptent désormais
un second `Content-Type: multipart/form-data` (`RegisterRequestMultipart`/
`CreateUserRequestMultipart`/`UpdateUserRequestMultipart`), avec un champ `photo` (jpeg/png, 5 Mo
max, type réel vérifié côté serveur via Apache Tika) **obligatoire si le rôle résultant du compte
est VEILLEUR** (422 sinon). Aujourd'hui, `RegisterForm` (user-app) et `UserForm` mode création
(admin-app) n'envoient que du JSON et ne proposent aucun champ photo : un Veilleur ne peut plus
être créé depuis aucune des deux applications sans échouer en 422.

Périmètre de cette proposition, tel que demandé : **uniquement les formulaires de création**
(inscription publique côté user-app, création d'utilisateur côté admin-app). `PUT /users/{id}`
(édition, y compris `ProfileEditForm`) n'est pas touché.

## What Changes

### `socle-frontend` — client API (`packages/shared/src/api/client.ts`)
- `ApiClient.post`/`put` acceptent aussi un corps `FormData` (en plus d'un objet JS sérialisé en
  JSON comme aujourd'hui). Quand `body instanceof FormData`, le header `Content-Type` n'est PAS
  fixé manuellement : `fetch` calcule lui-même le `boundary` multipart. Rétrocompatible — tout
  appelant existant passant un objet continue d'envoyer du JSON à l'identique.

### `socle-frontend` — kit UI (`packages/shared/src/ui`)
- Nouveau composant `FileInput` (même famille que `Input`/`Select` : `label`, `error`, compatible
  `react-hook-form` via `register("photo")` — un `<input type="file" accept="image/jpeg,image/png">`
  natif, sans prévisualisation ni drag-and-drop, cohérent avec le reste du kit (pas de
  sur-conception).

### `authentification-comptes` — inscription publique (user-app)
- `registerSchema` (`packages/shared/src/utils/validators.ts`) : champ `photo` (`FileList`)
  optionnel, mais requis (message dédié) et validé (type jpeg/png, ≤ 5 Mo) via `.superRefine`
  quand `role === VEILLEUR` — validation client dupliquant la règle serveur pour éviter un
  aller-retour réseau inutile.
- `RegisterForm.tsx` : affichage conditionnel du `FileInput` "Photo" quand le rôle sélectionné est
  Veilleur. `register()` (`hooks/useAuth.ts` → `api/endpoints/auth.ts`) construit un `FormData` et
  appelle `POST /auth/register` en multipart uniquement si une photo est présente ; sinon,
  comportement JSON inchangé (inscription Adorateur non affectée).

### `gestion-utilisateurs` — création d'utilisateur (admin-app)
- `UserForm.tsx` (mode `create` uniquement) : même logique — `FileInput` affiché/requis quand le
  rôle sélectionné est Veilleur. Comme `MANAGEABLE_ROLE_OPTIONS` est la seule liste de rôles
  incluant Veilleur (`ADMIN_ROLE_OPTIONS`, réutilisé par `AdminCreatePage`, ne propose jamais
  Veilleur), ce champ n'apparaît jamais sur l'écran de création d'un compte Administrateur — aucun
  changement de comportement pour `gestion-administrateurs`.
- `createUser()` (`api/endpoints/users.ts`) : même bascule JSON/`FormData` selon présence d'une
  photo.
- `UserResponse` (`packages/shared/src/types/user.ts`) : ajout du champ `photo: string | null`
  (déjà renvoyé par le backend, absent du type actuel) — uniquement pour exactitude du contrat,
  aucun écran ne l'exploite dans cette proposition (cf. Clarifications).

### Hors périmètre (explicite)
- `PUT /users/{id}` (édition d'un compte existant, `ProfileEditForm`, édition dans `UserForm`) —
  swagger le permet aussi en multipart, mais non demandé ici.
- `GET /users/{id}/photo` (consultation du contenu binaire de la photo) — cf. Clarifications.

## Impact
- Affected specs : `authentification-comptes`, `gestion-utilisateurs` (graduation partielle),
  `socle-frontend` (client API + kit UI, actuellement non documentés dans
  `openspec/specs/socle-frontend/spec.md`, périmètre limité au composant `Input`).
- Affected code :
  - `packages/shared/src/api/client.ts` (+ test)
  - `packages/shared/src/ui/FileInput.tsx` (nouveau, + test), `packages/shared/src/ui/index.ts`
  - `packages/shared/src/utils/validators.ts` (+ test)
  - `packages/shared/src/types/user.ts`
  - `apps/user-app/src/components/auth/RegisterForm.tsx` (+ test)
  - `apps/user-app/src/api/endpoints/auth.ts` (+ test)
  - `apps/user-app/src/hooks/useAuth.ts` (signature `register`)
  - `apps/admin-app/src/components/users/UserForm.tsx` (+ test)
  - `apps/admin-app/src/api/endpoints/users.ts` (+ test)
  - `apps/admin-app/src/hooks/useCreateUser.ts` (+ test) : `createUser(dto, photo?)` change la
    forme des variables de mutation (`CreateUserVariables { dto; photo? }`, cf. `design.md` §5)
  - `apps/admin-app/src/pages/PageGestionUtilisateurs.tsx` (+ test) : `handleCreateSubmit` à 2 args
  - `apps/admin-app/src/pages/superadmin/AdminCreatePage.tsx` (+ test) : `handleSubmit` à 2 args
    (photo toujours `undefined` en pratique, `ADMIN_ROLE_OPTIONS` n'incluant jamais Veilleur)
  - `packages/shared/src/utils/constants.ts` : `PHOTO_MAX_SIZE_BYTES`, `PHOTO_ACCEPTED_MIME_TYPES`
- Ne bloque ni ne dépend d'aucune autre change ouverte (`planning-*`, `reservation-*` touchent des
  fichiers disjoints).

## Clarifications

- [Question] : Cette proposition ajoute le champ `photo` à `UserResponse` (déjà renvoyé par le
  backend) mais n'affiche la photo nulle part (ni "Mon compte", ni détail utilisateur admin,
  ni liste). Veut-on inclure l'affichage de la photo (via `GET /users/{id}/photo`) dans cette même
  proposition, ou le traiter comme une proposition séparée une fois la création débloquée ?
  [Réponse] : Séparément plus tard — cette proposition se limite à débloquer la création d'un
  compte Veilleur (upload). L'affichage sera traité dans une proposition future.

- [Question] : Le composant `FileInput` doit-il afficher un aperçu (thumbnail) de l'image
  sélectionnée avant envoi, ou se limiter au nom de fichier natif du navigateur (comportement par
  défaut d'un `<input type="file">`, cohérent avec la sobriété du reste du formulaire) ?
  [Réponse] : Non, pas d'aperçu — `<input type="file">` natif, nom de fichier affiché par le
  navigateur, cohérent avec le reste du kit UI.
