import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import type { UpdateUserRequest, UserResponse } from "@chapelle/shared/types";
import { useToast } from "@chapelle/shared/ui";
import { updateUser } from "../api/endpoints/users";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/** Même invalidation par préfixe que `useCreateUser` (cf. ce fichier pour le détail). */
export function useUpdateUser(): UseMutationResult<UserResponse, ApiError, { id: string; dto: UpdateUserRequest }> {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<UserResponse, ApiError, { id: string; dto: UpdateUserRequest }>({
    mutationFn: ({ id, dto }) => updateUser(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      show("Utilisateur modifié.", "success");
    },
    onError: (error) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
