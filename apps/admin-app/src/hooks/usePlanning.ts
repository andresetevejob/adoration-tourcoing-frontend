import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { PageResponse, PlanningEntryResponse } from "@chapelle/shared/types";
import { DEFAULT_PAGE_SIZE } from "@chapelle/shared/utils";
import { getPlanning, getPlanningIntervalle, getPlanningMensuel } from "../api/endpoints/planning";
import { periodeCacheKey, type PlanningPeriode } from "./planningPeriode";

export type UsePlanningParams = PlanningPeriode;

/** Dimanche (yyyy-MM-dd) de la semaine ISO commençant au lundi `dateDebut` — calcul en UTC
 *  (même pattern que `diffJoursInclusif`/`lundiDeLaSemaine` côté `@chapelle/shared`), dérivé
 *  ici uniquement au point d'appel : `PlanningPeriode["semaine"]` ne stocke jamais `dateFin`. */
function dimancheDeLaSemaine(dateDebut: string): string {
  const date = new Date(`${dateDebut}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 6);
  return date.toISOString().slice(0, 10);
}

function fetchPlanning(params: UsePlanningParams): Promise<PageResponse<PlanningEntryResponse>> {
  switch (params.mode) {
    case "jour":
      return getPlanning({ date: params.date, page: 0, size: DEFAULT_PAGE_SIZE });
    case "semaine":
      // Une semaine (7 jours) est un cas particulier d'intervalle : même endpoint, même
      // agrégation multi-pages (cf. proposal.md "agenda-planning-vue-semaine").
      return getPlanningIntervalle({
        dateDebut: params.dateDebut,
        dateFin: dimancheDeLaSemaine(params.dateDebut),
      });
    case "mois":
      return getPlanningMensuel({ annee: params.annee, mois: params.mois });
    case "intervalle":
      return getPlanningIntervalle({ dateDebut: params.dateDebut, dateFin: params.dateFin });
  }
}

/**
 * `GET /planning*` est public : aucune garde `enabled`, interrogé que l'utilisateur soit
 * connecté ou non. `staleTime` 60s (NFR performance : "mise en cache des requêtes
 * planning, staleTime 60s"). La `queryKey` reflète le mode + ses paramètres via
 * `periodeCacheKey` pour un cache TanStack Query distinct par mode/période.
 */
export function usePlanning(params: UsePlanningParams): UseQueryResult<PageResponse<PlanningEntryResponse>> {
  return useQuery({
    queryKey: ["planning", periodeCacheKey(params)],
    queryFn: () => fetchPlanning(params),
    staleTime: 60_000,
  });
}
