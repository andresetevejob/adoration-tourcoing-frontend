import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { StatutValidation, UserRole, type AuthResponse } from "@chapelle/shared/types";
import { LoginForm } from "./LoginForm";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

const authResponse: AuthResponse = {
  user: {
    id: "1",
    email: "adorateur@example.com",
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.ADORATEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
  },
  authenticatedAt: "2026-01-01T00:00:00Z",
};

function mockUseAuth(login: ReturnType<typeof vi.fn>) {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    role: null,
    isAuthenticated: false,
    isHydrated: true,
    login,
    register: vi.fn(),
    logout: vi.fn(),
  });
}

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
}

describe("components/auth/LoginForm (user-app)", () => {
  it("appelle onSuccess avec la réponse quand login() réussit", async () => {
    const login = vi.fn().mockResolvedValueOnce(authResponse);
    mockUseAuth(login);
    const onSuccess = vi.fn();

    render(
      <ToastProvider>
        <LoginForm onSuccess={onSuccess} />
      </ToastProvider>,
    );

    fillAndSubmit("adorateur@example.com", "Azerty1!");

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(authResponse);
    });
    expect(login).toHaveBeenCalledWith({ email: "adorateur@example.com", password: "Azerty1!" });
  });

  it("affiche le message fixe 'Identifiants invalides ou compte non encore validé.' sur une ApiError 401, jamais le message backend", async () => {
    const login = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("BAD_CREDENTIALS", 401, "Message backend imprévisible"));
    mockUseAuth(login);
    const onSuccess = vi.fn();

    render(
      <ToastProvider>
        <LoginForm onSuccess={onSuccess} />
      </ToastProvider>,
    );

    fillAndSubmit("adorateur@example.com", "Azerty1!");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Identifiants invalides ou compte non encore validé.",
    );
    expect(screen.queryByText("Message backend imprévisible")).not.toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("affiche un toast générique et ne redirige pas sur une erreur non-401", async () => {
    const login = vi.fn().mockRejectedValueOnce(new ApiError("SERVER_ERROR", 500, "Erreur serveur"));
    mockUseAuth(login);
    const onSuccess = vi.fn();

    render(
      <ToastProvider>
        <LoginForm onSuccess={onSuccess} />
      </ToastProvider>,
    );

    fillAndSubmit("adorateur@example.com", "Azerty1!");

    expect(await screen.findByText("Une erreur est survenue, veuillez réessayer.")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("affiche un toast générique sur une erreur inattendue (non ApiError)", async () => {
    const login = vi.fn().mockRejectedValueOnce(new Error("Réseau indisponible"));
    mockUseAuth(login);

    render(
      <ToastProvider>
        <LoginForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillAndSubmit("adorateur@example.com", "Azerty1!");

    expect(await screen.findByText("Une erreur est survenue, veuillez réessayer.")).toBeInTheDocument();
  });

  it("affiche les erreurs de validation client sans appeler login() pour un email invalide", async () => {
    const login = vi.fn();
    mockUseAuth(login);

    render(
      <ToastProvider>
        <LoginForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillAndSubmit("pas-un-email", "Azerty1!");

    await waitFor(() => {
      expect(login).not.toHaveBeenCalled();
    });
  });
});
