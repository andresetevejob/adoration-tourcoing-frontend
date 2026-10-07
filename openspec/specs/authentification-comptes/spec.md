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

## Affichage des erreurs de soumission (inscription)

WHEN la soumission du formulaire d'inscription (`RegisterForm`) échoue avec une `ApiError` (ex. 409
— email ou téléphone déjà utilisé) THEN le message réel renvoyé par le backend est affiché dans un
`FormAlert` (cf. `socle-frontend/spec.md`) au-dessus du formulaire (avant le champ Email), pas via le
`Toast` global.

WHEN l'utilisateur ferme ce bandeau (croix) OU soumet à nouveau le formulaire THEN le bandeau
disparaît (réinitialisé avant le nouvel appel réseau).

WHEN l'erreur n'est pas une `ApiError` (cas générique, imprévu) THEN le comportement historique est
conservé : `Toast` d'erreur générique, inchangé.

> Périmètre gradué ici : uniquement l'affichage de l'erreur de soumission. Le reste du formulaire
> d'inscription (champs, validation, succès) reste non gradué, cf. note en tête de ce fichier.

## Mot de passe oublié (demande + réinitialisation)

Un utilisateur non connecté (`user-app` et `admin-app`) peut demander la réinitialisation de son mot
de passe, puis en choisir un nouveau à partir d'un lien reçu par email.

### Demande de réinitialisation
**Route** : `/mot-de-passe-oublie` (publique, garde `GuestRoute`)

WHEN l'utilisateur soumet son email THEN `POST /auth/forgot-password` est appelé et, **quelle que
soit l'issue réelle** (compte inconnu, supprimé, Veilleur `EN_ATTENTE`/`REJETE`, ou compte `VALIDE`),
le même message de confirmation générique est affiché, figé côté frontend (indépendant du corps de
la réponse backend) : « Si un compte existe avec cette adresse, un email de réinitialisation a été
envoyé. »

WHEN l'appel échoue pour une raison technique (réseau, 5xx) THEN un `Toast` d'erreur générique est
affiché à la place du message de confirmation (point ouvert documenté : léger écart par rapport à
une application stricte de FR-AUTH-2 sur ce cas précis, jugé acceptable — l'échec technique ne
révèle pas le statut du compte, seulement l'indisponibilité du service).

WHY : FR-AUTH-2 — ne jamais révéler l'existence ou le statut d'un compte via ce flux
(anti-énumération).

### Réinitialisation
**Route** : `/reinitialiser-mot-de-passe?token=...` (publique, garde `GuestRoute`)

WHEN la page est chargée avec un paramètre `token` THEN un formulaire Nouveau mot de passe +
Confirmation est affiché (même règle de robustesse que l'inscription : 8 caractères min., 1 chiffre,
1 caractère spécial).

WHEN le formulaire est soumis THEN `POST /auth/reset-password` est appelé avec `{ token,
newPassword }` (`confirmPassword` n'est jamais transmis, cohérent avec `RegisterRequest`).

WHEN la réponse est `204` THEN aucune connexion automatique n'est effectuée (le backend ne pose
aucun cookie) : `Toast` de succès puis redirection vers `/connexion`.

WHEN la réponse est `401` (token invalide, expiré, déjà utilisé, ou utilisateur associé
introuvable/supprimé) OU qu'aucun `token` n'est présent dans l'URL THEN le formulaire est
**remplacé** (pas de `FormAlert` dismissible au-dessus d'un formulaire laissé visible — resoumettre
échouerait systématiquement) par un message générique d'erreur, avec un lien vers
`/mot-de-passe-oublie` pour redemander un email.

WHY : cohérent avec le traitement existant du 401 de `/auth/login` (pas de distinction des causes
d'échec exposée au frontend).

### Implémentation
- `forgotPassword(dto)` / `resetPassword(dto)` (`api/endpoints/auth.ts`, `user-app` et `admin-app`)
  avec `skipAuthRetry: true` — mêmes exclusions refresh/retry/redirection 401 que `/auth/login`,
  `/auth/register`, `/auth/refresh` (endpoints publics, un 401 n'est pas lié à une session expirée).
- Patron de composition « B » (présentationnel + hook `useMutation` + page orchestratrice, même
  patron que `ContactForm`/`useSendContactMessage`/`PageContact`), pas `useAuth()` : ces actions ne
  modifient jamais l'état de session (pas de `setUser`/`clear`).
- Lien « Mot de passe oublié ? » sous le champ mot de passe de `LoginForm`, dans les deux apps.
