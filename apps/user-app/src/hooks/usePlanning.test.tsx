import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { UserRole, type PageResponse, type PlanningEntryResponse } from "@chapelle/shared/types";
import { getPlanning, getPlanningIntervalle, getPlanningMensuel } from "../api/endpoints/planning";
import { usePlanning } from "./usePlanning";

vi.mock("../api/endpoints/planning", () => ({
  getPlanning: vi.fn(),
  getPlanningMensuel: vi.fn(),
  getPlanningIntervalle: vi.fn(),
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

function pageOf(id: string): PageResponse<PlanningEntryResponse> {
  return {
    content: [entry(id)],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
    last: true,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("hooks/usePlanning (user-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mode jour : interroge getPlanning avec la date fournie, page 0 et DEFAULT_PAGE_SIZE", async () => {
    vi.mocked(getPlanning).mockResolvedValueOnce(pageOf("e1"));

    const { result } = renderHook(() => usePlanning({ mode: "jour", date: "2026-01-01" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getPlanning).toHaveBeenCalledWith({ date: "2026-01-01", page: 0, size: 20 });
    expect(getPlanningMensuel).not.toHaveBeenCalled();
    expect(getPlanningIntervalle).not.toHaveBeenCalled();
  });

  it("mode mois : interroge getPlanningMensuel avec l'année et le mois fournis, aucun autre endpoint", async () => {
    vi.mocked(getPlanningMensuel).mockResolvedValueOnce(pageOf("e2"));

    const { result } = renderHook(() => usePlanning({ mode: "mois", annee: 2026, mois: 3 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getPlanningMensuel).toHaveBeenCalledWith({ annee: 2026, mois: 3 });
    expect(getPlanning).not.toHaveBeenCalled();
    expect(getPlanningIntervalle).not.toHaveBeenCalled();
  });

  it("mode intervalle : interroge getPlanningIntervalle avec les bornes fournies, aucun autre endpoint", async () => {
    vi.mocked(getPlanningIntervalle).mockResolvedValueOnce(pageOf("e3"));

    const { result } = renderHook(
      () => usePlanning({ mode: "intervalle", dateDebut: "2026-01-01", dateFin: "2026-01-10" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getPlanningIntervalle).toHaveBeenCalledWith({ dateDebut: "2026-01-01", dateFin: "2026-01-10" });
    expect(getPlanning).not.toHaveBeenCalled();
    expect(getPlanningMensuel).not.toHaveBeenCalled();
  });

  it("mode semaine : interroge getPlanningIntervalle avec dateDebut et dateFin = dateDebut + 6 jours", async () => {
    vi.mocked(getPlanningIntervalle).mockResolvedValueOnce(pageOf("e4"));

    const { result } = renderHook(() => usePlanning({ mode: "semaine", dateDebut: "2026-01-05" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getPlanningIntervalle).toHaveBeenCalledWith({ dateDebut: "2026-01-05", dateFin: "2026-01-11" });
    expect(getPlanning).not.toHaveBeenCalled();
    expect(getPlanningMensuel).not.toHaveBeenCalled();
  });

  it("mode semaine : la dateFin calculée à cheval sur un changement de mois reste correcte", async () => {
    vi.mocked(getPlanningIntervalle).mockResolvedValueOnce(pageOf("e5"));

    const { result } = renderHook(() => usePlanning({ mode: "semaine", dateDebut: "2026-01-26" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getPlanningIntervalle).toHaveBeenCalledWith({ dateDebut: "2026-01-26", dateFin: "2026-02-01" });
  });

  it("interroge sans garde d'authentification (aucun `enabled` bloquant)", () => {
    vi.mocked(getPlanning).mockResolvedValueOnce(pageOf("e1"));

    renderHook(() => usePlanning({ mode: "jour", date: "2026-01-01" }), { wrapper });

    expect(getPlanning).toHaveBeenCalledWith({ date: "2026-01-01", page: 0, size: 20 });
  });

  it("la queryKey reflète periodeCacheKey : un cache distinct par mode/période", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    function wrapperWithClient({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }
    vi.mocked(getPlanning).mockResolvedValueOnce(pageOf("e-jour"));
    vi.mocked(getPlanningMensuel).mockResolvedValueOnce(pageOf("e-mois"));

    const jourHook = renderHook(() => usePlanning({ mode: "jour", date: "2026-01-01" }), {
      wrapper: wrapperWithClient,
    });
    await waitFor(() => {
      expect(jourHook.result.current.isSuccess).toBe(true);
    });

    const moisHook = renderHook(() => usePlanning({ mode: "mois", annee: 2026, mois: 3 }), {
      wrapper: wrapperWithClient,
    });
    await waitFor(() => {
      expect(moisHook.result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData<PageResponse<PlanningEntryResponse>>(["planning", "jour:2026-01-01"])
      ?.content[0].id).toBe("e-jour");
    expect(queryClient.getQueryData<PageResponse<PlanningEntryResponse>>(["planning", "mois:2026-03"])
      ?.content[0].id).toBe("e-mois");
  });

  it("la queryKey du mode semaine est distincte de celle du mode jour pour la même date de début", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    function wrapperWithClient({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }
    vi.mocked(getPlanning).mockResolvedValueOnce(pageOf("e-jour"));
    vi.mocked(getPlanningIntervalle).mockResolvedValueOnce(pageOf("e-semaine"));

    const jourHook = renderHook(() => usePlanning({ mode: "jour", date: "2026-01-05" }), {
      wrapper: wrapperWithClient,
    });
    await waitFor(() => {
      expect(jourHook.result.current.isSuccess).toBe(true);
    });

    const semaineHook = renderHook(() => usePlanning({ mode: "semaine", dateDebut: "2026-01-05" }), {
      wrapper: wrapperWithClient,
    });
    await waitFor(() => {
      expect(semaineHook.result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData<PageResponse<PlanningEntryResponse>>(["planning", "jour:2026-01-05"])
      ?.content[0].id).toBe("e-jour");
    expect(queryClient.getQueryData<PageResponse<PlanningEntryResponse>>(["planning", "semaine:2026-01-05"])
      ?.content[0].id).toBe("e-semaine");
  });
});
