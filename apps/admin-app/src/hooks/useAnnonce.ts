import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { AnnonceResponse } from "@chapelle/shared/types";
import { getAnnonce } from "../api/endpoints/annonces";

/** Nécessaire pour `PageAnnonceEdition` (`/annonces/:id`) accédée par URL directe —
 *  même rôle que `useUser(id)` pour `PageDetailUtilisateur` (U4). */
export function useAnnonce(id: string): UseQueryResult<AnnonceResponse> {
  return useQuery({
    queryKey: ["annonces", "detail", id],
    queryFn: () => getAnnonce(id),
  });
}
