import { useQuery, type QueryStatus } from "@tanstack/react-query";
import type { StatutAdorationDirectResponse } from "@chapelle/shared/types";
import { getStatutAdorationDirect } from "../api/endpoints/adoration";

export const POLLING_INTERVAL_MS = 30_000;
/** Marge de sécurité ajoutée à l'échéance `dateFin` pour couvrir un décalage d'horloge client. */
export const SAFETY_MARGIN_MS = 1_000;

export interface UseStatutAdorationDirectResult {
  enCours: boolean;
}

/**
 * Délai avant le prochain appel, dérivé du dernier statut connu de la requête : pas de polling à
 * intervalle fixe pendant qu'un créneau est en cours — le prochain appel est reprogrammé
 * exactement à `dateFin` (+ marge de sécurité), clampé à 0 si déjà dépassée (horloge client en
 * retard). Polling de repli (30s) sinon.
 *
 * En erreur, `status` reste `"error"` alors que `data` conserve la dernière réponse réussie
 * (comportement TanStack Query) : il faut l'ignorer explicitement pour retomber sur le polling de
 * repli, plutôt que de reprogrammer sur une `dateFin` potentiellement obsolète.
 */
export function nextRefetchDelayMs(
  status: QueryStatus,
  data: StatutAdorationDirectResponse | undefined,
): number {
  if (status === "success" && data?.enCours && data.creneauActuel) {
    const remaining = new Date(data.creneauActuel.dateFin).getTime() - Date.now();
    return Math.max(0, remaining) + SAFETY_MARGIN_MS;
  }
  return POLLING_INTERVAL_MS;
}

/**
 * Erreur réseau/HTTP → traité comme `enCours === false`, jamais d'état d'erreur visible
 * (`retry: false` hérité du `QueryClient` global, cf. `lib/queryClient.ts`).
 */
export function useStatutAdorationDirect(): UseStatutAdorationDirectResult {
  const query = useQuery({
    queryKey: ["adoration", "en-cours"],
    queryFn: getStatutAdorationDirect,
    staleTime: 0,
    refetchInterval: (query) => nextRefetchDelayMs(query.state.status, query.state.data),
  });

  return { enCours: query.status === "success" && query.data.enCours };
}
