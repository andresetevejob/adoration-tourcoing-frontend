import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { StatutValidation, UserRole, type AuthResponse } from "@chapelle/shared/types";
import { RegisterForm } from "./RegisterForm";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

const authResponse: AuthResponse = {
  user: {
    id: "1",
    email: "adorateur@example.com",
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.ADORATEUR,
    statutValidation: StatutValidation.EN_ATTENTE,
    dateCreation: "2026-01-01T00:00:00Z",
  },
  authenticatedAt: "2026-01-01T00:00:00Z",
};

function mockUseAuth(register: ReturnType<typeof vi.fn>) {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    role: null,
    isAuthenticated: false,
    isHydrated: true,
    login: vi.fn(),
    register,
    logout: vi.fn(),
  });
}

/** `@testing-library/user-event` n'est pas une dépendance du repo : on simule la
 * sélection de fichier via `fireEvent.change` en fixant `files` directement sur
 * l'input, comme le fait déjà `input type="file"` en environnement jsdom. */
function uploadFile(input: HTMLInputElement, file: File): void {
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "adorateur@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
  fireEvent.change(screen.getByLabelText("Prénoms"), { target: { value: "Jean" } });
  fireEvent.change(screen.getByLabelText("Téléphone"), { target: { value: "0612345678" } });
  fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "Azerty1!" } });
  fireEvent.change(screen.getByLabelText("Confirmation"), { target: { value: "Azerty1!" } });
}

describe("components/auth/RegisterForm (user-app)", () => {
  it("construit le RegisterRequest sans confirmPassword et appelle onSuccess au succès", async () => {
    const register = vi.fn().mockResolvedValueOnce(authResponse);
    mockUseAuth(register);
    const onSuccess = vi.fn();

    render(
      <ToastProvider>
        <RegisterForm onSuccess={onSuccess} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(authResponse);
    });

    expect(register).toHaveBeenCalledTimes(1);
    const dto = register.mock.calls[0][0] as Record<string, unknown>;
    expect(dto).not.toHaveProperty("confirmPassword");
    expect(dto).toEqual({
      email: "adorateur@example.com",
      password: "Azerty1!",
      nom: "Dupont",
      prenoms: "Jean",
      telephone: "0612345678",
      role: UserRole.ADORATEUR,
    });
    expect(register.mock.calls[0][1]).toBeUndefined();
  });

  it("n'affiche pas le champ Photo par défaut (rôle Adorateur)", () => {
    mockUseAuth(vi.fn());

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    expect(screen.queryByLabelText("Photo")).not.toBeInTheDocument();
  });

  it("affiche le champ Photo quand le rôle Veilleur est sélectionné", () => {
    mockUseAuth(vi.fn());

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("Je m'inscris comme"), {
      target: { value: UserRole.VEILLEUR },
    });

    expect(screen.getByLabelText("Photo")).toBeInTheDocument();
  });

  it("bloque la soumission et affiche une erreur quand le rôle Veilleur n'a pas de photo, sans appeler register()", async () => {
    const register = vi.fn();
    mockUseAuth(register);

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.change(screen.getByLabelText("Je m'inscris comme"), {
      target: { value: UserRole.VEILLEUR },
    });
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    expect(
      await screen.findByText("La photo est obligatoire pour un compte Veilleur"),
    ).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("transmet la photo à register() quand le rôle Veilleur a une photo valide", async () => {
    const register = vi.fn().mockResolvedValueOnce(authResponse);
    mockUseAuth(register);

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.change(screen.getByLabelText("Je m'inscris comme"), {
      target: { value: UserRole.VEILLEUR },
    });
    const photo = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    uploadFile(screen.getByLabelText<HTMLInputElement>("Photo"), photo);
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledTimes(1);
    });
    const dto = register.mock.calls[0][0] as Record<string, unknown>;
    expect(dto.role).toBe(UserRole.VEILLEUR);
    expect(register.mock.calls[0][1]).toBe(photo);
  });

  it("bloque la soumission côté client quand password et confirmPassword diffèrent, sans appeler register()", async () => {
    const register = vi.fn();
    mockUseAuth(register);

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.change(screen.getByLabelText("Confirmation"), { target: { value: "AutreMdp1!" } });
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    await waitFor(() => {
      expect(register).not.toHaveBeenCalled();
    });
    expect(
      await screen.findByText("Les mots de passe ne correspondent pas"),
    ).toBeInTheDocument();
  });

  it("affiche un toast d'erreur et n'appelle pas onSuccess quand register() rejette", async () => {
    const register = vi.fn().mockRejectedValueOnce(new ApiError("EMAIL_TAKEN", 409, "Email déjà utilisé"));
    mockUseAuth(register);
    const onSuccess = vi.fn();

    render(
      <ToastProvider>
        <RegisterForm onSuccess={onSuccess} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledTimes(1);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("permet de choisir le rôle VEILLEUR et le transmet dans le dto", async () => {
    const register = vi.fn().mockResolvedValueOnce(authResponse);
    mockUseAuth(register);

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.change(screen.getByLabelText("Je m'inscris comme"), {
      target: { value: UserRole.VEILLEUR },
    });
    uploadFile(
      screen.getByLabelText<HTMLInputElement>("Photo"),
      new File(["contenu"], "photo.jpg", { type: "image/jpeg" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledTimes(1);
    });
    const dto = register.mock.calls[0][0] as Record<string, unknown>;
    expect(dto.role).toBe(UserRole.VEILLEUR);
  });

  it("repasser de Veilleur à Adorateur avant soumission n'envoie pas de photo (non-régression)", async () => {
    const register = vi.fn().mockResolvedValueOnce(authResponse);
    mockUseAuth(register);

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.change(screen.getByLabelText("Je m'inscris comme"), {
      target: { value: UserRole.VEILLEUR },
    });
    uploadFile(
      screen.getByLabelText<HTMLInputElement>("Photo"),
      new File(["contenu"], "photo.jpg", { type: "image/jpeg" }),
    );
    fireEvent.change(screen.getByLabelText("Je m'inscris comme"), {
      target: { value: UserRole.ADORATEUR },
    });
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledTimes(1);
    });
    expect(register.mock.calls[0][1]).toBeUndefined();
  });
});
