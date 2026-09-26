import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { StatutReservation, type BookingResponse } from "@chapelle/shared/types";
import { createBooking } from "../api/endpoints/bookings";
import { useCreateBooking } from "./useCreateBooking";

vi.mock("../api/endpoints/bookings", () => ({
  createBooking: vi.fn(),
}));

const booking: BookingResponse = {
  id: "b1",
  idUtilisateur: "u1",
  creatorId: "admin1",
  dateDebut: "2026-01-01T10:00:00Z",
  dateFin: "2026-01-01T11:00:00Z",
  status: StatutReservation.EFFECTUEE,
  dateCreation: "2025-12-01T00:00:00Z",
  estArchivee: false,
};

function buildWrapper(queryClient: QueryClient) {
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}

describe("hooks/useCreateBooking (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appelle createBooking, invalide planning/bookings et affiche un toast de succès", async () => {
    vi.mocked(createBooking).mockResolvedValueOnce(booking);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateBooking(), { wrapper: buildWrapper(queryClient) });

    const dto = { idUtilisateur: "u1", dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-01T11:00:00Z" };
    act(() => {
      result.current.mutate(dto);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(createBooking).toHaveBeenCalledWith(dto, expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["planning"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["bookings"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Réservation confirmée.");
  });

  it("affiche un toast d'erreur avec le message de l'ApiError quand createBooking échoue", async () => {
    vi.mocked(createBooking).mockRejectedValueOnce(new ApiError("CONFLICT", 409, "Créneau déjà réservé"));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useCreateBooking(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-01T11:00:00Z" });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Créneau déjà réservé");
  });
});
