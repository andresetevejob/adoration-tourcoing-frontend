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
      result.current.mutate({ dto });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(createUser).toHaveBeenCalledWith(dto, undefined);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Utilisateur créé.");
  });

  it("transmet la photo fournie à createUser()", async () => {
    vi.mocked(createUser).mockResolvedValueOnce(created);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useCreateUser(), { wrapper: buildWrapper(queryClient) });

    const dto = {
      email: "veilleur@example.com",
      password: "Password1!",
      nom: "Dupont",
      prenoms: "Jean",
      role: UserRole.VEILLEUR,
    };
    const photo = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    act(() => {
      result.current.mutate({ dto, photo });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(createUser).toHaveBeenCalledWith(dto, photo);
  });

  it("n'affiche aucun toast quand createUser échoue : l'erreur est exposée via le résultat de la mutation pour que l'appelant l'affiche (bandeau d'erreur)", async () => {
    vi.mocked(createUser).mockRejectedValueOnce(
      new ApiError("Conflict", 409, "Cet email est déjà utilisé"),
    );
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useCreateUser(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate({
        dto: {
          email: "nouveau@example.com",
          password: "Password1!",
          nom: "Dupont",
          prenoms: "Jean",
          role: UserRole.ADORATEUR,
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error?.message).toBe("Cet email est déjà utilisé");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("transmet l'erreur au onError fourni par l'appelant via les options de mutate()", async () => {
    vi.mocked(createUser).mockRejectedValueOnce(
      new ApiError("Conflict", 409, "Cet email est déjà utilisé"),
    );
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useCreateUser(), { wrapper: buildWrapper(queryClient) });
    const onError = vi.fn();

    act(() => {
      result.current.mutate(
        {
          dto: {
            email: "nouveau@example.com",
            password: "Password1!",
            nom: "Dupont",
            prenoms: "Jean",
            role: UserRole.ADORATEUR,
          },
        },
        { onError },
      );
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });
    expect((onError.mock.calls[0][0] as ApiError).message).toBe("Cet email est déjà utilisé");
  });
});
