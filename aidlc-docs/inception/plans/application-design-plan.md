# Plan de conception de l'application

## Contexte analysé
- `aidlc-docs/inception/requirements/requirements.md` (10 exigences fonctionnelles, NFR)
- `aidlc-docs/inception/user-stories/stories.md` (42 récits, 9 domaines)
- Arborescence cible déjà détaillée par l'utilisateur dans `prompt-frontend-revise.md` §5 (fichier par fichier, par package)

## Questions de clarification
**Aucune question nécessaire.** L'arborescence cible fournie par l'utilisateur (prompt-frontend-revise.md §5) spécifie déjà, fichier par fichier, les composants, hooks, endpoints API et pages de chaque package, ainsi que les règles de dépendance (pas de dépendance croisée entre `user-app` et `admin-app`, imports `@chapelle/shared/*` par sous-chemin uniquement). La Conception de l'application se limite donc ici à **regrouper cette arborescence en composants logiques avec leurs responsabilités et interfaces**, sans décision supplémentaire nécessitant un arbitrage utilisateur.

## Checklist d'exécution
- [x] Analyser requirements.md + stories.md + l'arborescence cible
- [ ] Générer `components.md` — composants logiques, responsabilités, interfaces
- [ ] Générer `component-methods.md` — signatures de méthodes (hooks, client API, store)
- [ ] Générer `services.md` — couche d'orchestration (flux d'authentification, gestion d'erreurs centralisée)
- [ ] Générer `component-dependency.md` — matrice de dépendances + diagramme
- [ ] Valider l'exhaustivité et la cohérence avec `requirements.md`/`stories.md`
