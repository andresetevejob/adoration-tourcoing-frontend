import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { PageResponse, PlanningEntryResponse } from "@chapelle/shared/types";
import { DEFAULT_PAGE_SIZE } from "@chapelle/shared/utils";
import { getPlanning } from "../api/endpoints/planning";

export interface UsePlanningParams {
  date: string; // yyyy-MM-dd, requis côté hook (contrairement au paramètre optionnel du endpoint)
}

/**
 * `GET /planning` est public : aucune garde `enabled`, interrogé que l'utilisateur soit
 * connecté ou non. `staleTime` 60s (NFR performance : "mise en cache des requêtes
 * planning, staleTime 60s").
 */
export function usePlanning(params: UsePlanningParams): UseQueryResult<PageResponse<PlanningEntryResponse>> {
  return useQuery({
    queryKey: ["planning", params.date],
    queryFn: () => getPlanning({ date: params.date, page: 0, size: DEFAULT_PAGE_SIZE }),
    staleTime: 60_000,
  });
}
