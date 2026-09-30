# Spec — authentification-comptes (garde des pages invité)

> Périmètre gradué : uniquement le garde `GuestRoute` (redirection des utilisateurs déjà
> authentifiés loin des pages réservées aux invités). Le reste de la capacité
> authentification-comptes (inscription, connexion, rejet par rôle, déconnexion, profil —
> US-AUTH-01 à 08) est déjà implémenté (`openspec/changes/authentification-comptes/`) mais n'a
> jamais été gradué vers ce fichier ; non documenté ici.

## Garde des pages invité (GuestRoute)

Un utilisateur déjà authentifié ne doit pas pouvoir accéder aux pages réservées aux visiteurs non
connectés (connexion, inscription).

WHEN un utilisateur authentifié accède à une route protégée par `GuestRoute` THEN il est
redirigé :
- vers `/` si son rôle fait partie des rôles autorisés pour l'application courante ;
- vers `/non-autorise` sinon (rôle valide mais non prévu pour cette application — cohérent avec
  la redirection appliquée après une connexion réussie, cf. rejet de connexion pour rôle
  inapproprié).

WHEN l'état d'authentification n'est pas encore hydraté (lecture du stockage local en cours)
THEN un indicateur de chargement est affiché, sans rendu du formulaire ni redirection prématurée.

WHEN l'utilisateur n'est pas authentifié THEN la page (formulaire de connexion/inscription) est
rendue normalement.

### Routes gardées
- `user-app` : `/connexion`, `/inscription`, `/inscription/confirmation`
- `admin-app` : `/connexion` (pas de route d'inscription sur cette application)

WHY : avant ce garde, un utilisateur déjà connecté pouvait toujours accéder aux formulaires de
connexion/inscription, ce qui est trompeur et constitue un flou sur les patterns d'accès liés à
l'authentification (aucun récit US-AUTH-01 à 08 ne couvrait ce cas).

### Implémentation
`GuestRoute` (`apps/user-app/src/components/auth/GuestRoute.tsx`,
`apps/admin-app/src/components/auth/GuestRoute.tsx`) est le miroir de `ProtectedRoute` : mêmes
trois états (hydratation / authentifié / non authentifié), réutilise la fonction pure
`resolvePostLoginRedirect(role, rôlesAutorisésDeLApp)` déjà utilisée après une connexion réussie.
