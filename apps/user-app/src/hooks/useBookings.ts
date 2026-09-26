import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { BookingResponse, PageResponse } from "@chapelle/shared/types";
import { DEFAULT_PAGE_SIZE } from "@chapelle/shared/utils";
import { listBookings } from "../api/endpoints/bookings";

export interface UseBookingsParams {
  utilisateurId?: string;
  from?: string;
  to?: string;
}

/**
 * Posé par parité avec `component-methods.md` (trio `useBookings`/`useCreateBooking`/
 * `useCancelBooking` sur la base complète du swagger `/bookings`), mais n'a aucun
 * consommateur dans l'UI de U3 : le calendrier reste alimenté par `usePlanning`
 * (cf. conception U3 §4, point ouvert n°8).
 */
export function useBookings(params?: UseBookingsParams): UseQueryResult<PageResponse<BookingResponse>> {
  return useQuery({
    queryKey: ["bookings", params ?? {}],
    queryFn: () => listBookings({ ...params, page: 0, size: DEFAULT_PAGE_SIZE }),
  });
}
