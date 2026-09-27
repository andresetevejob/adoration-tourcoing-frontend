# Conception — U8 : Vitrine & Accès transverses

Sources : `aidlc-docs/inception/user-stories/stories.md` (US-ACCESS-01 à 03), `aidlc-docs/inception/requirements/requirements.md` (EF-9, EF-10), `aidlc-docs/inception/application-design/unit-of-work.md` (§U8 : `HomePage`, `QuiSommesNousPage`, `Navbar`, `Footer`, `ScrollToTop`, `AdorationLive`, `Lightbox` côté `user-app` ; `Page403`/`Page404` transverses ; `Header`/`Sidebar` admin-app), `apps/user-app/src/legacy-template/{pages/{Home,QuiSommesNous}.tsx,components/{Footer,ScrollToTop,AdorationLive,Lightbox}.tsx}` (gabarit visuel).

**Constat de périmètre réel** (vérifié avant conception, pas supposé) :
- `PageAccueil`/`Page403`/`Page404`/`AuthNav`/admin-app `Header`/`Sidebar` existent déjà (posés dès U0/U1 comme socle minimal) — `AppLayout.tsx` porte même un commentaire explicite `// remplacée/enrichie par la vraie Navbar en U8`. U8 **finalise** ces éléments plutôt que de les créer ex nihilo.
- US-ACCESS-01/02 (redirection non-connecté, 403) sont déjà couvertes par `ProtectedRoute` (U1). Seul **US-ACCESS-03** (lien de retour vers l'accueil sur la 404) n'est **pas** couvert : `Page404` (les deux apps) n'a aucun lien — écart corrigé ici (§5).
- `packages/shared/src/ui/theme.css` définit déjà les tokens couleur + animations (`animate-fade-*`, `animate-float`, `animate-glow`) consommés par le gabarit legacy. En revanche les classes `btn-primary`/`btn-outline`/`btn-gold-outline`/`section-title`/`ornament-divider`/`card-hover`/`glass-dark`/`text-gradient` **n'existent nulle part** (ni Tailwind, ni CSS du projet) — un copier-coller tel quel du gabarit rendrait ces éléments sans style. Traitement identique à U6/U7 (`PageActualites`/`PageContact`) : ces classes sont remplacées par des utilitaires Tailwind explicites ou des composants déjà partagés, jamais réintroduites.

---

## 1. Décision — fusion `PublicLayout`/`AppLayout` en un layout unique avec `Navbar`

`AppLayout` (poussé par U1 comme en-tête minimale pour `/mon-compte`) et `PublicLayout` (header `AuthNav` seul, sans navigation de site) sont deux chrome distincts sans aucun lien de navigation vers les pages vitrine. U8 les remplace par **un seul layout** (`PublicLayout`, conservé sous ce nom pour minimiser le churn d'imports) composé de :

```
<PublicLayout>
  <Navbar />       {/* nouveau : liens de site + <AuthNav/> */}
  <ScrollToTop />
  <Outlet />
  <Footer />
</PublicLayout>
```

`AppLayout.tsx`/`AppLayout.test.tsx` sont supprimés ; `/mon-compte` rejoint l'arbre de routes du layout unique (le `ProtectedRoute` qui le garde ne change pas). Le message d'accueil nominatif (« Jean Dupont — Adorateur ») affiché par l'ancien `AppLayout` disparaît : aucun récit ne l'exige, `AuthNav` (« Mon compte »/« Déconnexion », inchangé, U1) suffit à signaler l'état connecté.

### `components/layout/Navbar.tsx` [CRÉÉ]

```typescript
const SITE_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/agenda", label: "Agenda" },
  { to: "/actualites", label: "Actualités" },
  { to: "/qui-sommes-nous", label: "Qui sommes-nous ?" },
  { to: "/contact", label: "Contact" },
];

export function Navbar(): JSX.Element;
// <Link to="/"> (marque « Chapelle du Vœux ») + SITE_LINKS.map(<Link>) + <AuthNav/> à droite.
// Toujours les 5 liens, quel que soit l'état d'authentification (/agenda est public, cf. U2/U3) —
// pas de menu burger mobile (non spécifié par EF-9/NFR responsive, `flex-wrap` suffit).
```

---

## 2. Composants vitrine portés du gabarit (`components/vitrine/`)

### 2.1 `AdorationLive.tsx` [CRÉÉ, porté quasi à l'identique]

Horloge live (`setInterval` 1s) + compteur de jours depuis le 1er août 1885 (donnée du récit fictif du gabarit, cf. §4 point ouvert). Seul changement : aucun (déjà autonome, aucun import cassé).

### 2.2 `Lightbox.tsx` [CRÉÉ, porté à l'identique]

Modal plein écran (fermeture Échap/clic fond, navigation ← →, `document.body.style.overflow` verrouillé pendant l'ouverture). Aucun import cassé (déjà autonome).

---

## 3. Chrome global porté (`components/layout/`)

### 3.1 `Footer.tsx` [CRÉÉ]

Porté du gabarit avec deux corrections **fonctionnelles** (pas de contenu narratif fictif, cf. §4) :
- `import { Link } from "react-router-dom"` → `"react-router"` (le paquet `react-router-dom` n'est pas une dépendance du projet ; seul `react-router` v7 l'est, cf. tous les autres fichiers).
- Section « Inscriptions » : les liens `/inscription-lecteur`/`/inscription-veilleur` ne correspondent à **aucune route existante** (rôle « lecteur » inexistant dans `UserRole` ; l'inscription réelle est unifiée sur `/inscription` avec choix de rôle dans `RegisterForm`, U1). Remplacés par une section « Compte » : `Connexion` (`/connexion`), `Inscription` (`/inscription`) — liens réels, pas une correction de contenu narratif mais un correctif de routes cassées, distinct du choix « reprendre tel quel » (§4) qui ne s'applique qu'au texte/identité, jamais à un lien mort.
- Coordonnées de contact (adresse/téléphone/email) : reprises à l'identique de `PageContact` (déjà la même donnée fictive dans le gabarit source) — aucune divergence introduite.

### 3.2 `ScrollToTop.tsx` [CRÉÉ]

Porté à l'identique (`import ... from "react-router-dom"` → `"react-router"`) : remonte en haut au changement de route, bouton flottant « retour en haut » après 600px de scroll.

---

## 4. `pages/PageAccueil.tsx` [RÉÉCRIT] et `pages/PageQuiSommesNous.tsx` [CRÉÉ]

Remplacent respectivement le stub U0 et le placeholder `/qui-sommes-nous`. Structure/sections reprises du gabarit (hero, stats, présentation, mission/vision, `AdorationLive`, galerie+`Lightbox`, témoignages, horaires, CTA pour `PageAccueil` ; hero, histoire, valeurs, frise chronologique, équipe pour `PageQuiSommesNous`), avec les écarts suivants :

**Classes non définies → utilitaires Tailwind explicites ou composants déjà établis** (même traitement que U6 §7.2/U7) :
- `btn-primary`/`btn-outline`/`btn-gold-outline` (sur des `<Link>`, pas des `<button>` — ce sont des CTA de navigation) → classes Tailwind explicites reproduisant les variantes déjà définies par `Button` (`@chapelle/shared/ui`) : `bg-gold-500 text-night-950 hover:bg-gold-400` (primary), `border border-ivory/30 text-ivory hover:bg-white/10` (outline, adapté fond sombre), `border border-gold-500 text-gold-700 hover:bg-gold-50` (gold-outline) — pas de nouveau composant `LinkButton` (aucun autre call site ne le justifie, cf. principe « pas d'abstraction spéculative »).
- `section-title` → `font-serif text-3xl sm:text-4xl lg:text-5xl font-bold` (taille alignée sur les titres déjà en place, `PageActualites`/`PageContact`).
- `ornament-divider`+`<span className="icon">` → reprise exacte du triptyque `<span className="h-px w-16 bg-gold-400/50"/><span className="text-gold-400 text-lg">✦</span><span className="h-px w-16 bg-gold-400/50"/>` déjà utilisé par les hero de `PageActualites`/`PageContact` (U6/U7).
- `card-hover` → `transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl` (même valeurs que la carte `PageActualites`).
- `glass-dark` → `bg-white/5 border border-white/10 backdrop-blur-sm`.
- `text-gradient` → `text-gold-400` (couleur pleine ; un dégradé texte nécessiterait une nouvelle classe globale pour un seul usage décoratif, écart mineur assumé).

**Suppression de l'animation "reveal on scroll" (`IntersectionObserver` + `data-reveal`)** : purement décoratif, non requis par EF-9, non reproduit par `PageActualites`/`PageContact` (U6/U7) ; les sections sont statiquement visibles. Simplifie le composant et évite une dépendance à `IntersectionObserver` non polyfillée en environnement de test.

**Remplacement des 3 « actualités » codées en dur (section Actualités de `PageAccueil`) par `useAnnonces({ statut: StatutAnnonce.PUBLIE })` (hook déjà existant, U6), 3 premières entrées** : les news statiques du gabarit dupliquaient — avec un contenu different et non synchronisé — une fonctionnalité déjà branchée sur un vrai state (mock MSW `/annonces`) via `/actualites`. Les garder aurait affiché une actualité perpétuellement fausse à côté d'une page `/actualites` correcte. Mêmes champs/écarts que `PageActualites` (pas d'`image`/`category`, `truncateExcerpt`, `formatDate`) ; états `isLoading`/`isError`/vide gérés sobrement (mêmes messages que `PageActualites`).

**CTA vers des routes réelles** : « Devenir veilleur »/« S'inscrire comme veilleur » → `/inscription` (le rôle VEILLEUR est sélectionnable dans `RegisterForm`, U1 — le libellé marketing reste inchangé) ; « Découvrir l'actualité »/« Voir toutes les actualités »/« Lire la suite » → `/actualites` ; « En savoir plus » → `/qui-sommes-nous`. Le bouton « Devenir lecteur »/« Devenir lecteur » (CTA final) est **supprimé** : aucun rôle « lecteur » n'existe dans `UserRole` (`ADORATEUR`/`VEILLEUR`/`ADMINISTRATEUR`/`SUPERADMINISTRATEUR`) — contrairement au contenu narratif fictif (§ci-dessous), un lien vers une fonctionnalité inexistante est un défaut fonctionnel, pas un choix de contenu, et est donc corrigé sans que ce soit un écart au choix « reprendre tel quel ».

**Contenu narratif fictif conservé tel quel, sur demande explicite** (historique/dates, équipe cléricale nommée dans `PageQuiSommesNous`, témoignages attribués dans `PageAccueil`, statistiques ("11M visiteurs/an"), adresse/téléphone/email) : décision explicitement demandée pour cette unité, **à corriger avant toute mise en production** avec le contenu réel de la Chapelle du Vœux (Tourcoing) — cf. `aidlc-state.md`. Traitement identique à U7 (coordonnées de contact).

---

## 5. `Page404.tsx` [MODIFIÉ, les deux apps] — lien de retour manquant (US-ACCESS-03)

```typescript
// apps/{user-app,admin-app}/src/pages/Page404.tsx — [MODIFIÉ]
<Link to="/" className="text-gold-700 hover:underline">Retour à l'accueil</Link>
```

Seul écart réel identifié entre le code existant et le Gherkin US-ACCESS-03 (« un lien de retour vers l'accueil de l'application ») — absent des deux `Page404` actuelles. `Page403` n'est pas concernée : US-ACCESS-02 n'exige qu'un « message explicite », déjà présent, pas de lien.

`Page403`/le reste de `Page404` (titre, message) : inchangés.

---

## 6. Routage — `router.tsx` (`user-app`)

```typescript
// [MODIFIÉ] Fusion des deux groupes de routes en un seul, sous le layout unique
{
  element: <PublicLayout />,
  children: [
    { path: "/", element: <PageAccueil /> },
    { path: "/connexion", element: <PageConnexion /> },
    { path: "/inscription", element: <PageInscription /> },
    { path: "/inscription/confirmation", element: <PageConfirmationInscription /> },
    { path: "/agenda", element: <PageAgenda /> },
    { path: "/actualites", element: <PageActualites /> },
    { path: "/qui-sommes-nous", element: <PageQuiSommesNous /> }, // remplace le placeholder
    { path: "/contact", element: <PageContact /> },
    {
      path: "/mon-compte",
      element: (
        <ProtectedRoute allowedRoles={[UserRole.ADORATEUR, UserRole.VEILLEUR]}>
          <PageMonCompte />
        </ProtectedRoute>
      ),
    },
    { path: "/non-autorise", element: <Page403 /> },
    { path: "*", element: <Page404 /> },
  ],
}
```

`admin-app/router.tsx` : aucun changement de routage (Header/Sidebar déjà finalisés, cf. constat de périmètre réel ci-dessus) — seul `Page404.tsx` change (§5).

---

## 7. Stratégie de test

- `Navbar.test.tsx` : les 5 liens de site + délégation à `AuthNav` (mock `useAuth`, même patron que `PublicLayout.test.tsx` actuel).
- `Footer.test.tsx`/`ScrollToTop.test.tsx`/`AdorationLive.test.tsx`/`Lightbox.test.tsx` : rendu + interactions clavier/souris (composants purs, sans MSW).
- `PageAccueil.test.tsx` : hero + section actualités branchée sur `useAnnonces` (MSW réel, même patron que `PageActualites.test.tsx`, U6) + présence de la galerie/`AdorationLive`.
- `PageQuiSommesNous.test.tsx` : rendu des sections (pas de dépendance réseau, contenu statique).
- `PublicLayout.test.tsx` [MODIFIÉ] : rend désormais `Navbar`+`Footer` en plus d'`AuthNav`/`Outlet`.
- `Page404.test.tsx` [MODIFIÉ, les deux apps] : lien « Retour à l'accueil » présent et pointant vers `/`.
- `router.test.tsx` (`user-app`) [MODIFIÉ] : ajout d'un cas `/qui-sommes-nous`, adaptation du cas `/mon-compte` (même comportement, layout fusionné).
- `AppLayout.tsx`/`AppLayout.test.tsx` : supprimés.

---

## 8. Points ouverts pour l'orchestrateur

1. **Contenu narratif fictif conservé** (§4) : historique/dates/équipe/témoignages/stats/coordonnées — à remplacer par le contenu réel de la Chapelle du Vœux avant mise en production (décision déjà actée pour U7, reconduite ici sur demande explicite).
2. **Pas de menu burger mobile pour `Navbar`** : 5 liens + bloc `AuthNav` en `flex-wrap`, lisible mais non optimisé sur petit écran. Aucune spécification ne l'exige explicitement ; à revisiter si un retour utilisateur le demande.
