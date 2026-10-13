# Spec — socle-frontend (composant Input, FormAlert, Navigation & pipeline Tailwind)

> Périmètre gradué : le composant partagé `Input` (packages/shared/src/ui/Input.tsx), le composant
> partagé `FormAlert` (packages/shared/src/ui/FormAlert.tsx), la navigation mobile de `user-app`
> (`Navbar`/`MobileDrawer`) et la configuration Tailwind nécessaire à leur bon fonctionnement. Le
> reste de la capacité socle-frontend (client API, tooling, autres composants du kit UI) n'est pas
> encore documenté ici.

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

## Composant FormAlert

Le composant `FormAlert` (`packages/shared/src/ui/FormAlert.tsx`) est le bandeau d'erreur dismissible
affiché au-dessus d'un formulaire, en alternative au `Toast` global quand l'erreur doit rester
visible jusqu'à action explicite de l'utilisateur.

Accepte `message` (string) et `onDismiss` (callback). Rendu : `role="alert"`, palette `bg-red-100`/
`text-red-800` (identique à la variante `danger` de `Badge`), bouton de fermeture (✕,
`aria-label="Fermer"`) en haut à droite. Pas d'auto-dismiss (fermeture manuelle uniquement) — à la
différence du `Toast` (disparition automatique après 4s), choisi délibérément ici pour ne pas faire
disparaître un message important avant que l'utilisateur l'ait vu.

### Consommateurs actuels
- `apps/user-app/src/components/auth/RegisterForm.tsx`
- `apps/admin-app/src/components/users/UserForm.tsx` (mode `create` uniquement)

WHY : le `Toast` global (bas à droite, auto-dismiss 4s) peut passer inaperçu sur un écran de
formulaire long ou sur mobile — constaté sur l'erreur 409 (email/téléphone déjà utilisé) lors d'une
création de compte.

## Navigation (`apps/user-app/src/components/layout/Navbar.tsx`)

Seuil responsive : **768px** (`md` Tailwind), seul seuil "mobile" utilisé dans le projet (partagé
avec l'adaptation de l'Agenda, cf. `openspec/specs/consultation-planning/spec.md`).

### Barre desktop (≥768px)
Logo + 5 liens (`SITE_LINKS` : Accueil, Agenda, Actualités, Qui sommes-nous ?, Contact) + `AuthNav`,
tous visibles en permanence sur une seule ligne (`flex flex-wrap`).

### Drawer mobile (<768px)
WHEN la largeur d'écran est inférieure à 768px THEN `SITE_LINKS` et `AuthNav` disparaissent de la
barre visible, remplacés par un bouton hamburger (icône SVG inline, cible tactile ≥44px,
`aria-expanded`/`aria-controls`/`aria-label` dynamique "Ouvrir le menu"/"Fermer le menu").

WHEN le bouton hamburger est activé THEN un panneau (`MobileDrawer.tsx`, `role="dialog"`,
`aria-modal="true"`) glisse depuis le bord droit de l'écran (animation `transition-transform`
300ms, montage conditionnel — pas de DOM dupliqué quand fermé), recouvrant le contenu sous un
overlay (`bg-night-950/60`, même teinte que `Modal`) ; le panneau contient `SITE_LINKS` + `AuthNav`,
empilés verticalement.

Fermeture du drawer : clic sur l'overlay, touche `Échap`, ou clic sur un lien **ou bouton** du
drawer (ex. liens `SITE_LINKS`/"Mon compte", ou bouton "Déconnexion" d'`AuthNav` — les deux éléments
déclenchent la fermeture, pas seulement les liens, pour éviter un overlay bloquant après une
déconnexion réussie). Focus restauré sur le bouton hamburger à la fermeture ; pas de trap de focus
complet (Tab peut sortir du panneau).

WHY : sans bascule, les liens se compressaient de façon désordonnée sous 768px (`flex-wrap` sans
menu replié) — pattern standard "hamburger + drawer" pour la navigation mobile, cohérent avec
l'esthétique déjà en place (`Modal`, pas de nouvelle dépendance d'animation/icônes).
