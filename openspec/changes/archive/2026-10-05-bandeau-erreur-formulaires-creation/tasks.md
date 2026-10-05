# Tasks — bandeau-erreur-formulaires-creation

## 1. Implémentation (api-developer)
- [x] 1.1 `packages/shared/src/ui/FormAlert.tsx` (+ export dans `index.ts`)
- [x] 1.2 `apps/user-app/src/components/auth/RegisterForm.tsx` : état local `apiErrorMessage`,
      `<FormAlert>` au-dessus du formulaire, retrait du `show(...)` sur `ApiError`
- [x] 1.3 `apps/admin-app/src/hooks/useCreateUser.ts` : retrait du `onError` (toast)
- [x] 1.4 `apps/admin-app/src/components/users/UserForm.tsx` (mode `create`) : props
      `apiErrorMessage`/`onDismissError`, `<FormAlert>` au-dessus du formulaire
- [x] 1.5 `apps/admin-app/src/pages/PageGestionUtilisateurs.tsx` : état local `apiErrorMessage`,
      câblage `onError`/reset à la fermeture de la modale
- [x] 1.6 `apps/admin-app/src/pages/superadmin/AdminCreatePage.tsx` : état local `apiErrorMessage`,
      câblage `onError`

## 2. Tests (test-engineer)
- [x] 2.1 `FormAlert` : rendu du message, clic sur la croix appelle `onDismiss`
- [x] 2.2 `RegisterForm` : soumission avec `ApiError` (409 doublon) affiche le message réel dans le
      bandeau au-dessus du formulaire (pas de toast) ; la croix le fait disparaître ; une nouvelle
      soumission réinitialise le bandeau avant l'appel réseau
- [x] 2.3 `UserForm` (création) : même couverture que 2.2, au niveau du composant
- [x] 2.4 `PageGestionUtilisateurs`/`AdminCreatePage` : erreur de `useCreateUser` affichée via le
      bandeau transmis à `UserForm` ; fermeture de la modale réinitialise l'erreur
      (`PageGestionUtilisateurs`)
- [x] 2.5 Suite complète (3 workspaces) verte, `tsc --noEmit` propre

## 3. Revue (code-reviewer)
- [x] 3.1 Cohérence du nouveau composant avec le reste du kit UI, accessibilité de la croix
      (`aria-label`, focus visible), absence de régression sur le toast de succès et sur `LoginForm`
      (non touché)
