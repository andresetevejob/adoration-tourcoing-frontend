# Proposition — affichage-photo-veilleur-fiche-admin

## Contexte
`inscription-photo-veilleur` (implémenté, non gradué, cf. `openspec/changes/inscription-photo-veilleur/`)
a débloqué l'upload de la photo d'un compte Veilleur, mais a explicitement différé son affichage :
> [Réponse] : Séparément plus tard — cette proposition se limite à débloquer la création d'un compte
> Veilleur (upload). L'affichage sera traité dans une proposition future.

Cette proposition traite cet affichage différé, pour le cas précis demandé : la "fiche" d'un
utilisateur dans l'espace admin (`/utilisateurs/:id`, `PageDetailUtilisateur.tsx` →
`UserProfile.tsx`, admin-app), consultée par un Administrateur ou SuperAdministrateur.

Aucun conflit détecté avec les changes ouvertes (`gestion-utilisateurs`, `inscription-photo-veilleur`)
— celle-ci les complète sans les contredire.

## Contrat backend vérifié (lu dans le repo `backend`, swagger + contrôleur)
- `UserResponse.photo` (déjà typé côté frontend, `packages/shared/src/types/user.ts`) : **jamais une
  URL ni un nom de fichier exploitable** — un simple indicateur de présence (`null` = aucune photo).
  Le contenu binaire se récupère via un endpoint séparé.
- `GET /api/v1/users/{id}/photo` : retourne le contenu binaire (`image/jpeg` ou `image/png`) en 200,
  `403` (appelant ni titulaire ni administrateur, ou ADMINISTRATEUR consultant un compte
  ADMINISTRATEUR/SUPERADMINISTRATEUR — non pertinent ici puisque seuls les comptes VEILLEUR ont une
  photo), ou `404` (compte inconnu, compte sans photo, ou fichier référencé en base mais absent du
  disque). Même autorisation que `GET /users/{id}` (déjà appelé par `useUser`) : titulaire du compte
  ou administrateur.

## Why
Un Administrateur/SuperAdministrateur consultant la fiche d'un Veilleur ne voit aujourd'hui aucune
photo, bien que l'upload soit fonctionnel depuis `inscription-photo-veilleur` — l'information existe
côté backend mais n'est jamais affichée.

## What Changes

### `socle-frontend` — client API (`packages/shared/src/api/client.ts`)
- Nouvelle méthode `ApiClient.getBlob(path, options?): Promise<Blob>` — même logique que `get`
  (credentials, timeout, 401→refresh→retry, 403, erreurs) mais `response.blob()` au lieu de
  `response.json()`. Nécessaire pour réutiliser la gestion d'authentification déjà en place
  (refresh automatique sur 401) plutôt qu'un `<img crossOrigin>` direct, qui contournerait tout ce
  mécanisme et ne serait pas testable selon les conventions déjà en place dans ce repo (mock
  d'`apiClient`, pas de `fetch`/`img` réel dans les tests de composants).

### `gestion-utilisateurs` — fiche utilisateur (admin-app)
- Nouveau hook `useUserPhoto(userId: string, hasPhoto: boolean)` (`apps/admin-app/src/hooks/`) :
  `useQuery` (TanStack Query), `enabled: hasPhoto` (pas d'appel réseau si `user.photo` est `null`),
  `getUserPhoto(userId)` (`api/endpoints/users.ts`) → `apiClient.getBlob(`/users/${id}/photo`)` →
  `URL.createObjectURL(blob)`. Nettoyage (`URL.revokeObjectURL`) à l'invalidation/démontage.
- `UserProfile.tsx` : affichage conditionnel — `user.photo` non nul **et** fetch réussi → `<img>`
  (miniature circulaire, taille modérée, ex. 96px) au-dessus des informations textuelles ; en cours
  de chargement → `Spinner` (`@chapelle/shared/ui`, déjà utilisé ailleurs dans l'app) à la même
  place ; en échec (403/404/réseau) → **dégradation silencieuse**, bloc photo simplement absent, le
  reste de la fiche reste inchangé (même principe que `statut-adoration-en-direct` : jamais d'erreur
  visible bloquant le reste de la page pour un contenu secondaire).
- Pas de nouveau composant partagé (`Avatar` ou équivalent) — un simple `<img>` stylé Tailwind
  directement dans `UserProfile.tsx`, cohérent avec "pas de sur-conception" pour un usage unique à
  ce stade.

### Hors périmètre (explicite)
- `ProfileCard.tsx` (user-app, "Mon compte" — l'utilisateur consultant sa propre fiche) : demande
  limitée à l'espace admin, non traité ici.
- Édition/remplacement de la photo depuis la fiche admin (`UserForm` mode `edit`) : lecture
  seulement, pas d'upload depuis cette page.
- Liste des utilisateurs (`UserTable`) : pas de miniature dans la liste, uniquement sur la fiche
  détail.

## Impact
- Affected specs : `gestion-utilisateurs` (aucune spec graduée à ce jour — documenté à la graduation
  avec le reste de la capacité, cf. note dans `openspec/specs/gestion-utilisateurs/spec.md`),
  `socle-frontend` (nouvelle méthode `ApiClient.getBlob`).
- Affected code :
  - `packages/shared/src/api/client.ts` (+ test) : `getBlob`
  - `apps/admin-app/src/api/endpoints/users.ts` (+ test) : `getUserPhoto`
  - `apps/admin-app/src/hooks/useUserPhoto.ts` (nouveau, + test)
  - `apps/admin-app/src/components/users/UserProfile.tsx` (+ test)
- Pas de breaking change : `ApiClient.getBlob` est un ajout, aucune méthode existante modifiée.
- Ne bloque ni ne dépend d'aucune autre change ouverte.

## Décisions prises (à confirmer par l'utilisateur avant implémentation)
- Fetch via `apiClient.getBlob` + `URL.createObjectURL` (pas de `<img crossOrigin>` direct) — pour
  réutiliser le refresh 401 existant et rester testable selon les conventions du repo.
- Dégradation silencieuse en cas d'échec (pas de message d'erreur visible, bloc photo absent).
- Scope strictement limité à la fiche admin (`UserProfile.tsx`) — ni "Mon compte", ni liste.
