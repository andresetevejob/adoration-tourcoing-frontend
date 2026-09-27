import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import type { AnnonceCreateRequest, AnnonceResponse } from "@chapelle/shared/types";
import { useToast } from "@chapelle/shared/ui";
import { createAnnonce } from "../api/endpoints/annonces";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/** Invalidation par préfixe `["annonces"]`, même patron que `["users"]` (U4). */
export function useCreateAnnonce(): UseMutationResult<AnnonceResponse, ApiError, AnnonceCreateRequest> {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<AnnonceResponse, ApiError, AnnonceCreateRequest>({
    mutationFn: createAnnonce,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["annonces"] });
      show("Annonce créée.", "success");
    },
    onError: (error) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
