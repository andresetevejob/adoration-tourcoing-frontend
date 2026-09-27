import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { AnnonceResponse, StatutAnnonce } from "@chapelle/shared/types";
import { listAnnonces } from "../api/endpoints/annonces";

export function useAnnonces(filters?: { statut?: StatutAnnonce }): UseQueryResult<AnnonceResponse[]> {
  return useQuery({
    queryKey: ["annonces", "list", filters?.statut],
    queryFn: () => listAnnonces({ statut: filters?.statut }),
  });
}
