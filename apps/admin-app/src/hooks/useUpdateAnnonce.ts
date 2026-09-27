import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import type { AnnonceCreateRequest, AnnonceResponse } from "@chapelle/shared/types";
import { useToast } from "@chapelle/shared/ui";
import { updateAnnonce } from "../api/endpoints/annonces";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/** Même invalidation par préfixe que `useCreateAnnonce` (cf. ce fichier pour le détail). */
export function useUpdateAnnonce(): UseMutationResult<
  AnnonceResponse,
  ApiError,
  { id: string; dto: Partial<AnnonceCreateRequest> }
> {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<AnnonceResponse, ApiError, { id: string; dto: Partial<AnnonceCreateRequest> }>({
    mutationFn: ({ id, dto }) => updateAnnonce(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["annonces"] });
      show("Annonce modifiée.", "success");
    },
    onError: (error) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
