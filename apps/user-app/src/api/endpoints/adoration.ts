import type { StatutAdorationDirectResponse } from "@chapelle/shared/types";
import { apiClient } from "../client";

/** GET /adoration/en-cours — endpoint public, aucune garde d'authentification, aucun paramètre. */
export function getStatutAdorationDirect(): Promise<StatutAdorationDirectResponse> {
  return apiClient.get<StatutAdorationDirectResponse>("/adoration/en-cours", undefined, {
    skipAuthRetry: true,
  });
}
