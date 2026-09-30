# Proposition — garde-pages-invite-authentification

## Why
Un utilisateur déjà authentifié peut aujourd'hui accéder librement à `/connexion` (user-app et
admin-app) et `/inscription` (user-app) : rien dans `ProtectedRoute` ni dans le routeur ne
redirige les sessions déjà valides loin de ces pages. Aucun récit utilisateur (US-AUTH-01 à 08,
`aidlc-docs/inception/user-stories/stories.md`) ni spec graduée ne couvre ce cas — c'est un flou
jamais tranché, pas une régression d'un comportement documenté. Conséquence concrète : un
utilisateur connecté peut se retrouver sur un formulaire de connexion/inscription qui ne le
concerne plus, ce qui est trompeur et touche un pattern d'accès lié à l'authentification.

## What Changes
- Nouveau composant `GuestRoute` (miroir de `ProtectedRoute`), un par app :
  `apps/user-app/src/components/auth/GuestRoute.tsx` et
  `apps/admin-app/src/components/auth/GuestRoute.tsx`.
- Pendant l'hydratation du store d'auth (`isHydrated === false`) : même spinner que
  `ProtectedRoute`, pour éviter un flash du formulaire avant que l'état d'authentification soit
  connu.
- Si authentifié : redirection via `resolvePostLoginRedirect(role, APP_ALLOWED_ROLES)` (fonction
  déjà existante et testée dans chaque app) — `/` si le rôle est autorisé sur l'app, `/non-autorise`
  sinon (cohérent avec US-AUTH-05 pour une session dont le rôle ne correspond pas à l'app).
- Si non authentifié : rendu normal des enfants (le formulaire).
- `user-app` : `/connexion`, `/inscription` et `/inscription/confirmation` enveloppées par
  `GuestRoute` (cette dernière n'est atteinte en pratique qu'en sortie d'inscription, sans
  connexion automatique — US-AUTH-01 — mais reste gardée par cohérence si un utilisateur déjà
  connecté y accède directement).
- `admin-app` : `/connexion` enveloppée par `GuestRoute` (pas d'inscription sur cette app).

## Impact
- Affected specs : `authentification-comptes` (capacité sans spec graduée à ce jour — seul
  `openspec/changes/authentification-comptes/` existe, déjà implémenté mais jamais gradué ; ce
  comportement sera inclus lors de la prochaine graduation de cette capacité).
- Affected code : `apps/user-app/src/{router.tsx, components/auth/GuestRoute.tsx (nouveau)}`,
  `apps/admin-app/src/{router.tsx, components/auth/GuestRoute.tsx (nouveau)}`.

## Clarifications
- [Question] : Un utilisateur authentifié avec un rôle non prévu pour l'app (cookie/session dont
  le rôle ne correspond pas à cette app) qui accède à `/connexion` doit-il être renvoyé vers
  `/non-autorise` ou vers `/` ?
  [Réponse] : `/non-autorise`, par cohérence avec `resolvePostLoginRedirect`, déjà utilisé pour ce
  même cas après une connexion réussie (US-AUTH-05).
