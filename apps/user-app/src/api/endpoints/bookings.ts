import type { BookingResponse, CreateBookingRequest, PageResponse } from "@chapelle/shared/types";
import { apiClient } from "../client";

export interface GetMyBookingsParams {
  utilisateurId: string;
  page?: number;
  size?: number;
}

export function getMyBookings(params: GetMyBookingsParams): Promise<PageResponse<BookingResponse>> {
  return apiClient.get<PageResponse<BookingResponse>>("/bookings", {
    utilisateurId: params.utilisateurId,
    page: params.page,
    size: params.size,
  });
}

export interface ListBookingsParams {
  utilisateurId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export function listBookings(params: ListBookingsParams): Promise<PageResponse<BookingResponse>> {
  return apiClient.get<PageResponse<BookingResponse>>("/bookings", {
    utilisateurId: params.utilisateurId,
    from: params.from,
    to: params.to,
    page: params.page,
    size: params.size,
  });
}

/**
 * `skipForbiddenRedirect: true` (cf. `packages/shared/src/api/client.ts`) : un refus
 * métier scoped à cette réservation (chevauchement, droit insuffisant) ne doit jamais
 * rediriger toute l'application vers `/non-autorise` — seul le toast d'erreur générique
 * de `useCreateBooking` doit s'afficher, quel que soit le code HTTP réel renvoyé.
 */
export function createBooking(dto: CreateBookingRequest): Promise<BookingResponse> {
  return apiClient.post<BookingResponse>("/bookings", dto, { skipForbiddenRedirect: true });
}

/** Même raisonnement que `createBooking` : un délai d'annulation dépassé ne doit pas
 * rediriger toute l'application vers `/non-autorise`. */
export function cancelBooking(id: string): Promise<void> {
  return apiClient.delete(`/bookings/${id}`, { skipForbiddenRedirect: true });
}
