import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { BookingResponse } from "@chapelle/shared/types";
import { UserRole } from "@chapelle/shared/types";
import { DEFAULT_PAGE_SIZE } from "@chapelle/shared/utils";
import { getMyBookings } from "../api/endpoints/bookings";
import { useAuthStore } from "../store/authStore";

/**
 * Appel unique `size: DEFAULT_PAGE_SIZE` sans pagination UI (point ouvert n°5 de la
 * conception U1) : suffisant pour US-AUTH-08, une pagination réelle pourra être
 * ajoutée ultérieurement sans changer le contrat de `getMyBookings`.
 */
export function useMyBookings(): UseQueryResult<BookingResponse[]> {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["bookings", "me", user?.id],
    queryFn: () => {
      if (!user) {
        return Promise.reject(new Error("Utilisateur non authentifié"));
      }
      return getMyBookings({ utilisateurId: user.id, page: 0, size: DEFAULT_PAGE_SIZE });
    },
    select: (page) =>
      [...page.content].sort(
        (a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime(),
      ),
    enabled: isAuthenticated && user?.role === UserRole.VEILLEUR,
  });
}
