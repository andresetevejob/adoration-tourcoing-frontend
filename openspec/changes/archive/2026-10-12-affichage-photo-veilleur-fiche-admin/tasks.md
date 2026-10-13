# Tasks — affichage-photo-veilleur-fiche-admin

## 1. Client API (`socle-frontend`)
- [x] 1.1 `packages/shared/src/api/client.ts` : `ApiClient.getBlob(path, options?): Promise<Blob>` —
      même pipeline que `get` (credentials, timeout, 401→refresh→retry, 403, erreurs), `response.blob()`
      au lieu de `response.json()`.
- [x] 1.2 Tests `client.test.ts` : réponse 200 → `Blob`, 401 → refresh puis retry (comme `get`), 403/404
      → `ApiError` propagée.

## 2. Endpoint + hook (admin-app)
- [x] 2.1 `apps/admin-app/src/api/endpoints/users.ts` : `getUserPhoto(id: string): Promise<Blob>` →
      `apiClient.getBlob(`/users/${id}/photo`)`.
- [x] 2.2 `apps/admin-app/src/hooks/useUserPhoto.ts` : `useQuery` (`enabled: hasPhoto`), transforme le
      `Blob` en URL objet (`URL.createObjectURL`), révoque l'ancienne URL au démontage/changement
      (`useEffect` cleanup).
- [x] 2.3 Tests `users.test.ts`/`useUserPhoto.test.tsx`.

## 3. Affichage (`UserProfile.tsx`)
- [x] 3.1 Branchement du hook avec `user.id`/`Boolean(user.photo)` ; `<img>` circulaire (~96px) si
      disponible, `Spinner` pendant le chargement, rien en cas d'échec (dégradation silencieuse).
- [x] 3.2 Tests `UserProfile.test.tsx` : avec photo (succès), sans photo (`user.photo === null`, pas
      d'appel réseau), échec de récupération (bloc absent, reste de la fiche intact).

## 4. Revue
- [x] 4.1 `code-reviewer` : cohérence avec `inscription-photo-veilleur` (même contrat
      `UserResponse.photo`), vérification que `getBlob` ne casse rien sur `get`/`post`/`put`
      existants, nettoyage effectif des URL objets (pas de fuite mémoire).

## 5. Spec
- [x] 5.1 Documenter dans `openspec/specs/gestion-utilisateurs/spec.md` (actuellement limité à
      l'affichage des erreurs de création) avant archivage de ce change.
