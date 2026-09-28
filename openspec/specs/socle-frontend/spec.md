# Spec — socle-frontend (composant Input & pipeline Tailwind)

> Périmètre gradué : le composant partagé `Input` (packages/shared/src/ui/Input.tsx) et la
> configuration Tailwind nécessaire à son bon fonctionnement. Le reste de la capacité
> socle-frontend (client API, tooling, autres composants du kit UI) n'est pas encore documenté ici.

## Pipeline CSS : scan de packages/shared

`packages/shared` est hors de la racine Vite de chaque app (`apps/user-app`, `apps/admin-app`).
Tailwind v4 fait une détection automatique de contenu basée sur le système de fichiers à partir
du CSS d'entrée — sans directive explicite, il ne scanne pas les fichiers hors de cette racine.

`apps/user-app/src/index.css` et `apps/admin-app/src/index.css` DOIVENT donc contenir :
```css
@source "../../../packages/shared/src";
```
avant l'import de `packages/shared/src/ui/theme.css`. Sans cette ligne, les classes Tailwind
utilisées uniquement dans le kit UI partagé (jamais dupliquées dans le code d'une app) ne sont
jamais générées dans le CSS final, sans erreur de build — le composant rend silencieusement mal
(ex : positionnement cassé, anneau de focus clavier manquant).

WHY : bug découvert lors de l'ajout du toggle de visibilité du mot de passe (`inset-y-0` absent
du CSS compilé) ; a révélé que l'anneau de focus clavier (`focus-visible:outline*`) de tous les
boutons du kit UI partagé était également absent depuis le début.

## Composant Input

Le composant `Input` (`packages/shared/src/ui/Input.tsx`) est le champ de saisie standard utilisé
par tous les formulaires des deux applications. Il accepte toutes les props natives d'un `<input>`
HTML, plus `label` (optionnel) et `error` (optionnel, affiche un message sous le champ).

### Visibilité du mot de passe

WHEN la prop `type` vaut `"password"` THEN un bouton "œil" est affiché en overlay à droite du champ,
permettant de basculer temporairement l'affichage entre masqué (`type="password"`) et visible
(`type="text"`).

- État par défaut : masqué. Non persisté — revient à masqué à chaque nouveau montage du composant.
- Le bouton est un `<button type="button">` : il ne déclenche jamais la soumission d'un formulaire englobant.
- Attributs d'accessibilité : `aria-label` dynamique ("Afficher le mot de passe" / "Masquer le mot de passe")
  et `aria-pressed` reflétant l'état de visibilité.
- Le focus clavier sur le bouton reste visible (`focus-visible:outline`), cohérent avec le reste du kit UI.
- La saisie de l'utilisateur est préservée lors de la bascule.
- WHEN `type` est différent de `"password"` THEN aucun bouton n'est affiché, comportement inchangé.

WHY : réduire les erreurs de saisie sur les champs mot de passe (notamment la confirmation lors de
l'inscription) sans introduire de dépendance externe (icônes en SVG inline).

### Consommateurs actuels
- `apps/user-app/src/components/auth/RegisterForm.tsx` (mot de passe + confirmation)
- `apps/user-app/src/components/auth/LoginForm.tsx`
- `apps/admin-app/src/components/auth/LoginForm.tsx`
- `apps/admin-app/src/components/users/UserForm.tsx`
