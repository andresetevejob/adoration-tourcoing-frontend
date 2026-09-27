import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { server } from "@chapelle/shared/mocks/server";
import { ToastProvider } from "@chapelle/shared/ui";
import { useSendContactMessage } from "./useSendContactMessage";

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
 * Pas de `vi.mock("../api/endpoints/contact")` : `apiClient` réel, intercepté par le
 * serveur MSW global (cf. conception U7 §9).
 */
describe("hooks/useSendContactMessage (user-app)", () => {
  it("envoie le message et n'affiche pas de toast au succès", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useSendContactMessage(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ nom: "Jean", email: "jean@test.fr", sujet: "info", message: "Bonjour" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toBeUndefined();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("affiche un toast d'erreur avec le message de l'ApiError quand l'envoi échoue", async () => {
    server.use(
      http.post("*/contact", () => HttpResponse.json({ code: "SERVER_ERROR", message: "Erreur serveur" }, { status: 500 })),
    );
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useSendContactMessage(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ nom: "Jean", email: "jean@test.fr", sujet: "info", message: "Bonjour" });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Erreur serveur");
  });
});
