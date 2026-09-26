import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { StatutValidation, StatutReservation, UserRole, type BookingResponse, type PageResponse, type UserResponse } from "@chapelle/shared/types";
import { useAuthStore } from "../store/authStore";
import { getMyBookings } from "../api/endpoints/bookings";
import { useMyBookings } from "./useMyBookings";

vi.mock("../api/endpoints/bookings", () => ({
  getMyBookings: vi.fn(),
}));

const veilleur: UserResponse = {
  id: "u1",
  email: "v@b.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.VEILLEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

const adorateur: UserResponse = { ...veilleur, id: "u2", role: UserRole.ADORATEUR };

function booking(id: string, dateDebut: string): BookingResponse {
  return {
    id,
    idUtilisateur: veilleur.id,
    creatorId: veilleur.id,
    dateDebut,
    dateFin: dateDebut,
    status: StatutReservation.EFFECTUEE,
    dateCreation: "2025-12-01T00:00:00Z",
    estArchivee: false,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("hooks/useMyBookings (user-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clear();
  });

  it("est désactivé (enabled: false) quand l'utilisateur n'est pas authentifié", () => {
    const { result } = renderHook(() => useMyBookings(), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getMyBookings).not.toHaveBeenCalled();
  });

  it("est désactivé pour un rôle autre que VEILLEUR (ex. ADORATEUR)", () => {
    useAuthStore.getState().setUser(adorateur);
    const { result } = renderHook(() => useMyBookings(), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getMyBookings).not.toHaveBeenCalled();
  });

  it("interroge getMyBookings avec utilisateurId/page/size et trie par dateDebut croissant", async () => {
    useAuthStore.getState().setUser(veilleur);
    const page: PageResponse<BookingResponse> = {
      content: [
        booking("b2", "2026-02-01T10:00:00Z"),
        booking("b1", "2026-01-01T10:00:00Z"),
      ],
      page: 0,
      size: 20,
      totalElements: 2,
      totalPages: 1,
      last: true,
    };
    vi.mocked(getMyBookings).mockResolvedValueOnce(page);

    const { result } = renderHook(() => useMyBookings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getMyBookings).toHaveBeenCalledWith({ utilisateurId: "u1", page: 0, size: 20 });
    expect(result.current.data?.map((b) => b.id)).toEqual(["b1", "b2"]);
  });
});
