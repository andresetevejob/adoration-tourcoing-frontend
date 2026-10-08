import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import {
  nextRefetchDelayMs,
  POLLING_INTERVAL_MS,
  SAFETY_MARGIN_MS,
  useStatutAdorationDirect,
} from "./useStatutAdorationDirect";

describe("hooks/useStatutAdorationDirect — nextRefetchDelayMs (user-app)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("créneau en cours : reprogramme exactement à dateFin + marge de sécurité", () => {
    const delay = nextRefetchDelayMs("success", {
      enCours: true,
      creneauActuel: { dateDebut: "2026-01-01T09:30:00Z", dateFin: "2026-01-01T10:05:00Z" },
    });

    expect(delay).toBe(5 * 60 * 1000 + SAFETY_MARGIN_MS);
  });

  it("dateFin déjà dépassée (horloge client en retard) : clampe à 0 + marge de sécurité", () => {
    const delay = nextRefetchDelayMs("success", {
      enCours: true,
      creneauActuel: { dateDebut: "2026-01-01T09:00:00Z", dateFin: "2026-01-01T09:55:00Z" },
    });

    expect(delay).toBe(SAFETY_MARGIN_MS);
  });

  it("aucun créneau en cours : polling de repli (30s)", () => {
    expect(nextRefetchDelayMs("success", { enCours: false, creneauActuel: null })).toBe(POLLING_INTERVAL_MS);
  });

  it("erreur : polling de repli (30s), même si `data` conserve une dernière réponse réussie 'en cours'", () => {
    const delay = nextRefetchDelayMs("error", {
      enCours: true,
      creneauActuel: { dateDebut: "2026-01-01T09:30:00Z", dateFin: "2026-01-01T10:05:00Z" },
    });

    expect(delay).toBe(POLLING_INTERVAL_MS);
  });

  it("état initial (pending, pas encore de données) : polling de repli (30s)", () => {
    expect(nextRefetchDelayMs("pending", undefined)).toBe(POLLING_INTERVAL_MS);
  });
});

function buildWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
  return { wrapper, queryClient };
}

const { getStatutAdorationDirectMock } = vi.hoisted(() => ({ getStatutAdorationDirectMock: vi.fn() }));

vi.mock("../api/endpoints/adoration", () => ({
  getStatutAdorationDirect: getStatutAdorationDirectMock,
}));

describe("hooks/useStatutAdorationDirect (user-app)", () => {
  beforeEach(() => {
    getStatutAdorationDirectMock.mockReset();
  });

  it("expose enCours: false tant que la réponse n'est pas arrivée (état initial, pas de flash du message 'en cours')", () => {
    getStatutAdorationDirectMock.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useStatutAdorationDirect(), { wrapper: buildWrapper().wrapper });

    expect(result.current.enCours).toBe(false);
    expect(getStatutAdorationDirectMock).toHaveBeenCalledTimes(1);
  });

  it("passe à enCours: true quand un créneau est en cours", async () => {
    getStatutAdorationDirectMock.mockResolvedValueOnce({
      enCours: true,
      creneauActuel: { dateDebut: "2026-01-01T09:30:00Z", dateFin: "2026-01-01T10:05:00Z" },
    });

    const { result } = renderHook(() => useStatutAdorationDirect(), { wrapper: buildWrapper().wrapper });

    await waitFor(() => expect(result.current.enCours).toBe(true));
  });

  it("enCours: false quand aucun créneau n'est en cours", async () => {
    getStatutAdorationDirectMock.mockResolvedValueOnce({ enCours: false, creneauActuel: null });

    const { result } = renderHook(() => useStatutAdorationDirect(), { wrapper: buildWrapper().wrapper });

    await act(async () => {});
    expect(result.current.enCours).toBe(false);
  });

  it("traite une erreur réseau/HTTP comme enCours: false, sans planter", async () => {
    getStatutAdorationDirectMock.mockRejectedValueOnce(new Error("network"));

    const { result } = renderHook(() => useStatutAdorationDirect(), { wrapper: buildWrapper().wrapper });

    await waitFor(() => expect(getStatutAdorationDirectMock).toHaveBeenCalledTimes(1));
    expect(result.current.enCours).toBe(false);
  });

  it("repasse à enCours: false sur une erreur qui suit un succès 'en cours' (ignore la dernière réponse réussie conservée par TanStack Query)", async () => {
    getStatutAdorationDirectMock.mockResolvedValueOnce({
      enCours: true,
      creneauActuel: { dateDebut: "2026-01-01T09:30:00Z", dateFin: "2026-01-01T10:05:00Z" },
    });
    getStatutAdorationDirectMock.mockRejectedValueOnce(new Error("network"));

    const { wrapper, queryClient } = buildWrapper();
    const { result } = renderHook(() => useStatutAdorationDirect(), { wrapper });
    await waitFor(() => expect(result.current.enCours).toBe(true));

    await act(async () => {
      await queryClient.refetchQueries({ queryKey: ["adoration", "en-cours"] });
    });

    await waitFor(() => expect(result.current.enCours).toBe(false));
  });
});
