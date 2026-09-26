import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { StatutReservation, type BookingResponse, type PageResponse } from "@chapelle/shared/types";
import { listBookings } from "../api/endpoints/bookings";
import { useBookings } from "./useBookings";

vi.mock("../api/endpoints/bookings", () => ({
  listBookings: vi.fn(),
}));

const booking: BookingResponse = {
  id: "b1",
  idUtilisateur: "u1",
  creatorId: "u1",
  dateDebut: "2026-01-01T10:00:00Z",
  dateFin: "2026-01-01T11:00:00Z",
  status: StatutReservation.EFFECTUEE,
  dateCreation: "2025-12-01T00:00:00Z",
  estArchivee: false,
};

const page: PageResponse<BookingResponse> = {
  content: [booking],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  last: true,
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("hooks/useBookings (user-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appelle listBookings avec page/size par défaut et les params fournis", async () => {
    vi.mocked(listBookings).mockResolvedValueOnce(page);

    const { result } = renderHook(() => useBookings({ utilisateurId: "u1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(listBookings).toHaveBeenCalledWith({ utilisateurId: "u1", page: 0, size: 20 });
    expect(result.current.data).toBe(page);
  });
});
