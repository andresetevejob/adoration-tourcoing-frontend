# Proposition — photo-navbar-mon-compte

## Contexte

Demande utilisateur : « Dans l'espace mon compte, permettre d'afficher la photo du veilleur
connecté dans le menu mon compte. »

Clarification obtenue (format [Réponse]:) :

- [Réponse]: Emplacement — une petite photo (miniature circulaire) doit apparaître à côté du lien
  « Mon compte » dans la barre de navigation (`AuthNav.tsx`), visible sur toutes les pages une fois
  connecté. Pas la page `/mon-compte` elle-même (`ProfileCard`, hors périmètre de cette proposition).

État actuel documenté (`openspec/specs/gestion-utilisateurs/spec.md`, section "Affichage de la
photo d'un Veilleur (fiche admin)", "Hors périmètre") : « "Mon compte" (`ProfileCard`, user-app) et
liste des utilisateurs (`UserTable`) : pas de photo affichée à ces endroits. » Le lien de navbar
`AuthNav.tsx` n'est même pas mentionné — aucune photo n'y a jamais été affichée. C'est donc une
**nouvelle fonctionnalité**, pas un bug (le code actuel correspond exactement à ce que documente la
spec).

Aucun conflit détecté avec les changes ouvertes existantes. `inscription-photo-veilleur` (déjà
implémentée, upload de la photo à l'inscription) et `detail-reservation-veilleur` (gradué plus tôt
aujourd'hui, affichage de la photo dans les modales de l'agenda) ont posé toute l'infrastructure
réutilisable ici : `UserResponse.photo` (indicateur de présence), `GET /users/{id}/photo`,
`apps/user-app/src/{api/endpoints/users.ts,hooks/useUserPhoto.ts}` (déjà existants côté user-app).
Cette proposition est un nouveau point d'appel de cette infrastructure, pas une refonte.

## Why

`AuthNav.tsx` affiche aujourd'hui uniquement un lien texte « Mon compte » — aucun signal visuel
n'identifie qui est connecté. Les comptes Veilleur disposent déjà d'une photo (upload à
l'inscription, `inscription-photo-veilleur`) : l'afficher à côté du lien donne une confirmation
visuelle immédiate de l'identité connectée, cohérent avec les autres emplacements où la photo est
déjà affichée (fiche admin, modales de l'agenda).

## What Changes

- `apps/user-app/src/components/layout/AuthNav.tsx` : quand l'utilisateur connecté a une photo
  (`user.photo !== null` — par construction, seuls les comptes VEILLEUR en ont une, cf. règle
  backend déjà documentée), affiche une miniature circulaire à côté du lien « Mon compte ». Rendu
  une seule fois (composant partagé entre `Navbar` desktop et `MobileDrawer` mobile, cf. code
  actuel) : aucun changement séparé nécessaire pour le menu mobile.
- Pas de photo affichée pour un Adorateur connecté (`user.photo` toujours `null` pour ce rôle,
  dégradation silencieuse déjà en place ailleurs — même principe ici, pas de cas spécial à coder).
- Point technique à trancher en conception (api-architect) : contrairement à l'agenda
  (`PlanningEntryResponse` sans indicateur `hasPhoto`, d'où un appel systématique dans
  `useUserPhoto` actuel côté user-app), `UserResponse.photo` porte bien un indicateur de présence —
  cohérence à vérifier avec l'équivalent admin-app (`useUserPhoto(userId, hasPhoto)`, `enabled:
  hasPhoto`, aucun appel réseau si pas de photo) plutôt que de réutiliser tel quel le hook agenda
  (toujours appelant). Décision : étendre le hook existant (paramètre optionnel) ou composant
  dédié — à trancher sans casser les appelants agenda déjà en place.

## Impact

- Affected specs :
  - `gestion-utilisateurs` (section "Affichage de la photo d'un Veilleur" étendue : nouvel
    emplacement navbar, en plus de la fiche admin et de l'agenda).
- Affected code :
  - `apps/user-app/src/components/layout/AuthNav.tsx` (+ test)
  - `apps/user-app/src/hooks/useUserPhoto.ts` (potentiellement étendu, + test) — à confirmer en
    conception
- Pas de nouvel endpoint backend (`GET /users/{id}/photo` déjà existant et déjà consommé côté
  user-app). Pas de changement pour `admin-app` (sa navbar/menu n'est pas concernée par cette
  demande, qui porte sur l'espace « mon compte » du Veilleur côté `user-app`).

## Questions de clarification restantes

Aucune côté périmètre fonctionnel (emplacement tranché ci-dessus). Le seul point ouvert est
technique (forme exacte du hook/garde réseau), à trancher en conception sans impact sur le
comportement utilisateur final.
