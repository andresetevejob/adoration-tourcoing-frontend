# Tasks — agenda-mois-plage-horaire-et-surlignage-reservation

## 1. Affichage début/fin en vue Mois
- [ ] 1.1 `apps/user-app/src/components/agenda/renderPlanningEvent.tsx` : remplacer `arg.timeText` par
      `HH:mm – HH:mm` construit depuis `arg.event.start`/`arg.event.end` (`formatTime` de
      `@chapelle/shared/utils`, Europe/Paris) — un créneau reste sur un seul jour calendaire (garanti
      côté backend), pas de variante multi-jours à gérer.
- [ ] 1.2 Appliquer uniquement en vue "Mois"/"Intervalle" (`arg.view.type !== "timeGridDay"`), vue
      "Jour" inchangée.
- [ ] 1.3 Même changement dans `apps/admin-app/src/components/planning/renderPlanningEvent.tsx`.
- [ ] 1.4 Mettre à jour `renderPlanningEvent.test.tsx` dans les deux apps concernées.

## 2. Surlignage "Ma réservation"
- [ ] 2.1 Ajouter la règle CSS pour `.planning-event--mine` (fond + bordure `gold`, cf. clarification)
      dans `packages/shared/src/ui/theme.css` (ou nouveau fichier importé par `user-app/src/index.css`
      — à trancher selon la convention déjà en place pour les autres overrides, ex.
      `react-datepicker-overrides.css`).
- [ ] 2.2 Vérifier visuellement (navigateur) que le badge "Ma réservation" reste lisible par-dessus le
      nouveau fond.
- [ ] 2.3 Pas de changement dans `admin-app` (hors scope, `isMine` toujours `false` par conception).

## 3. Spec
- [ ] 3.1 Après implémentation et revue, mettre à jour `openspec/specs/consultation-planning/spec.md`
      (section actuellement "Hors périmètre") pour documenter ce nouveau comportement avant
      archivage de ce change.
