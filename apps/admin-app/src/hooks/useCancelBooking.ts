import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import { useToast } from "@chapelle/shared/ui";
import { cancelBooking } from "../api/endpoints/bookings";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/** Même invalidation par préfixe que `useCreateBooking` (cf. ce fichier pour le détail). */
export function useCancelBooking(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  const { show } = useToast();

  // Pas de generics explicites sur cet appel (`TData` inféré `void` depuis `cancelBooking`) :
  // `@typescript-eslint/no-invalid-void-type` interdit `void` comme argument de type
  // explicite d'un appel de fonction (contrairement à une annotation de type comme le
  // type de retour ci-dessus). `TError` est inféré `ApiError` depuis l'annotation du
  // paramètre de `onError`.
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["planning"] });
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      show("Réservation annulée.", "success");
    },
    onError: (error: ApiError) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
