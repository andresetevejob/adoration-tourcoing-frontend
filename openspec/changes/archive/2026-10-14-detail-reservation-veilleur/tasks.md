# Tasks — detail-reservation-veilleur

## 1. Conception détaillée (api-architect)
- [x] 1.1 Confirmer la forme de `ReservationDetailModal` (props, réutilisation de `ReservationCard`
      étendu avec une prop photo optionnelle) et son articulation avec `ReservationConfirmModal`
      dans `PageAgenda.tsx` (deux modales distinctes possibles simultanément : détail d'un côté,
      confirmation de création/annulation de l'autre — s'assurer qu'un seul état visible à la fois)
      — voir `design.md` §1-2.
- [x] 1.2 Confirmer la portée exacte des sélecteurs CSS à ajouter dans
      `fullcalendar-overrides.css` (vues desktop `.fc-timeGridDay-view`/`.fc-timeGridWeek-view` et
      mobile `.fc-listWeek-view`, scope `user-app` uniquement) — voir `design.md` §4.
- [x] 1.3 Confirmer la forme de `useUserPhoto`/`getUserPhoto` côté user-app (duplication du code
      admin-app, pas de package partagé pour ce hook — cohérent avec le reste du projet) — voir
      `design.md` §3.

## 2. Implémentation (api-developer)
- [x] 2.1 `packages/shared/src/ui/fullcalendar-overrides.css` : étendre le cadre doré (déjà
      existant en vue Mois) aux vues Jour/Semaine (desktop + mobile), scope user-app uniquement
      (cf. design.md §4.3 : touche en réalité aussi `CalendrierReservations.tsx`, classe marqueur
      `.user-agenda-calendar`)
- [x] 2.2 `apps/user-app/src/api/endpoints/users.ts` : `getUserPhoto(id)`
- [x] 2.3 `apps/user-app/src/hooks/useUserPhoto.ts` (nouveau, miroir de la version admin-app)
- [x] 2.4 `apps/user-app/src/components/agenda/ReservationCard.tsx` : prop `photoUrl` optionnelle,
      affichage conditionnel (miniature circulaire, même style que `UserProfile.tsx` admin-app)
- [x] 2.5 `apps/user-app/src/components/agenda/ReservationConfirmModal.tsx` (variant `cancel`) :
      récupère et passe la photo du bénéficiaire (soi-même) à `ReservationCard`
- [x] 2.6 `apps/user-app/src/components/agenda/ReservationDetailModal.tsx` (nouveau) : modale
      lecture seule (dates, bénéficiaire, photo, description), aucune action
- [x] 2.7 `apps/user-app/src/pages/PageAgenda.tsx` : `onEventClick` déclenché pour toute réservation
      (plus seulement `isMine`) ; ouvre `ReservationConfirmModal` (cancel) si `isMine`,
      `ReservationDetailModal` sinon

## 3. Tests (test-engineer)
- [x] 3.1 `getUserPhoto`/`useUserPhoto` (user-app) : même couverture que l'équivalent admin-app
      (cache du `Blob`, création/révocation de l'URL objet, dégradation silencieuse sur erreur)
- [x] 3.2 `ReservationCard` : rendu avec/sans photo
- [x] 3.3 `ReservationConfirmModal` (cancel) : photo du bénéficiaire affichée quand disponible, pas
      de régression si absente/en erreur
- [x] 3.4 `ReservationDetailModal` : rendu des champs, absence d'action, dégradation silencieuse si
      la photo échoue
- [x] 3.5 `PageAgenda` : clic sur une réservation d'un autre Veilleur ouvre la modale de détail ;
      clic sur sa propre réservation ouvre toujours la modale d'annulation (non régressé) ; clic
      sans effet pour Adorateur/visiteur non connecté (non régressé)
- [x] 3.6 Non-régression visuelle CSS : vérifier que les sélecteurs de vue ciblés correspondent à
      ceux posés par FullCalendar (même méthode que les tests existants vérifiant
      `.fc-view.fc-dayGridMonth-view`)

## 4. Bruno (bruno-developer)
- [ ] 4.1 N/A — aucun nouvel endpoint backend créé dans ce repo (`GET /users/{id}/photo` déjà
      existant et déjà couvert côté admin-app)

## 5. Revue (code-reviewer)
- [x] 5.1 Revue correction/sécurité/conventions sur l'ensemble des fichiers listés dans
      `proposal.md`, attention particulière à la gestion d'erreur sur `getUserPhoto` (pas de fuite
      d'erreur technique à l'utilisateur en cas de 403/404) — 0 finding bloquant/important/mineur,
      les 5 points d'attention (skipForbiddenRedirect, portée anonymisation, scope CSS admin-app,
      collisions de modales, révocation URL objet) tous vérifiés conformes dans le code livré

## 6. Vérification manuelle (avant graduation)
- [x] 6.1 Confirmer auprès du backend si `GET /users/{id}/photo` autorise un Veilleur à consulter la
      photo d'un autre Veilleur (cf. "Point de vigilance backend" de `proposal.md`) ; documenter le
      résultat réel (photo visible ou non pour les réservations des autres) dans la spec graduée —
      **non confirmé** au jour de la graduation (2026-10-14) ; documenté comme limitation connue
      dans `gestion-utilisateurs/spec.md` plutôt que de bloquer la fonctionnalité (nom + cadre
      visuel livrés dans tous les cas, cf. `proposal.md`).

## 7. Graduation
- [x] 7.1 Mettre à jour `openspec/specs/consultation-planning/spec.md` (extension du cadre doré)
- [x] 7.2 Mettre à jour `openspec/specs/reservation-adoration/spec.md` (nouvelle section modale de
      détail + documentation du comportement d'anonymisation du titre vs. révélation en détail)
- [x] 7.3 Mettre à jour `openspec/specs/gestion-utilisateurs/spec.md` (photo désormais aussi
      affichée côté user-app, avec le résultat de la vérification 6.1)
- [x] 7.4 Archiver vers `openspec/changes/archive/2026-10-14-detail-reservation-veilleur/`
