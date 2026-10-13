# Spec — gestion-utilisateurs (affichage des erreurs de création)

> Périmètre gradué : uniquement l'affichage de l'erreur de soumission sur le formulaire de création
> d'utilisateur. Le reste de la capacité (liste, filtres, validation/rejet, édition, suppression) est
> déjà implémenté (`openspec/changes/gestion-utilisateurs/`) mais n'a jamais été gradué ; non
> documenté ici.

## Affichage des erreurs de soumission (création d'utilisateur)

WHEN la création d'un utilisateur (`UserForm` mode `create`, via `useCreateUser`) échoue avec une
`ApiError` (ex. 409 — email ou téléphone déjà utilisé) THEN le message réel renvoyé par le backend
est affiché dans un `FormAlert` (cf. `socle-frontend/spec.md`) au-dessus du formulaire, transmis par
la page appelante (`PageGestionUtilisateurs` ou `AdminCreatePage`) — le hook `useCreateUser` ne gère
plus lui-même l'affichage de l'erreur (plus de `Toast` automatique sur échec).

WHEN l'utilisateur ferme ce bandeau (croix), soumet à nouveau, ou ferme la modale de création
(`PageGestionUtilisateurs`) THEN le bandeau disparaît.

WHY : même raison que pour l'inscription (cf. `authentification-comptes/spec.md`) — le `Toast` bas à
droite pouvait ne pas être vu.

## Affichage de la photo d'un Veilleur (fiche admin)

WHEN un Administrateur/SuperAdministrateur consulte la fiche d'un utilisateur (`/utilisateurs/:id`,
`PageDetailUtilisateur.tsx` → `UserProfile.tsx`) ET que `user.photo` n'est pas `null` THEN la photo
est affichée (miniature circulaire ~96px) au-dessus des informations textuelles de la `Card`.

Contrat backend (vérifié dans le repo `backend`) : `UserResponse.photo` n'est qu'un indicateur de
présence (jamais une URL ni un nom de fichier exploitable) — le contenu binaire se récupère via
`GET /api/v1/users/{id}/photo` (`image/jpeg`/`image/png`, même autorisation que `GET /users/{id}` :
titulaire ou administrateur). Seuls les comptes VEILLEUR ont une photo (règle backend), donc ce bloc
ne s'affiche jamais pour les autres rôles — aucune vérification de rôle côté frontend n'est
nécessaire, uniquement `user.photo !== null`.

Implémentation :
- `ApiClient.getBlob(path, options?)` (`packages/shared/src/api/client.ts`) — même pipeline que
  `get` (credentials, timeout, 401→refresh→retry, erreurs), `response.blob()` au lieu de
  `response.json()`.
- `useUserPhoto(userId, hasPhoto)` (`apps/admin-app/src/hooks/useUserPhoto.ts`) : `useQuery`
  (`enabled: hasPhoto`, aucun appel réseau si `user.photo` est `null`) met en cache le **`Blob`**
  (jamais l'URL objet — cf. point d'attention ci-dessous), expose `data` comme une URL objet créée
  localement dans un `useEffect` à chaque changement de référence du `Blob`, révoquée à chaque
  changement/démontage.

WHY (cache du `Blob`, pas de l'URL objet) : si la query cachait directement l'URL objet, revisiter
une fiche déjà consultée (A→B→A, cache TanStack Query réutilisé sans démontage) aurait pu reservir
une URL déjà révoquée (image cassée) — bug identifié et corrigé en revue avant graduation. Mettre en
cache le `Blob` (donnée inerte, sans cycle de vie) et créer une URL fraîche à chaque changement de
référence élimine ce risque structurellement.

WHEN la récupération échoue (403/404/réseau) THEN dégradation silencieuse : aucun message d'erreur,
le bloc photo est simplement absent, le reste de la fiche (`<dl>`) reste inchangé — même principe
que `statut-adoration-en-direct` pour un contenu secondaire non bloquant.

### Hors périmètre
- Édition/remplacement de la photo depuis cette page (`UserForm` mode `edit` ne modifie pas
  `photo`) — lecture seule.
- "Mon compte" (`ProfileCard`, user-app) et liste des utilisateurs (`UserTable`) : pas de photo
  affichée à ces endroits.

### Limitation connue (documentée, non bloquante)
`useUserPhoto` ne revérifie pas explicitement `hasPhoto` dans la dépendance de son `useEffect`
(seulement `query.data`) : si `hasPhoto` passait de `true` à `false` pour un même `userId` **sans
démontage** du composant, l'URL précédente resterait affichée sans être révoquée. Non atteignable
avec les flux actuels (aucune action de ce repo ne retire une photo existante sans navigation
complète) — à corriger si une future fonctionnalité de suppression/remplacement de photo depuis
cette page est ajoutée.
