import type { PlanningEntryResponse, StatutAdorationDirectResponse } from "@chapelle/shared/types";
import { ApiError } from "@chapelle/shared/api";
import { apiClient } from "../client";

/**
 * GET /adoration/en-cours — endpoint public, aucune garde d'authentification, aucun paramètre.
 * Le backend renvoie directement l'entrée (`PlanningEntryResponse`) en 200, ou une 404 (`ErrorResponse`)
 * si aucune adoration n'est en cours — on normalise ça vers la forme interne `{enCours, creneauActuel}`
 * attendue par `useStatutAdorationDirect`/`AdorationLive`.
 */
export async function getStatutAdorationDirect(): Promise<StatutAdorationDirectResponse> {
  try {
    const entry = await apiClient.get<PlanningEntryResponse>("/adoration/en-cours", undefined, {
      skipAuthRetry: true,
    });
    return {
      enCours: true,
      creneauActuel: { dateDebut: entry.dateDebut, dateFin: entry.dateFin },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { enCours: false, creneauActuel: null };
    }
    throw error;
  }
}
