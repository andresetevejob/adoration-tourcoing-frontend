# Tasks — reservation-duree-max-24h

## 1. Utilitaire partagé
- [ ] 1.1 `exceedsMaxDuration(dateDebut, dateFin, maxHeures = 24): boolean` dans
      `packages/shared/src/utils/formatters.ts` + tests unitaires (borne incluse à 24h exactement,
      juste au-dessus, cas court)

## 2. Calendrier (rejet de la sélection)
- [ ] 2.1 `selectAllow` de `apps/user-app/src/components/agenda/CalendrierReservations.tsx` : ajout
      de la condition de durée max, en plus de `start >= maintenant`
- [ ] 2.2 Même changement dans `apps/admin-app/src/components/planning/CalendrierPlanningAdmin.tsx`
- [ ] 2.3 Tests : sélection > 24h rejetée, sélection = 24h acceptée, sélection courte inchangée

## 3. Filet de sécurité (confirmation)
- [ ] 3.1 `ReservationConfirmModal` (user-app) : vérification + message d'erreur si le `slot` dépasse
      24h
- [ ] 3.2 Même changement dans `ReservationConfirmModal` (admin-app)
- [ ] 3.3 Tests associés

## 4. Bruno
- [ ] 4.1 Aucun changement d'endpoint — pas de nouvelle requête Bruno nécessaire (règle frontend
      uniquement)

## 5. Revue
- [ ] 5.1 `code-reviewer` sur l'ensemble du change
