import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import type { AnnonceResponse, StatutAnnonce } from "@chapelle/shared/types";
import { useToast } from "@chapelle/shared/ui";
import { publishAnnonce } from "../api/endpoints/annonces";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/** Même invalidation par préfixe que `useCreateAnnonce` (cf. ce fichier pour le détail).
 *  `statut` attendu ∈ {PUBLIE, DEPUBLIE} uniquement, imposé par les call sites
 *  (`AnnonceList`), pas par une validation locale au hook. */
export function usePublishAnnonce(): UseMutationResult<AnnonceResponse, ApiError, { id: string; statut: StatutAnnonce }> {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<AnnonceResponse, ApiError, { id: string; statut: StatutAnnonce }>({
    mutationFn: ({ id, statut }) => publishAnnonce(id, statut),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["annonces"] });
      show("Statut de l'annonce mis à jour.", "success");
    },
    onError: (error) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
