import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { StatutValidation, UserRole, type AuthResponse } from "@chapelle/shared/types";
import { LoginForm } from "./LoginForm";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

const authResponse: AuthResponse = {
  user: {
    id: "1",
    email: "admin@example.com",
    nom: "Curé",
    prenoms: "Michel",
    role: UserRole.ADMINISTRATEUR,
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
    logout: vi.fn(),
  });
}

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
}

/** `LoginForm` rend un `<Link>` (react-router) vers "Mot de passe oublié ?" : un
 * contexte Router est désormais requis même en test isolé du composant. */
function renderLoginForm(onSuccess: ReturnType<typeof vi.fn>) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <LoginForm onSuccess={onSuccess} />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe("components/auth/LoginForm (admin-app)", () => {
  it("affiche un lien 'Mot de passe oublié ?' vers /mot-de-passe-oublie", () => {
    mockUseAuth(vi.fn());

    renderLoginForm(vi.fn());

    expect(screen.getByRole("link", { name: "Mot de passe oublié ?" })).toHaveAttribute(
      "href",
      "/mot-de-passe-oublie",
    );
  });

  it("appelle onSuccess avec la réponse quand login() réussit", async () => {
    const login = vi.fn().mockResolvedValueOnce(authResponse);
    mockUseAuth(login);
    const onSuccess = vi.fn();

    renderLoginForm(onSuccess);

    fillAndSubmit("admin@example.com", "Azerty1!");

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(authResponse);
    });
  });

  it("affiche le message fixe 'Identifiants invalides ou compte non encore validé.' sur une ApiError 401, jamais le message backend", async () => {
    const login = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("BAD_CREDENTIALS", 401, "Message backend imprévisible"));
    mockUseAuth(login);

    renderLoginForm(vi.fn());

    fillAndSubmit("admin@example.com", "Azerty1!");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Identifiants invalides ou compte non encore validé.",
    );
    expect(screen.queryByText("Message backend imprévisible")).not.toBeInTheDocument();
  });

  it("affiche un toast générique et ne redirige pas sur une erreur non-401", async () => {
    const login = vi.fn().mockRejectedValueOnce(new ApiError("SERVER_ERROR", 500, "Erreur serveur"));
    mockUseAuth(login);
    const onSuccess = vi.fn();

    renderLoginForm(onSuccess);

    fillAndSubmit("admin@example.com", "Azerty1!");

    expect(await screen.findByText("Une erreur est survenue, veuillez réessayer.")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("affiche les erreurs de validation client sans appeler login() pour un email invalide", async () => {
    const login = vi.fn();
    mockUseAuth(login);

    renderLoginForm(vi.fn());

    fillAndSubmit("pas-un-email", "Azerty1!");

    await waitFor(() => {
      expect(login).not.toHaveBeenCalled();
    });
  });
});
