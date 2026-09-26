const CANCELLATION_DEADLINE_HOURS = 24;

/**
 * Règle métier US-ANNUL-02 (Veilleur uniquement) : un filet côté client, la décision
 * finale reste côté backend (`DELETE /bookings/{id}` peut malgré tout rejeter).
 * `now` est injectable pour les tests (cf. conception U3 §6.4).
 *
 * Non remontée dans `packages/shared` : l'admin-app n'a aucune contrainte de délai
 * (EF-4, annulation libre) et n'a donc aucun besoin réel de cette règle.
 */
export function canCancelBooking(dateDebut: string, now: Date = new Date()): boolean {
  return new Date(dateDebut).getTime() - now.getTime() >= CANCELLATION_DEADLINE_HOURS * 3_600_000;
}
