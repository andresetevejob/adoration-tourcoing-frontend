# Tasks — agenda-planning-vue-semaine

## 1. Utilitaire partagé
- [x] 1.1 `packages/shared/src/utils/formatters.ts` : `lundiDeLaSemaine(dateISO: string): string` —
      retourne le lundi (yyyy-MM-dd) de la semaine ISO contenant `dateISO`, calcul cohérent avec
      `diffJoursInclusif` (parsing `${date}T00:00:00Z`).
- [x] 1.2 Tests `formatters.test.ts` : un lundi retourne lui-même, un dimanche retourne le lundi
      précédent (pas le suivant), chaque jour de la semaine retombe sur le même lundi.

## 2. Type central + cache (les deux apps)
- [x] 2.1 `hooks/planningPeriode.ts` (user-app et admin-app) : ajouter
      `{ mode: "semaine"; dateDebut: string }` à `PlanningPeriode` ; `periodeCacheKey` : nouveau cas
      `semaine:${dateDebut}`.

## 3. Récupération des données (les deux apps)
- [x] 3.1 `api/endpoints/planning.ts` / `usePlanning` : dispatch "semaine" vers le même chemin que
      "intervalle" (`getPlanningIntervalle`/`fetchAllPlanningPages`), `dateFin` calculé comme
      `dateDebut + 6 jours`.
- [x] 3.2 Tests `planning.test.ts`/`usePlanning.test.ts`.

## 4. Vue FullCalendar (les deux apps)
- [x] 4.1 `resolveCalendarConfig` (`CalendrierReservations.tsx`/`CalendrierPlanningAdmin.tsx`) :
      nouveau cas `"semaine"` → `{ initialView: "timeGridWeek", initialDate: periode.dateDebut, views: undefined }`.
- [x] 4.2 Tests vérifiant la vue FullCalendar active (`container.querySelector(".fc-view")).toHaveClass("fc-timeGridWeek-view")`,
      même convention que pour "mois"/"jour").

## 5. Affichage des créneaux (les deux apps)
- [x] 5.1 `renderPlanningEvent.tsx` : traiter `"timeGridWeek"` comme `"timeGridDay"` dans la
      condition de format horaire (`arg.timeText` seul, pas la plage `HH:mm – HH:mm`).
- [x] 5.2 Tests `renderPlanningEvent.test.tsx`.

## 6. Contrôle (`FiltreDatePlanning.tsx`, les deux apps)
- [x] 6.1 Ajouter `{ value: "semaine", label: "Semaine" }` à `MODE_OPTIONS`, entre "Jour" et "Mois".
- [x] 6.2 `handleModeChange` : nouveau cas "semaine" → `lundiDeLaSemaine(toISODateString(new Date()))`.
- [x] 6.3 Nouveau bloc de rendu conditionnel (`value.mode === "semaine"`) : `<Input type="date">`
      (valeur = `value.dateDebut`, normalise au lundi au changement via `lundiDeLaSemaine`) + bouton
      "Cette semaine". Pas de boutons précédent/suivant (cf. proposal.md, hors périmètre).
- [x] 6.4 Tests `FiltreDatePlanning.test.tsx`.

## 7. Revue
- [x] 7.1 `code-reviewer` : cohérence des deux apps (duplication fidèle), non-régression des modes
      Jour/Mois/Intervalle existants, `lundiDeLaSemaine` correcte aux limites (dimanche, changement
      de mois/année).

## 8. Spec
- [x] 8.1 Documenter le nouveau mode dans `openspec/specs/consultation-planning/spec.md` avant
      archivage de ce change.
