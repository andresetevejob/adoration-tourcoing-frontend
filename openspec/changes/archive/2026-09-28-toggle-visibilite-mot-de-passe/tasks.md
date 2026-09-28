# Tasks — toggle-visibilite-mot-de-passe

## 1. Composant partagé
- [ ] 1.1 Étendre `packages/shared/src/ui/Input.tsx` : détection de `type="password"`, état local `visible` (défaut `false`), bouton "œil" positionné en overlay dans le champ, bascule `type` entre `password`/`text`.
- [ ] 1.2 Icônes SVG inline (œil / œil barré), `aria-label` dynamique, `tabIndex` cohérent, ne doit pas déclencher la soumission du formulaire (`type="button"`).
- [ ] 1.3 Vérifier que le padding/le style du champ ne casse pas l'affichage des messages d'erreur existants.

## 2. Vérification sur les consommateurs (aucun changement de code attendu)
- [x] 2.1 RegisterForm (user-app) — mot de passe + confirmation
- [x] 2.2 LoginForm (user-app)
- [x] 2.3 LoginForm (admin-app)
- [x] 2.4 UserForm (admin-app, gestion des utilisateurs)

## 3. Tests
- [x] 3.1 Test du composant `Input` : le bouton n'apparaît que si `type="password"`, clic bascule la visibilité et l'`aria-label`, le focus/la valeur du champ sont préservés après bascule.
- [x] 3.2 Test de non-régression sur `RegisterForm` (ou test existant mis à jour) confirmant que la saisie reste fonctionnelle avec le toggle.

## 4. Revue
- [x] 4.1 Revue de code (accessibilité, absence de dépendance ajoutée, cohérence visuelle sur les deux apps). Point important (focus visible clavier, WCAG 2.4.7) et 3 mineurs corrigés ; 1 erreur de lint introduite par les tests corrigée.
