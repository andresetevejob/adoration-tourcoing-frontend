# Spec — gestion-utilisateurs (affichage des erreurs de création)

> Périmètre gradué : uniquement l'affichage de l'erreur de soumission sur le formulaire de création
> d'utilisateur. Le reste de la capacité (liste, filtres, validation/rejet, édition, suppression) est
> déjà implémenté (`openspec/changes/gestion-utilisateurs/`) mais n'a jamais été gradué ; non
> documenté ici.

## Affichage des erreurs de soumission (création d'utilisateur)

WHEN la création d'un utilisateur (`UserForm` mode `create`, via `useCreateUser`) échoue avec une
`ApiError` (ex. 409 — email ou téléphone déjà utilisé) THEN le message réel renvoyé par le backend
est affiché dans un `FormAlert` (cf. `socle-frontend/spec.md`) au-dessus du formulaire, transmis par
la page appelante (`PageGestionUtilisateurs` ou `AdminCreatePage`) — le hook `useCreateUser` ne gère
plus lui-même l'affichage de l'erreur (plus de `Toast` automatique sur échec).

WHEN l'utilisateur ferme ce bandeau (croix), soumet à nouveau, ou ferme la modale de création
(`PageGestionUtilisateurs`) THEN le bandeau disparaît.

WHY : même raison que pour l'inscription (cf. `authentification-comptes/spec.md`) — le `Toast` bas à
droite pouvait ne pas être vu.
