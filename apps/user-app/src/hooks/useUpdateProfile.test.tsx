import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { useAuthStore } from "../store/authStore";
import { updateUser } from "../api/endpoints/users";
import { useUpdateProfile } from "./useUpdateProfile";

vi.mock("../api/endpoints/users", () => ({
  updateUser: vi.fn(),
}));

const user: UserResponse = {
  id: "1",
  email: "a@b.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.ADORATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}

describe("hooks/useUpdateProfile (user-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clear();
  });

  it("appelle updateUser(user.id, dto) puis synchronise le store via setUser au succès", async () => {
    useAuthStore.getState().setUser(user);
    const updated = { ...user, nom: "Martin" };
    vi.mocked(updateUser).mockResolvedValueOnce(updated);

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    act(() => {
      result.current.mutate({
        email: user.email,
        nom: "Martin",
        prenoms: user.prenoms,
        telephone: user.telephone,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(updateUser).toHaveBeenCalledWith("1", {
      email: user.email,
      nom: "Martin",
      prenoms: user.prenoms,
      telephone: user.telephone,
    });
    expect(useAuthStore.getState().user).toEqual(updated);
  });

  it("rejette sans appeler updateUser quand aucun utilisateur n'est authentifié", async () => {
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    act(() => {
      result.current.mutate({ email: "a@b.com", nom: "Dupont", prenoms: "Jean" });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("passe en erreur (isError) quand updateUser rejette avec une ApiError", async () => {
    useAuthStore.getState().setUser(user);
    vi.mocked(updateUser).mockRejectedValueOnce(new ApiError("VALIDATION_ERROR", 400, "Invalide"));

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    act(() => {
      result.current.mutate({ email: user.email, nom: user.nom, prenoms: user.prenoms });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it("affiche un toast avec le message de l'ApiError quand updateUser échoue", async () => {
    useAuthStore.getState().setUser(user);
    vi.mocked(updateUser).mockRejectedValueOnce(
      new ApiError("VALIDATION_ERROR", 400, "Téléphone invalide"),
    );

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    act(() => {
      result.current.mutate({ email: user.email, nom: user.nom, prenoms: user.prenoms });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Téléphone invalide");
  });
});
