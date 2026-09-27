import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { StatutAnnonce } from "@chapelle/shared/types";
import { useAnnonces } from "./useAnnonces";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/**
 * Pas de `vi.mock("../api/endpoints/annonces")` ici (contrairement à `useUsers`,
 * U4) : `apiClient` réel, intercepté par le serveur MSW global (`vitest.setup.ts`,
 * cf. conception U6 §5.2) — vérifie le contrat HTTP simulé de bout en bout.
 */
describe("hooks/useAnnonces (user-app)", () => {
  it("retourne les annonces filtrées par statut PUBLIE", async () => {
    const { result } = renderHook(() => useAnnonces({ statut: StatutAnnonce.PUBLIE }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.every((annonce) => annonce.statut === StatutAnnonce.PUBLIE)).toBe(true);
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it("retourne toutes les annonces sans filtre", async () => {
    const { result } = renderHook(() => useAnnonces(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.length).toBe(4);
  });
});
