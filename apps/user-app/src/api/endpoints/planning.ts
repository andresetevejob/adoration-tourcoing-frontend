import type { PageResponse, PlanningEntryResponse } from "@chapelle/shared/types";
import { apiClient } from "../client";

export interface GetPlanningParams {
  date?: string; // yyyy-MM-dd (LocalDate) — optionnel dans le swagger, toujours fourni en pratique par usePlanning
  page?: number;
  size?: number;
}

/** GET /planning?date=&page=&size= — endpoint public, aucune garde d'authentification. */
export function getPlanning(params: GetPlanningParams): Promise<PageResponse<PlanningEntryResponse>> {
  return apiClient.get<PageResponse<PlanningEntryResponse>>("/planning", {
    date: params.date,
    page: params.page,
    size: params.size,
  });
}
