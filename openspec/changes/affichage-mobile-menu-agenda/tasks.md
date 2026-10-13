# Tasks — affichage-mobile-menu-agenda

## 1. Menu mobile (drawer)
- [ ] 1.1 `apps/user-app/src/components/layout/Navbar.tsx` : état local `isDrawerOpen`, bouton
      hamburger (icône SVG inline, visible uniquement `<768px` via classes Tailwind `md:hidden`),
      `aria-expanded`/`aria-controls`/`aria-label` dynamique.
- [ ] 1.2 Nouveau composant drawer (panneau + overlay, `role="dialog"`, `aria-modal="true"`,
      fermeture overlay/Échap/clic lien) — fichier dédié ou intégré à `Navbar.tsx` selon taille.
      Contient `SITE_LINKS` + `AuthNav` empilés verticalement.
- [ ] 1.3 Barre desktop (`≥768px`) : liens + `AuthNav` visibles comme aujourd'hui (`md:flex`),
      bouton hamburger et drawer non montés/masqués.
- [ ] 1.4 Tests `Navbar.test.tsx` : ouverture/fermeture (clic bouton, overlay, Échap, clic lien),
      attributs ARIA, liens présents dans le drawer.

## 2. Hook de détection mobile
- [ ] 2.1 `apps/user-app/src/hooks/useIsMobileViewport.ts` : `window.matchMedia("(max-width:
      767px)")`, écoute `change`, nettoyage à l'unmount.
- [ ] 2.2 Tests `useIsMobileViewport.test.ts` (mock `matchMedia`, vérifie la réactivité au
      changement simulé).

## 3. Dépendance FullCalendar
- [ ] 3.1 Ajouter `@fullcalendar/list@6.1.21` à `apps/user-app/package.json` (même version que les
      autres paquets `@fullcalendar/*` déjà installés).

## 4. Agenda — Mode Semaine mobile (`listWeek`)
- [ ] 4.1 `CalendrierReservations.tsx` : `resolveCalendarConfig` prend `isMobile` en paramètre ;
      mode "semaine" + mobile → `initialView: "listWeek"` (sinon `timeGridWeek` inchangé). Importer
      `listPlugin` depuis `@fullcalendar/list`.
- [ ] 4.2 `renderPlanningEvent.tsx` : traiter le type de vue `listWeek` (ne pas dupliquer l'heure
      déjà affichée nativement par `.fc-list-event-time`).
- [ ] 4.3 Tests : vue `fc-listWeek-view` active sous 768px, `timeGridWeek` inchangée au-dessus ;
      `renderPlanningEvent` en vue liste.

## 5. Agenda — Mode Mois mobile (grille + liste du jour)
- [ ] 5.1 `CalendrierReservations.tsx` : mode "mois" + mobile → `dateClick` (déjà
      `interactionPlugin` importé) capture le jour tapé, exposé au parent (nouvelle prop callback
      ou état local avec rendu de liste intégré au composant — à trancher en conception détaillée).
- [ ] 5.2 Liste des créneaux du jour sélectionné, sous la grille, filtrée côté client depuis
      `entries` (pas de nouvel appel réseau) — réutiliser le pattern d'affichage de
      `renderPlanningEvent`/`ReservationCard` si pertinent pour la cohérence visuelle.
- [ ] 5.3 Comportement desktop (`≥768px`) inchangé : pas de panneau de jour, `onEventClick`
      existant conservé tel quel.
- [ ] 5.4 Tests : tap sur un jour affiche la liste correcte (incluant jour vide → liste vide/
      message), comportement desktop non régressé.

## 6. Revue
- [ ] 6.1 `code-reviewer` : non-régression du mode desktop (Jour/Semaine/Mois inchangés ≥768px),
      accessibilité du drawer (focus, ARIA, Échap), pas de fuite mémoire (listener `matchMedia`
      nettoyé), cohérence visuelle avec le reste du kit UI (`Modal`, couleurs `night`/`gold`).

## 7. Spec
- [ ] 7.1 Appliquer les patches (`patches/socle-frontend/spec.md.diff`,
      `patches/consultation-planning/spec.md.diff`) aux specs vivantes avant archivage de ce
      change.

## Hors périmètre de cette implémentation (cf. proposal.md)
- `admin-app` non touché.
- Reste du site déjà conforme (audité), aucune tâche associée.
