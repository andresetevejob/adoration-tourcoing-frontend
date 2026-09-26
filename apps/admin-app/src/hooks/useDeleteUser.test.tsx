import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { deleteUser } from "../api/endpoints/users";
import { useDeleteUser } from "./useDeleteUser";

vi.mock("../api/endpoints/users", () => ({
  deleteUser: vi.fn(),
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

describe("hooks/useDeleteUser (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appelle deleteUser(id), invalide ['users'] et affiche un toast de succès", async () => {
    vi.mocked(deleteUser).mockResolvedValueOnce(undefined);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteUser(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate("u1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(deleteUser).toHaveBeenCalledWith("u1", expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Utilisateur supprimé.");
  });

  it("affiche un toast d'erreur avec le message de l'ApiError quand deleteUser échoue", async () => {
    vi.mocked(deleteUser).mockRejectedValueOnce(new ApiError("FORBIDDEN", 403, "Action non autorisée"));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useDeleteUser(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate("u1");
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Action non autorisée");
  });
});
