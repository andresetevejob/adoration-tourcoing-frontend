# Proposition — toggle-visibilite-mot-de-passe

## Why
Aujourd'hui, tous les champs mot de passe (`type="password"`) masquent la saisie sans possibilité de la révéler, y compris sur le formulaire d'inscription où l'utilisateur doit saisir deux fois son mot de passe (mot de passe + confirmation). Une icône "œil" permettant d'afficher/masquer temporairement la saisie réduit les erreurs de frappe et les échecs de confirmation, sur les deux applications.

## What Changes
- `packages/shared/src/ui/Input.tsx` : quand `type="password"` est passé, afficher un bouton "œil" (icône SVG inline, sans nouvelle dépendance) à l'intérieur du champ qui bascule l'attribut `type` entre `password` et `text`. Comportement par défaut masqué ; état non persisté (revient à masqué à chaque montage). `aria-label` dynamique ("Afficher le mot de passe" / "Masquer le mot de passe"), bouton `type="button"` (ne doit pas soumettre le formulaire).
- Aucun changement d'API publique cassant : les consommateurs actuels de `Input` continuent de fonctionner sans modification (le toggle est automatique dès que `type="password"` est utilisé).
- Bénéficient automatiquement du toggle, sans code supplémentaire côté formulaire :
  - `apps/user-app/src/components/auth/RegisterForm.tsx` (mot de passe + confirmation) — demande explicite
  - `apps/user-app/src/components/auth/LoginForm.tsx`
  - `apps/admin-app/src/components/auth/LoginForm.tsx`
  - `apps/admin-app/src/components/users/UserForm.tsx`

## Impact
- Affected specs : aucune spec vivante n'existe encore (`openspec/specs/` est vide) ; ce changement enrichit le composant `Input` documenté dans le change `socle-frontend` (non encore gradué) et impacte les usages dans `authentification-comptes` et `gestion-utilisateurs` (également non gradués).
- Affected code : `packages/shared/src/ui/Input.tsx` (+ test associé), aucun changement requis dans les 4 formulaires consommateurs listés ci-dessus (ils passent déjà `type="password"`).
- Pas de dépendance ajoutée (icône SVG inline). Pas de changement backend, pas de breaking change.

*Portée validée avec l'utilisateur* : le toggle s'applique à tous les champs mot de passe de l'application (pas uniquement au formulaire d'inscription), via le composant `Input` partagé.
