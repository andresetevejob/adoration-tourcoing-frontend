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

  it("affiche le vrai message métier backend (409 email/téléphone déjà utilisé), pas le message générique (non-régression)", async () => {
    // Forme réaliste du corps ErrorResponse backend sur un 409 doublon : pas de champ
    // `code`, le message métier est dans `message` (cf. parseErrorBody, packages/shared/src/api/client.ts).
    // `ApiError.code` est dérivé du champ `error` du corps ("Conflict" ici).
    const register = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Conflict", 409, "Cet email est déjà utilisé"));
    mockUseAuth(register);

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    expect(await screen.findByText("Cet email est déjà utilisé")).toBeInTheDocument();
    expect(screen.queryByText("Erreur inconnue")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Une erreur est survenue, veuillez réessayer."),
    ).not.toBeInTheDocument();
  });

  it("affiche le bandeau d'erreur (role=alert) au-dessus du formulaire et n'affiche aucun toast quand register() rejette avec une ApiError", async () => {
    const register = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Conflict", 409, "Cet email est déjà utilisé"));
    mockUseAuth(register);

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Cet email est déjà utilisé");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("permet de fermer le bandeau d'erreur au clic sur la croix", async () => {
    const register = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Conflict", 409, "Cet email est déjà utilisé"));
    mockUseAuth(register);

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("réinitialise le bandeau d'erreur dès le début d'une nouvelle soumission, avant le nouvel appel réseau", async () => {
    const neverResolves = new Promise<never>(() => {
      // volontairement jamais résolue : on vérifie que le bandeau disparaît
      // avant même que la 2e réponse réseau n'arrive.
    });
    const register = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Conflict", 409, "Cet email est déjà utilisé"))
      .mockReturnValueOnce(neverResolves);
    mockUseAuth(register);

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));
    await screen.findByRole("alert");

    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
    expect(register).toHaveBeenCalledTimes(2);
  });

  it("affiche un toast d'erreur (pas de bandeau) quand register() rejette avec une erreur générique non-ApiError (non-régression)", async () => {
    const register = vi.fn().mockRejectedValueOnce(new Error("Erreur réseau inattendue"));
    mockUseAuth(register);

    render(
      <ToastProvider>
        <RegisterForm onSuccess={vi.fn()} />
      </ToastProvider>,
    );

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "S'inscrire" }));

    expect(
      await screen.findByText("Une erreur est survenue, veuillez réessayer."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
