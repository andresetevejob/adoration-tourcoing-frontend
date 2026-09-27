import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { StatutAnnonce } from "@chapelle/shared/types";
import { ToastProvider } from "@chapelle/shared/ui";
import { usePublishAnnonce } from "./usePublishAnnonce";

function buildWrapper(queryClient: QueryClient) {
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}

describe("hooks/usePublishAnnonce (admin-app)", () => {
  it("publie une annonce BROUILLON via POST /annonces/{id}/publier", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => usePublishAnnonce(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ id: "annonce-3", statut: StatutAnnonce.PUBLIE });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.statut).toBe(StatutAnnonce.PUBLIE);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["annonces"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Statut de l'annonce mis à jour.");
  });

  it("dépublie une annonce PUBLIE via POST /annonces/{id}/depublier", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => usePublishAnnonce(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ id: "annonce-1", statut: StatutAnnonce.DEPUBLIE });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.statut).toBe(StatutAnnonce.DEPUBLIE);
  });

  it("affiche un toast d'erreur pour un id inconnu (404 ANNONCE_NOT_FOUND)", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => usePublishAnnonce(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ id: "inconnu", statut: StatutAnnonce.PUBLIE });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Annonce introuvable.");
  });
});
