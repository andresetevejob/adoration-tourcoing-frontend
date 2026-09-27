import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ToastProvider } from "@chapelle/shared/ui";
import { useDeleteAnnonce } from "./useDeleteAnnonce";

function buildWrapper(queryClient: QueryClient) {
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}

describe("hooks/useDeleteAnnonce (admin-app)", () => {
  it("supprime l'annonce, invalide ['annonces'] et affiche un toast de succès", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteAnnonce(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate("annonce-1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["annonces"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Annonce supprimée.");
  });

  it("affiche un toast d'erreur pour un id inconnu (404 ANNONCE_NOT_FOUND)", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useDeleteAnnonce(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate("inconnu");
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Annonce introuvable.");
  });
});
