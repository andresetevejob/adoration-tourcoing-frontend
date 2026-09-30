# Tasks — planning-filtres-vue-periode

## 1. Conception détaillée (api-architect)
- [x] 1.1 Mapping vue FullCalendar ↔ mode (jour/mois/intervalle), en particulier la vue à durée
      variable pour "intervalle"
- [x] 1.2 Stratégie de pagination pour `getPlanningMensuel`/`getPlanningIntervalle`
- [x] 1.3 Forme du composant sélecteur de mode (remplace/étend `FiltreDatePlanning`)
- [x] 1.4 Forme de `UsePlanningParams` (union discriminée par mode) et `queryKey` associée

## 2. Implémentation partagée aux deux apps (api-developer)
- [x] 2.1 `api/endpoints/planning.ts` : `getPlanningMensuel`, `getPlanningIntervalle`
- [x] 2.2 `hooks/usePlanning.ts` : support des trois modes
- [x] 2.3 Composant sélecteur de mode (remplace `FiltreDatePlanning`), avec validation client du
      plafond 31 jours sur le mode intervalle
- [x] 2.4 `CalendrierReservations.tsx` / `CalendrierPlanningAdmin.tsx` : vue FullCalendar dynamique
      selon le mode
- [x] 2.5 `PageAgenda.tsx` / `PagePlanning.tsx` : câblage du nouveau sélecteur et du hook

## 3. Tests (test-engineer)
- [x] 3.1 Tests unitaires du sélecteur de mode (3 modes, validation 31 jours)
- [x] 3.2 Tests `usePlanning` (bon endpoint appelé selon le mode, `queryKey` correcte)
- [x] 3.3 Tests `api/endpoints/planning.ts` (nouveaux endpoints)
- [x] 3.4 Tests des pages (`PageAgenda`/`PagePlanning`) : changement de mode → calendrier mis à jour

## 4. Bruno (bruno-developer)
- [x] 4.1 N/A — projet frontend uniquement (`.claude/tech-stack.md`), aucun endpoint backend
      créé dans ce repo, aucun dossier `bruno/` existant. Règle explicite de l'agent
      `bruno-developer` : ne s'applique pas à une unité purement frontend consommant une API
      définie ailleurs.

## 5. Revue (code-reviewer)
- [x] 5.1 Revue correction/sécurité/conventions sur l'ensemble des fichiers listés dans
      `proposal.md` — 0 bloquant, 2 importants (agrégation tronquée au-delà de 50 pages sans
      signal ; absence de garde défensive sur une durée ≤0 dans `resolveCalendarConfig`), 3
      mineurs. Décision de traitement : voir section 7bis.

## 6. Amendement — MonthPicker `react-datepicker` (api-architect → api-developer → test-engineer → code-reviewer)
- [x] 6.1 Conception courte : intégration de `ReactDatePicker` (`showMonthYearPicker`) dans le mode
      "Mois" de `FiltreDatePlanning.tsx`, conversion `Date` ↔ `{annee, mois}`, gestion du CSS
      (`react-datepicker/dist/react-datepicker.css` + éventuelle surcharge Tailwind)
- [x] 6.2 Ajout dépendance `react-datepicker` (`apps/user-app/package.json`,
      `apps/admin-app/package.json`)
- [x] 6.3 Implémentation dans les deux apps (`FiltreDatePlanning.tsx`, mode "Mois" uniquement —
      modes "Jour"/"Intervalle" inchangés) + locale française (`registerLocale("fr", fr)`)
- [x] 6.4 Tests mis à jour (`FiltreDatePlanning.test.tsx`) pour le nouveau contrôle
- [x] 6.5 Revue (`code-reviewer`) du delta + vérification cohérence visuelle avec `theme.css`
- [x] 6.6 **Bug réel trouvé en navigateur réel (Playwright, hors périmètre des tests jsdom)** :
      popup du mois peint derrière la grille FullCalendar → sélection de mois impossible en
      pratique. Corrigé par `portalId="datepicker-portal"` (portail React hors du contexte
      d'empilement local) + `.react-datepicker-popper { z-index: 50 !important; }` dans
      `packages/shared/src/ui/react-datepicker-overrides.css` (la règle sans `!important` perdait
      un conflit de cascade à spécificité égale contre le CSS natif de la librairie). Vérifié
      visuellement par capture d'écran réelle + clic fonctionnel sur un mois, à deux reprises
      (implémenteur puis orchestrateur, indépendamment).
- [x] 6.7 Nettoyage ESLint : 6 erreurs `@typescript-eslint/restrict-template-expressions`
      (`number` interpolé sans `String(...)`) + typage des mocks de test — 0 erreur restante,
      2 warnings pré-existants tolérés (`react-refresh/only-export-components`).
- [x] 6.8 Revue finale consolidée (`code-reviewer`) — 0 finding.

## 7. Décision sur les findings de la revue initiale (§5.1)
- [x] 7.1 Corrigé ou documenté explicitement comme limitation connue :
      - Important #1 : troncature silencieuse au-delà de `PLANNING_AGGREGATE_MAX_PAGES` —
        documenté comme limitation connue dans `openspec/specs/consultation-planning/spec.md`
        (graduation), non corrigé (risque jugé négligeable : ~5000 créneaux sur ≤31 jours,
        sans rapport avec le volume réel d'une chapelle).
      - Important #2 : absence de garde défensive dans `resolveCalendarConfig` (durée ≤0) —
        documenté comme précondition implicite (garantie par `validateIntervalle` en amont, seul
        point d'écriture de `periode` en mode intervalle), non corrigé.

## 8. Graduation
- [ ] 8.1 Créer `openspec/specs/consultation-planning/spec.md` (comportement actuel + nouveau,
      cf. proposal.md "Contexte")
- [ ] 8.2 Archiver cette change vers `openspec/changes/archive/AAAA-MM-JJ-planning-filtres-vue-periode/`
