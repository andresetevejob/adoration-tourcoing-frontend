import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import { useToast } from "@chapelle/shared/ui";
import { deleteUser } from "../api/endpoints/users";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/** Même invalidation par préfixe que `useCreateUser` (cf. ce fichier pour le détail). */
export function useDeleteUser(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  const { show } = useToast();

  // Pas de generics explicites sur cet appel (`TData` inféré `void` depuis `deleteUser`) :
  // même contrainte `@typescript-eslint/no-invalid-void-type` que `useCancelBooking` (U3).
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      show("Utilisateur supprimé.", "success");
    },
    onError: (error: ApiError) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
