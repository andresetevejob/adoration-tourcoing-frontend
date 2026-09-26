import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import type { UpdateUserRequest, UserResponse } from "@chapelle/shared/types";
import { useToast } from "@chapelle/shared/ui";
import { updateUser } from "../api/endpoints/users";
import { useAuthStore } from "../store/authStore";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/** `dto.role` n'est jamais renseigné depuis "Mon compte" (édition de son propre rôle hors périmètre US-AUTH-07). */
export function useUpdateProfile(): UseMutationResult<UserResponse, Error, UpdateUserRequest> {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { show } = useToast();

  return useMutation<UserResponse, Error, UpdateUserRequest>({
    mutationFn: (dto) => {
      if (!user) {
        return Promise.reject(new Error("Utilisateur non authentifié"));
      }
      return updateUser(user.id, dto);
    },
    onSuccess: (response) => {
      setUser(response);
      show("Profil mis à jour avec succès.", "success");
    },
    onError: (error) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
