import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import { useToast } from "@chapelle/shared/ui";
import { deleteAnnonce } from "../api/endpoints/annonces";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/** Même invalidation par préfixe que `useCreateAnnonce` (cf. ce fichier pour le détail). */
export function useDeleteAnnonce(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation({
    mutationFn: deleteAnnonce,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["annonces"] });
      show("Annonce supprimée.", "success");
    },
    onError: (error: ApiError) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
