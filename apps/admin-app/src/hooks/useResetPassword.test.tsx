import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { resetPassword } from "../api/endpoints/auth";
import { useResetPassword } from "./useResetPassword";

vi.mock("../api/endpoints/auth", () => ({
  resetPassword: vi.fn(),
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

describe("hooks/useResetPassword (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appelle resetPassword avec le dto et n'affiche pas de toast au succès", async () => {
    vi.mocked(resetPassword).mockResolvedValueOnce(undefined);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useResetPassword(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ token: "tok-123", newPassword: "Azerty1!" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(resetPassword).toHaveBeenCalledWith({ token: "tok-123", newPassword: "Azerty1!" }, expect.anything());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("n'affiche aucun toast quand resetPassword échoue (l'erreur doit être gérée par la page appelante)", async () => {
    vi.mocked(resetPassword).mockRejectedValueOnce(new ApiError("UNAUTHORIZED", 401, "Token invalide"));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useResetPassword(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ token: "tok-invalide", newPassword: "Azerty1!" });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
