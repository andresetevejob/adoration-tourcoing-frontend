import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import { useToast } from "@chapelle/shared/ui";
import { sendContactMessage, type ContactMessageDto } from "../api/endpoints/contact";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/**
 * Patron `useCreateAnnonce`/`useCreateBooking` (toast d'erreur via `ApiError`), avec deux
 * écarts assumés :
 * - pas de `useQueryClient()`/`invalidateQueries` : aucune query en cache ne dépend de
 *   `/contact` ;
 * - pas de toast de succès : la confirmation d'envoi est portée par l'état inline `sentNom`
 *   de `PageContact`, pas par une notification transitoire.
 */
export function useSendContactMessage(): UseMutationResult<void, ApiError, ContactMessageDto> {
  const { show } = useToast();

  return useMutation({
    mutationFn: sendContactMessage,
    onError: (error: ApiError) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
