# Tasks — mot-de-passe-oublie

## 1. Types & validation partagés (`packages/shared`)
- [ ] 1.1 `ForgotPasswordRequest` / `ResetPasswordRequest` dans `packages/shared/src/types/auth.ts`
- [ ] 1.2 `forgotPasswordSchema` (email) / `resetPasswordSchema` (newPassword + confirmPassword,
      réutilisant `passwordSchema`) dans `packages/shared/src/utils/validators.ts`

## 2. API (`user-app` + `admin-app`)
- [ ] 2.1 `forgotPassword(dto)` dans `api/endpoints/auth.ts` (POST `/auth/forgot-password`,
      `skipAuthRetry: true`)
- [ ] 2.2 `resetPassword(dto)` dans `api/endpoints/auth.ts` (POST `/auth/reset-password`,
      `skipAuthRetry: true`)

## 3. Composants & pages (`user-app` + `admin-app`)
- [ ] 3.1 Lien « Mot de passe oublié ? » sous le champ mot de passe de `LoginForm`
- [ ] 3.2 `ForgotPasswordForm` + `PageMotDePasseOublie` (message de confirmation générique
      systématique)
- [ ] 3.3 `ResetPasswordForm` + `PageReinitialisationMotDePasse` (lecture du `token` en query param,
      gestion succès/échec décrits dans la spec)
- [ ] 3.4 Routes `/mot-de-passe-oublie` et `/reinitialiser-mot-de-passe` dans `router.tsx`, gardées
      par `GuestRoute`

## 4. Tests
- [ ] 4.1 Tests unitaires `forgotPassword`/`resetPassword` (endpoints)
- [ ] 4.2 Tests `ForgotPasswordForm` / `ResetPasswordForm` (succès, 401, token absent)
- [ ] 4.3 Tests de routage (garde `GuestRoute` sur les deux nouvelles routes)

## 5. Bruno
- [ ] 5.1 Requêtes `POST /auth/forgot-password` et `POST /auth/reset-password`

## 6. Revue
- [ ] 6.1 `code-reviewer` sur l'ensemble du change
