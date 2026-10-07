# Proposition — mot-de-passe-oublie

## Why
Le swagger de l'API a été mis à jour (section 6 de `prompt-frontend-revise.md`) et expose désormais
deux endpoints publics `POST /auth/forgot-password` et `POST /auth/reset-password`, absents lors de
la première implémentation d'`authentification-comptes`. Aujourd'hui, un utilisateur qui oublie son
mot de passe n'a aucun moyen de le réinitialiser depuis l'application — aucune route, aucun lien
« Mot de passe oublié ? » n'existe dans `user-app` ni `admin-app`.

## What Changes
- Ajout d'un lien « Mot de passe oublié ? » sous le champ mot de passe de `LoginForm`
  (`user-app` et `admin-app`), renvoyant vers une nouvelle page de demande de réinitialisation.
- Nouvelle page/route **publique** `/mot-de-passe-oublie` (user-app + admin-app, garde `GuestRoute`) :
  formulaire Email → `POST /auth/forgot-password` → message de confirmation **générique et
  systématique** (FR-AUTH-2, anti-énumération de comptes) : « Si un compte existe avec cette adresse,
  un email de réinitialisation a été envoyé. », quel que soit l'état réel du compte.
- Nouvelle page/route **publique** `/reinitialiser-mot-de-passe` (user-app + admin-app, garde
  `GuestRoute`) : lit le `token` depuis le paramètre de requête (`?token=`, cf. lien envoyé par email
  — format à confirmer avec le backend), formulaire Nouveau mot de passe + Confirmation (même règle
  de robustesse que l'inscription : 8 caractères min., 1 chiffre, 1 caractère spécial) →
  `POST /auth/reset-password` avec `{ token, newPassword }`.
  - Succès (`204`) : pas de connexion automatique (le backend ne pose aucun cookie) → redirection
    `/connexion` avec message de succès (`Toast`) invitant à se connecter avec le nouveau mot de passe.
  - Échec (`401` — token invalide/expiré/déjà utilisé) : message générique affiché sur la page (pas de
    distinction des cas, cohérent avec le traitement existant du 401 de `/auth/login`), avec un lien
    pour redemander un email de réinitialisation.
  - Token absent de l'URL (accès direct à la page) : même traitement que token invalide.
- Nouvelles fonctions `forgotPassword(dto)` / `resetPassword(dto)` dans `api/endpoints/auth.ts`
  (`user-app` et `admin-app`), avec `skipAuthRetry: true` (mêmes exclusions refresh/retry/redirection
  401 que `/auth/login`, `/auth/register`, `/auth/refresh` — ces endpoints sont publics et un 401/autre
  n'a pas de rapport avec une session expirée).
- Nouveaux schémas Zod `forgotPasswordSchema` / `resetPasswordSchema` dans `packages/shared/utils`
  (réutilisation de `emailSchema` et `passwordSchema` déjà existants).
- Nouveaux types `ForgotPasswordRequest` / `ResetPasswordRequest` dans `packages/shared/types/auth.ts`,
  alignés sur le swagger section 6.

## Impact
- Affected specs : `authentification-comptes` (ajout d'une section dédiée).
- Affected code :
  - `packages/shared/src/types/auth.ts`, `packages/shared/src/utils/validators.ts`
  - `apps/user-app/src/{api/endpoints/auth.ts, components/auth/, pages/, router.tsx}`
  - `apps/admin-app/src/{api/endpoints/auth.ts, components/auth/, pages/, router.tsx}`
- Pas de rupture : ajout pur, aucun endpoint/route existant modifié.
- Décision de périmètre (validée avec l'utilisateur) : la fonctionnalité couvre **les deux
  applications** — les endpoints swagger ne sont pas restreints par rôle, et un
  Administrateur/SuperAdministrateur doit pouvoir récupérer l'accès à son compte en self-service, au
  même titre qu'un Adorateur/Veilleur.

## Hypothèse à confirmer avec le backend
Le format exact du lien envoyé par email (nom du paramètre de requête `token`, chemin
`/reinitialiser-mot-de-passe` vs autre) doit correspondre à ce que le backend génère réellement dans
l'email. Hypothèse retenue pour cette implémentation : `{origine-frontend}/reinitialiser-mot-de-passe?token={token}`.
