# Plan de décomposition en unités de travail

**Terminologie** : « Unité de travail » = regroupement logique de récits pour la Construction. Ici, les deux applications (`user-app`, `admin-app`) et le package partagé ne sont **pas** des microservices, mais un monolithe frontend en 2 déploiements : les unités sont donc des **modules logiques**, généralement transverses aux deux apps quand le domaine l'est (ex. Authentification).

## Checklist d'exécution
- [ ] Proposer un découpage en unités couvrant les 42 récits et les 13 composants logiques de `components.md`
- [ ] Générer `unit-of-work.md`
- [ ] Générer `unit-of-work-dependency.md`
- [ ] Générer `unit-of-work-story-map.md`
- [ ] Vérifier que chaque récit de `stories.md` est assigné à exactement une unité

## Proposition de découpage (9 unités)

| # | Unité | Domaines couverts | Applications |
|---|---|---|---|
| U0 | **Fondation & Design System** | Monorepo (workspaces, tsconfig), `packages/shared` complet (types, client API, UI kit + thème, utils), tooling (ESLint/Prettier/Vitest/Playwright), Docker/docker-compose, retrait des éléments obsolètes du template (CDN Tailwind, `vite-plugin-singlefile`, `index.html` statique) | Aucune (transverse) |
| U1 | **Authentification & Comptes** | EF-1 (inscription, connexion, session, Mon compte) | user-app + admin-app |
| U2 | **Agenda / Planning (consultation)** | EF-2 (calendrier, anonymisation, filtres) | user-app + admin-app |
| U3 | **Réservation & Annulation** | EF-3, EF-4 (réserver, annuler, règles de délai) | user-app + admin-app |
| U4 | **Gestion des utilisateurs** | EF-5 (CRUD, validation/rejet) | admin-app |
| U5 | **Gestion des administrateurs** | EF-6 (CRUD comptes Administrateur) | admin-app (SuperAdmin) |
| U6 | **Annonces** ⚠️ MSW | EF-7 (lecture + CRUD) | user-app (lecture) + admin-app (CRUD) |
| U7 | **Contact** ⚠️ MSW | EF-8 | user-app |
| U8 | **Vitrine & Accès transverses** | EF-9, EF-10 (pages statiques, 403/404, garde de routes) | user-app (vitrine) + les deux apps (403/404) |

**Justification** : alignement direct sur le découpage par domaine déjà retenu pour les récits utilisateur (évite un remapping), et sur les 13 composants logiques de `components.md`. U0 est isolée car bloquante pour toutes les autres (dépendance `packages/shared`). U2/U3 et U4/U5 sont sujettes à dépendance interne forte (voir `unit-of-work-dependency.md`) mais restent des unités séparées pour permettre un développement/test incrémental plus fin.

## Question de clarification

**Note** : réponse par défaut proposée et justifiée ci-dessus, pré-remplie ci-dessous.

### Question 1 — Découpage retenu
Le découpage en 9 unités ci-dessus vous convient-il ?

A) Oui, garder ce découpage tel quel
B) Non, regrouper davantage (ex. fusionner Agenda+Réservation+Annulation en une seule unité "Planning")
C) Non, découper davantage (ex. séparer Réservation et Annulation en deux unités distinctes)
D) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : A

## Note informative (non bloquante)
Une fois les unités générées, l'étape 4 de la commande `/aidlc-nouveau-projet` vous demandera de choisir entre traiter les unités une par une dans cette session, ou lancer `/launch-team` pour paralléliser les unités indépendantes entre elles (cf. `unit-of-work-dependency.md` pour les unités réellement parallélisables une fois U0 et U1 terminées : U2+U3, U4+U5, U6, U7, U8). Cette décision sera reprise explicitement après la génération.
