import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { updateUser } from "../api/endpoints/users";
import { useUpdateUser } from "./useUpdateUser";

vi.mock("../api/endpoints/users", () => ({
  updateUser: vi.fn(),
}));

const updated: UserResponse = {
  id: "u1",
  email: "modifie@example.com",
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

describe("hooks/useUpdateUser (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appelle updateUser(id, dto), invalide ['users'] et affiche un toast de succès", async () => {
    vi.mocked(updateUser).mockResolvedValueOnce(updated);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateUser(), { wrapper: buildWrapper(queryClient) });

    const dto = { email: "modifie@example.com", nom: "Dupont", prenoms: "Jean" };
    act(() => {
      result.current.mutate({ id: "u1", dto });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(updateUser).toHaveBeenCalledWith("u1", dto);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Utilisateur modifié.");
  });

  it("affiche un toast d'erreur avec le message de l'ApiError quand updateUser échoue", async () => {
    vi.mocked(updateUser).mockRejectedValueOnce(new ApiError("FORBIDDEN", 403, "Action non autorisée"));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useUpdateUser(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({ id: "u1", dto: { email: "modifie@example.com", nom: "Dupont", prenoms: "Jean" } });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Action non autorisée");
  });
});
