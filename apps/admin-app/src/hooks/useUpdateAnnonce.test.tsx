import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ToastProvider } from "@chapelle/shared/ui";
import { useUpdateAnnonce } from "./useUpdateAnnonce";

function buildWrapper(queryClient: QueryClient) {
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}

describe("hooks/useUpdateAnnonce (admin-app)", () => {
  it("modifie l'annonce, invalide ['annonces'] et affiche un toast de succès", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateAnnonce(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ id: "annonce-1", dto: { titre: "Titre modifié" } });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.titre).toBe("Titre modifié");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["annonces"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Annonce modifiée.");
  });

  it("affiche un toast d'erreur pour un id inconnu (404 ANNONCE_NOT_FOUND)", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useUpdateAnnonce(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ id: "inconnu", dto: { titre: "X" } });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Annonce introuvable.");
  });
});
