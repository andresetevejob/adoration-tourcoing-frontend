# Tasks — inscription-photo-veilleur

## 1. Conception détaillée (api-architect)
- [x] 1.1 Support `FormData` dans `packages/shared/src/api/client.ts` (`post`/`put`), sans casser
      les appelants JSON existants
- [x] 1.2 Forme du composant `FileInput` (`packages/shared/src/ui`) et intégration
      `react-hook-form`/Zod (validation conditionnelle `role === VEILLEUR`, type jpeg/png, ≤ 5 Mo)
- [x] 1.3 Bascule JSON ↔ multipart dans `register()`/`createUser()` selon présence d'une photo
- Conception détaillée : `openspec/changes/inscription-photo-veilleur/design.md`. Point additionnel
  identifié (hors périmètre initial de `proposal.md`, ajouté à son "Affected code") : `createUser`
  passant à 2 arguments impose `CreateUserVariables { dto; photo? }` dans `useCreateUser.ts` +
  mise à jour de ses deux appelants (`PageGestionUtilisateurs.tsx`, `AdminCreatePage.tsx`).

## 2. Implémentation (api-developer)
- [x] 2.1 `packages/shared/src/api/client.ts` : support `FormData`
- [x] 2.2 `packages/shared/src/ui/FileInput.tsx` (+ export `index.ts`)
- [x] 2.3 `packages/shared/src/utils/validators.ts` : `registerSchema` (champ `photo` conditionnel)
- [x] 2.4 `packages/shared/src/types/user.ts` : `UserResponse.photo` — livré requis puis corrigé en
      optionnel (`photo?: string | null`) par l'orchestrateur après coup (cf. proposal.md, évitait
      de casser ~40 fichiers de test sans rapport avec la fonctionnalité)
- [x] 2.5 `apps/user-app/src/api/endpoints/auth.ts` + `hooks/useAuth.ts` : `register` avec photo
- [x] 2.6 `apps/user-app/src/components/auth/RegisterForm.tsx` : `FileInput` conditionnel
- [x] 2.7 `apps/admin-app/src/components/users/UserForm.tsx` (mode `create`) : schéma + `FileInput`
      conditionnel
- [x] 2.8 `apps/admin-app/src/api/endpoints/users.ts` : `createUser` avec photo
- [x] 2.9 (identifié en conception, §5 design.md) `useCreateUser.ts`/`PageGestionUtilisateurs.tsx`/
      `AdminCreatePage.tsx` : `CreateUserVariables { dto; photo? }`

## 3. Tests (test-engineer)
- [x] 3.1 `client.ts` : requête `FormData` envoyée sans `Content-Type` forcé, requête JSON
      inchangée
- [x] 3.2 `FileInput` : rendu, erreur affichée, valeur transmise à `react-hook-form`
- [x] 3.3 `registerSchema`/`photoSchema`/`validatePhotoForRole` : requis/type/taille uniquement si
      `role === VEILLEUR`
- [x] 3.4 `RegisterForm` : photo requise et envoyée en multipart pour Veilleur ; Adorateur toujours
      envoyé en JSON sans régression
- [x] 3.5 `UserForm` (création) : même couverture, + non-régression écran création Administrateur
      (`AdminCreatePage`, aucun champ photo)
- [x] 3.6 `auth.ts`/`users.ts` : bascule JSON/multipart selon présence de la photo
- Suite complète (3 workspaces) : 155 fichiers / 749 tests, 0 échec. `tsc --noEmit` propre.
  Déviation notée : simulation d'upload via `fireEvent.change` +
  `Object.defineProperty(input,"files",...)` (pas d'ajout de `@testing-library/user-event`,
  absent du repo — confirmé par l'orchestrateur).

## 4. Bruno (bruno-developer)
- [x] 4.1 N/A — projet frontend uniquement, aucun endpoint backend créé dans ce repo

## 5. Revue (code-reviewer)
- [x] 5.1 Revue correction/sécurité/conventions sur l'ensemble des fichiers listés dans
      `proposal.md` — 0 bloquant, 0 important, 1 mineur (couverture 401-retry + `FormData`
      manquante, comportement jugé correct par lecture du code). Corrigé : test ajouté dans
      `client.test.ts` (describe "401 et retry via /auth/refresh"). Suite finale : 155 fichiers /
      750 tests, 0 échec.

## 6. Graduation
- [ ] 6.1 Mettre à jour `openspec/specs/authentification-comptes/spec.md` et créer
      `openspec/specs/gestion-utilisateurs/spec.md` (comportement actuel + photo Veilleur)
- [ ] 6.2 Archiver vers `openspec/changes/archive/AAAA-MM-JJ-inscription-photo-veilleur/`
