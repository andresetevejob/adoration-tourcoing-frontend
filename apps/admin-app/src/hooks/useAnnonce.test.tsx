import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "@chapelle/shared/api";
import { useAnnonce } from "./useAnnonce";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("hooks/useAnnonce (admin-app)", () => {
  it("retourne l'annonce correspondant à l'id", async () => {
    const { result } = renderHook(() => useAnnonce("annonce-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.id).toBe("annonce-1");
  });

  it("passe en erreur (ApiError ANNONCE_NOT_FOUND) pour un id inconnu", async () => {
    const { result } = renderHook(() => useAnnonce("inconnu"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect((result.current.error as ApiError).code).toBe("ANNONCE_NOT_FOUND");
  });
});
