import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { server } from "@chapelle/shared/mocks/server";
import { StatutAnnonce } from "@chapelle/shared/types";
import { ToastProvider } from "@chapelle/shared/ui";
import { useCreateAnnonce } from "./useCreateAnnonce";

function buildWrapper(queryClient: QueryClient) {
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}

/**
 * Pas de `vi.mock("../api/endpoints/annonces")` (contrairement à `useCreateUser`, U4) :
 * `apiClient` réel, intercepté par le serveur MSW global (cf. conception U6 §5.2).
 */
describe("hooks/useCreateAnnonce (admin-app)", () => {
  it("crée l'annonce (statut BROUILLON), invalide ['annonces'] et affiche un toast de succès", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateAnnonce(), { wrapper: buildWrapper(queryClient) });

    const dto = { titre: "Titre", contenu: "Contenu", datePublication: "2026-08-01" };
    act(() => {
      result.current.mutate(dto);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.statut).toBe(StatutAnnonce.BROUILLON);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["annonces"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Annonce créée.");
  });

  it("affiche un toast d'erreur avec le message de l'ApiError quand la création échoue", async () => {
    server.use(
      http.post("*/annonces", () => HttpResponse.json({ code: "VALIDATION_ERROR", message: "Titre requis" }, { status: 400 })),
    );
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useCreateAnnonce(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ titre: "", contenu: "Contenu", datePublication: "2026-08-01" });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Titre requis");
  });
});
