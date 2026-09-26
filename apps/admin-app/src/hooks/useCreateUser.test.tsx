import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { createUser } from "../api/endpoints/users";
import { useCreateUser } from "./useCreateUser";

vi.mock("../api/endpoints/users", () => ({
  createUser: vi.fn(),
}));

const created: UserResponse = {
  id: "u1",
  email: "nouveau@example.com",
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

describe("hooks/useCreateUser (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appelle createUser, invalide ['users'] et affiche un toast de succès", async () => {
    vi.mocked(createUser).mockResolvedValueOnce(created);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateUser(), { wrapper: buildWrapper(queryClient) });

    const dto = {
      email: "nouveau@example.com",
      password: "Password1!",
      nom: "Dupont",
      prenoms: "Jean",
      role: UserRole.ADORATEUR,
    };
    act(() => {
      result.current.mutate(dto);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(createUser).toHaveBeenCalledWith(dto, expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Utilisateur créé.");
  });

  it("affiche un toast d'erreur avec le message de l'ApiError quand createUser échoue", async () => {
    vi.mocked(createUser).mockRejectedValueOnce(new ApiError("CONFLICT", 409, "Email déjà utilisé"));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useCreateUser(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({
        email: "nouveau@example.com",
        password: "Password1!",
        nom: "Dupont",
        prenoms: "Jean",
        role: UserRole.ADORATEUR,
      });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Email déjà utilisé");
  });
});
