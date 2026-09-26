import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import type { UserResponse } from "@chapelle/shared/types";
import { useToast } from "@chapelle/shared/ui";
import { validerUser } from "../api/endpoints/users";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/** Même invalidation par préfixe que `useCreateUser` (cf. ce fichier pour le détail). */
export function useValiderUser(): UseMutationResult<UserResponse, ApiError, string> {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<UserResponse, ApiError, string>({
    mutationFn: validerUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      show("Compte validé.", "success");
    },
    onError: (error) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
