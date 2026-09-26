import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import type { BookingResponse, CreateBookingRequest } from "@chapelle/shared/types";
import { useToast } from "@chapelle/shared/ui";
import { createBooking } from "../api/endpoints/bookings";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/**
 * Invalidation par préfixe (`["planning"]`/`["bookings"]`, pas la clé exacte avec la
 * date) : couvre toutes les entrées `["planning", date]` déjà en cache ainsi que
 * `["bookings", ...]`.
 */
export function useCreateBooking(): UseMutationResult<BookingResponse, ApiError, CreateBookingRequest> {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<BookingResponse, ApiError, CreateBookingRequest>({
    mutationFn: createBooking,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["planning"] });
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      show("Réservation confirmée.", "success");
    },
    onError: (error) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
