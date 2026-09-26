import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { validerUser } from "../api/endpoints/users";
import { useValiderUser } from "./useValiderUser";

vi.mock("../api/endpoints/users", () => ({
  validerUser: vi.fn(),
}));

const validated: UserResponse = {
  id: "u1",
  email: "u1@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.ADORATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

function buildWrapper(queryClient: QueryClient) {
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}

describe("hooks/useValiderUser (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appelle validerUser(id), invalide ['users'] et affiche un toast de succès", async () => {
    vi.mocked(validerUser).mockResolvedValueOnce(validated);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useValiderUser(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate("u1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(validerUser).toHaveBeenCalledWith("u1", expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Compte validé.");
  });

  it("affiche un toast d'erreur avec le message de l'ApiError quand validerUser échoue", async () => {
    vi.mocked(validerUser).mockRejectedValueOnce(new ApiError("FORBIDDEN", 403, "Action non autorisée"));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useValiderUser(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate("u1");
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Action non autorisée");
  });
});
