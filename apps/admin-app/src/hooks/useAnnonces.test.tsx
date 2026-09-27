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
 * Pas de `vi.mock("../api/endpoints/annonces")` ici (contrairement à `useUsers`, U4) :
 * `apiClient` réel, intercepté par le serveur MSW global (cf. conception U6 §5.2).
 */
describe("hooks/useAnnonces (admin-app)", () => {
  it("retourne toutes les annonces (tous statuts confondus) sans filtre", async () => {
    const { result } = renderHook(() => useAnnonces(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.length).toBe(4);
    expect(result.current.data?.some((annonce) => annonce.statut === StatutAnnonce.BROUILLON)).toBe(true);
  });

  it("filtre par statut quand fourni", async () => {
    const { result } = renderHook(() => useAnnonces({ statut: StatutAnnonce.DEPUBLIE }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.every((annonce) => annonce.statut === StatutAnnonce.DEPUBLIE)).toBe(true);
  });
});
