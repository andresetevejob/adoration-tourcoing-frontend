# Tasks — planning-mois-surlignage-creneaux

## 1. Retirer l'implémentation précédente ("aujourd'hui uniquement")
- [x] 1.1 Supprimer `isToday` de `packages/shared/src/utils/formatters.ts` et ses tests dans
      `formatters.test.ts`.
- [x] 1.2 Supprimer la règle `.fc-event.planning-event--today` de
      `packages/shared/src/ui/fullcalendar-overrides.css`.
- [x] 1.3 `apps/user-app/src/components/agenda/planningEntries.ts` : retirer le paramètre
      `highlightToday` de `mapPlanningEntryToEvent`/`mapPlanningEntriesToEvents`, retirer la logique
      d'ajout de `"planning-event--today"` à `classNames`.
- [x] 1.4 `apps/user-app/src/components/agenda/CalendrierReservations.tsx` : retirer l'argument
      `highlightToday: periode.mode === "mois"` à l'appel de `mapPlanningEntriesToEvents`.
- [x] 1.5 Même retrait côté admin-app : `planningEntries.ts` et `CalendrierPlanningAdmin.tsx`.
- [x] 1.6 Nettoyer les tests ajoutés pour `highlightToday`/`isToday` dans
      `planningEntries.test.ts` (user-app et admin-app) et
      `CalendrierReservations.test.tsx`/`CalendrierPlanningAdmin.test.tsx`.

## 2. Nouvelle règle CSS scopée à la vue Mois
- [x] 2.1 Ajouter dans `packages/shared/src/ui/fullcalendar-overrides.css` :
      `.fc-dayGridMonth-view .fc-event { background-color: var(--color-gold-100); border: 1px solid
      var(--color-gold-400); border-radius: 4px; }` (mêmes déclarations que `.planning-event--mine`).
- [x] 2.2 Vérifier que ce fichier CSS est bien importé par les DEUX apps (actuellement, vérifier s'il
      n'est importé que par `user-app/src/index.css` — l'étendre à `admin-app/src/index.css` si
      nécessaire, puisque cette nouvelle règle doit s'appliquer aussi côté admin).

## 3. Vérification visuelle
- [ ] 3.1 Vérifier dans le navigateur (`/agenda` et `/planning`, vue Mois) que TOUS les créneaux
      affichés sont encadrés en gold, y compris ceux d'autres jours que le jour courant, y compris
      les créneaux anonymisés côté user-app et les créneaux d'autres utilisateurs côté admin-app.
      Vérifier aussi qu'en vue Jour/Intervalle, seuls les créneaux "Ma réservation" restent gold (pas
      de régression).

## 4. Spec
- [x] 4.1 Spec déjà mise à jour dans `openspec/specs/consultation-planning/spec.md` (sous-section
      "Surlignage de tous les créneaux réservés en vue Mois") — vérifier la cohérence avec
      l'implémentation finale avant archivage de ce change.
