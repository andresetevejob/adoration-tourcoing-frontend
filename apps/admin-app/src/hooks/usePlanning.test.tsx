import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { UserRole, type PageResponse, type PlanningEntryResponse } from "@chapelle/shared/types";
import { getPlanning } from "../api/endpoints/planning";
import { usePlanning } from "./usePlanning";

vi.mock("../api/endpoints/planning", () => ({
  getPlanning: vi.fn(),
}));

function entry(id: string): PlanningEntryResponse {
  return {
    id,
    idUtilisateur: "u1",
    nomUtilisateur: "Dupont",
    prenomsUtilisateur: "Jean",
    roleUtilisateur: UserRole.VEILLEUR,
    dateDebut: "2026-01-01T10:00:00Z",
    dateFin: "2026-01-01T11:00:00Z",
    estArchivee: false,
    estAnonymise: false,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("hooks/usePlanning (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("interroge getPlanning avec la date fournie, page 0 et DEFAULT_PAGE_SIZE", async () => {
    const page: PageResponse<PlanningEntryResponse> = {
      content: [entry("e1")],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      last: true,
    };
    vi.mocked(getPlanning).mockResolvedValueOnce(page);

    const { result } = renderHook(() => usePlanning({ date: "2026-01-01" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getPlanning).toHaveBeenCalledWith({ date: "2026-01-01", page: 0, size: 20 });
    expect(result.current.data).toBe(page);
  });

  it("interroge sans garde d'authentification (aucun `enabled` bloquant)", () => {
    vi.mocked(getPlanning).mockResolvedValueOnce({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      last: true,
    });

    renderHook(() => usePlanning({ date: "2026-01-01" }), { wrapper });

    expect(getPlanning).toHaveBeenCalledWith({ date: "2026-01-01", page: 0, size: 20 });
  });
});
