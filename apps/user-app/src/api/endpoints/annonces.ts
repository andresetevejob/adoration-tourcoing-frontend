import type { AnnonceResponse, StatutAnnonce } from "@chapelle/shared/types";
import { apiClient } from "../client";

export interface ListAnnoncesParams {
  statut?: StatutAnnonce;
}

/** GET /annonces?statut= — endpoint public, aucune garde d'authentification (US-ANNONCES-01,
 *  persona Anonyme inclus), même absence de garde que `getPlanning` (U2). */
export function listAnnonces(params: ListAnnoncesParams): Promise<AnnonceResponse[]> {
  return apiClient.get<AnnonceResponse[]>(
    "/annonces",
    { statut: params.statut },
    { skipAuthRetry: true },
  );
}
