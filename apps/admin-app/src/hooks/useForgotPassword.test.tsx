import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { forgotPassword } from "../api/endpoints/auth";
import { useForgotPassword } from "./useForgotPassword";

vi.mock("../api/endpoints/auth", () => ({
  forgotPassword: vi.fn(),
}));

function buildWrapper(queryClient: QueryClient) {
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}

describe("hooks/useForgotPassword (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appelle forgotPassword avec le dto et n'affiche pas de toast au succès", async () => {
    vi.mocked(forgotPassword).mockResolvedValueOnce({ message: "Email envoyé si le compte existe." });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useForgotPassword(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ email: "adorateur@example.com" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(forgotPassword).toHaveBeenCalledWith({ email: "adorateur@example.com" }, expect.anything());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("affiche un toast d'erreur avec le message de l'ApiError quand forgotPassword échoue", async () => {
    vi.mocked(forgotPassword).mockRejectedValueOnce(new ApiError("SERVER_ERROR", 500, "Erreur serveur"));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useForgotPassword(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ email: "adorateur@example.com" });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Erreur serveur");
  });

  it("affiche un toast générique quand l'erreur n'est pas une ApiError", async () => {
    vi.mocked(forgotPassword).mockRejectedValueOnce(new Error("Réseau indisponible"));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useForgotPassword(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ email: "adorateur@example.com" });
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Une erreur est survenue, veuillez réessayer.",
    );
  });
});
