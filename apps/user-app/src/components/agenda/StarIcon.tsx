/**
 * Étoile pleine (`fill="currentColor"`, hérite de la couleur de texte ambiante) : seul
 * signal visuel de "Ma réservation" sur un créneau (`renderPlanningEvent`,
 * `ListeCreneauxJour`) — remplace l'ancien badge texte, sur demande utilisateur, une fois la
 * couleur des créneaux devenue identique pour tous (cf. `fullcalendar-overrides.css`).
 * `aria-hidden` : le nom accessible est porté par le `<span>` englobant
 * (`aria-label`/`title`) chez les deux appelants, pas doublé ici.
 */
export function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6L12 2.5Z" />
    </svg>
  );
}
