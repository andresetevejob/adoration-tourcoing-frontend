import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import type { CreateUserRequest, UserResponse } from "@chapelle/shared/types";
import { useToast } from "@chapelle/shared/ui";
import { createUser } from "../api/endpoints/users";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

export interface CreateUserVariables {
  dto: CreateUserRequest;
  photo?: File;
}

/**
 * Invalidation par préfixe `["users"]` (pas de clé exacte, cf. conception U4 §5.3,
 * même choix que `["planning"]`/`["bookings"]` en U3) : couvre `["users", "list", ...]`
 * (`useUsers`), `["users", "detail", id]` (`useUser`) et, effet de bord bienvenu,
 * `["users", "veilleurs"]` (`useVeilleurs`, U3).
 */
export function useCreateUser(): UseMutationResult<UserResponse, ApiError, CreateUserVariables> {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<UserResponse, ApiError, CreateUserVariables>({
    mutationFn: ({ dto, photo }) => createUser(dto, photo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      show("Utilisateur créé.", "success");
    },
    onError: (error) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
