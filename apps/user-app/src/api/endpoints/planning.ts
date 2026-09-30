import type { PageResponse, PlanningEntryResponse } from "@chapelle/shared/types";
import { apiClient } from "../client";

export interface GetPlanningParams {
  date?: string; // yyyy-MM-dd (LocalDate) — optionnel dans le swagger, toujours fourni en pratique par usePlanning
  page?: number;
  size?: number;
}

export interface GetPlanningMensuelParams {
  annee: number;
  mois: number; // 1-12
}

export interface GetPlanningIntervalleParams {
  dateDebut: string; // yyyy-MM-dd
  dateFin: string; // yyyy-MM-dd
}

/** GET /planning?date=&page=&size= — endpoint public, aucune garde d'authentification. */
export function getPlanning(params: GetPlanningParams): Promise<PageResponse<PlanningEntryResponse>> {
  return apiClient.get<PageResponse<PlanningEntryResponse>>("/planning", {
    date: params.date,
    page: params.page,
    size: params.size,
  });
}

const PLANNING_AGGREGATE_PAGE_SIZE = 100;
const PLANNING_AGGREGATE_MAX_PAGES = 50; // garde-fou anti-boucle infinie si `last` n'est jamais vrai

/**
 * Agrège toutes les pages backend en une seule réponse : une page tronquée sur un mois/
 * intervalle serait un risque métier silencieux (créneau invisible dans le calendrier).
 */
async function fetchAllPlanningPages(
  requestPage: (page: number) => Promise<PageResponse<PlanningEntryResponse>>,
): Promise<PageResponse<PlanningEntryResponse>> {
  const content: PlanningEntryResponse[] = [];
  let page = 0;
  let last: PageResponse<PlanningEntryResponse>;
  do {
    last = await requestPage(page);
    content.push(...last.content);
    page += 1;
  } while (!last.last && page < PLANNING_AGGREGATE_MAX_PAGES);
  return {
    content,
    page: 0,
    size: content.length,
    totalElements: last.totalElements,
    totalPages: 1,
    last: true,
  };
}

/** GET /planning/mensuel?annee=&mois= — endpoint public, agrégation multi-pages côté client. */
export function getPlanningMensuel(
  params: GetPlanningMensuelParams,
): Promise<PageResponse<PlanningEntryResponse>> {
  return fetchAllPlanningPages((page) =>
    apiClient.get<PageResponse<PlanningEntryResponse>>("/planning/mensuel", {
      annee: params.annee,
      mois: params.mois,
      page,
      size: PLANNING_AGGREGATE_PAGE_SIZE,
    }),
  );
}

/** GET /planning/intervalle?dateDebut=&dateFin= — endpoint public, agrégation multi-pages côté client. */
export function getPlanningIntervalle(
  params: GetPlanningIntervalleParams,
): Promise<PageResponse<PlanningEntryResponse>> {
  return fetchAllPlanningPages((page) =>
    apiClient.get<PageResponse<PlanningEntryResponse>>("/planning/intervalle", {
      dateDebut: params.dateDebut,
      dateFin: params.dateFin,
      page,
      size: PLANNING_AGGREGATE_PAGE_SIZE,
    }),
  );
}
