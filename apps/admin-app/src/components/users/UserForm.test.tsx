import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserRole } from "@chapelle/shared/types";
import { UserForm } from "./UserForm";
import { MANAGEABLE_ROLE_OPTIONS } from "../../lib/manageableRoles";
import { ADMIN_ROLE_OPTIONS } from "../../lib/adminRoles";

/** `@testing-library/user-event` n'est pas une dépendance du repo : on simule la
 * sélection de fichier via `fireEvent.change` en fixant `files` directement sur
 * l'input, comme le fait déjà `input type="file"` en environnement jsdom. */
function uploadFile(input: HTMLInputElement, file: File): void {
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

describe("components/users/UserForm (admin-app)", () => {
  describe("mode create", () => {
    it("affiche email, mot de passe, nom, prénoms, téléphone et le select de rôle limité aux roleOptions", () => {
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
      expect(screen.getByLabelText("Nom")).toBeInTheDocument();
      expect(screen.getByLabelText("Prénoms")).toBeInTheDocument();
      expect(screen.getByLabelText("Téléphone")).toBeInTheDocument();

      const roleSelect = screen.getByLabelText<HTMLSelectElement>("Rôle");
      const optionLabels = Array.from(roleSelect.options).map((option) => option.text);
      expect(optionLabels).toEqual(["Adorateur", "Veilleur"]);
      expect(optionLabels).not.toContain("Administrateur");
      expect(optionLabels).not.toContain("SuperAdministrateur");
    });

    it("appelle onSubmit avec un CreateUserRequest valide (rôle Adorateur, sans photo)", async () => {
      const onSubmit = vi.fn();
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nouveau@example.com" } });
      fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "Password1!" } });
      fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
      fireEvent.change(screen.getByLabelText("Prénoms"), { target: { value: "Jean" } });
      fireEvent.click(screen.getByRole("button", { name: "Créer" }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          {
            email: "nouveau@example.com",
            password: "Password1!",
            nom: "Dupont",
            prenoms: "Jean",
            telephone: undefined,
            role: UserRole.ADORATEUR,
          },
          undefined,
        );
      });
    });

    it("n'affiche pas le champ Photo par défaut (rôle Adorateur)", () => {
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.queryByLabelText("Photo")).not.toBeInTheDocument();
    });

    it("affiche le champ Photo quand le rôle Veilleur est sélectionné", () => {
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByLabelText("Rôle"), { target: { value: UserRole.VEILLEUR } });

      expect(screen.getByLabelText("Photo")).toBeInTheDocument();
    });

    it("bloque la soumission et affiche une erreur quand le rôle Veilleur n'a pas de photo, sans appeler onSubmit", async () => {
      const onSubmit = vi.fn();
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nouveau@example.com" } });
      fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "Password1!" } });
      fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
      fireEvent.change(screen.getByLabelText("Prénoms"), { target: { value: "Jean" } });
      fireEvent.change(screen.getByLabelText("Rôle"), { target: { value: UserRole.VEILLEUR } });
      fireEvent.click(screen.getByRole("button", { name: "Créer" }));

      expect(
        await screen.findByText("La photo est obligatoire pour un compte Veilleur"),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("transmet la photo à onSubmit quand le rôle Veilleur a une photo valide", async () => {
      const onSubmit = vi.fn();
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nouveau@example.com" } });
      fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "Password1!" } });
      fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
      fireEvent.change(screen.getByLabelText("Prénoms"), { target: { value: "Jean" } });
      fireEvent.change(screen.getByLabelText("Rôle"), { target: { value: UserRole.VEILLEUR } });
      const photo = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
      uploadFile(screen.getByLabelText<HTMLInputElement>("Photo"), photo);
      fireEvent.click(screen.getByRole("button", { name: "Créer" }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
      const [dto, submittedPhoto] = onSubmit.mock.calls[0] as [Record<string, unknown>, File];
      expect(dto.role).toBe(UserRole.VEILLEUR);
      expect(submittedPhoto).toBe(photo);
    });

    it("repasser de Veilleur à Adorateur avant soumission n'envoie pas de photo (non-régression)", async () => {
      const onSubmit = vi.fn();
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nouveau@example.com" } });
      fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "Password1!" } });
      fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
      fireEvent.change(screen.getByLabelText("Prénoms"), { target: { value: "Jean" } });
      fireEvent.change(screen.getByLabelText("Rôle"), { target: { value: UserRole.VEILLEUR } });
      uploadFile(
        screen.getByLabelText<HTMLInputElement>("Photo"),
        new File(["contenu"], "photo.jpg", { type: "image/jpeg" }),
      );
      fireEvent.change(screen.getByLabelText("Rôle"), { target: { value: UserRole.ADORATEUR } });
      fireEvent.click(screen.getByRole("button", { name: "Créer" }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
      expect(onSubmit.mock.calls[0][1]).toBeUndefined();
    });

    it("n'affiche jamais le champ Photo sur l'écran de création Administrateur (roleOptions=ADMIN_ROLE_OPTIONS, jamais Veilleur)", () => {
      render(
        <UserForm
          mode="create"
          roleOptions={ADMIN_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.queryByLabelText("Photo")).not.toBeInTheDocument();
      const roleSelect = screen.getByLabelText<HTMLSelectElement>("Rôle");
      const optionLabels = Array.from(roleSelect.options).map((option) => option.text);
      expect(optionLabels).toEqual(["Administrateur"]);
    });

    it("affiche le bandeau d'erreur quand apiErrorMessage et onDismissError sont fournis, et appelle onDismissError au clic sur la croix", () => {
      const onDismissError = vi.fn();
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          apiErrorMessage="Cet email est déjà utilisé"
          onDismissError={onDismissError}
        />,
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Cet email est déjà utilisé");

      fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
      expect(onDismissError).toHaveBeenCalledTimes(1);
    });

    it("n'affiche aucun bandeau d'erreur quand apiErrorMessage est null", () => {
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          apiErrorMessage={null}
          onDismissError={vi.fn()}
        />,
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("n'affiche aucun bandeau d'erreur quand onDismissError n'est pas fourni, même avec apiErrorMessage", () => {
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          apiErrorMessage="Cet email est déjà utilisé"
        />,
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("appelle onCancel au clic sur Annuler", () => {
      const onCancel = vi.fn();
      render(
        <UserForm
          mode="create"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          isSubmitting={false}
          onSubmit={vi.fn()}
          onCancel={onCancel}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("mode edit", () => {
    it("n'affiche pas de champ mot de passe et pré-remplit les champs, email éditable", () => {
      render(
        <UserForm
          mode="edit"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          defaultValues={{
            email: "jean.dupont@example.com",
            nom: "Dupont",
            prenoms: "Jean",
            telephone: "0612345678",
            role: UserRole.ADORATEUR,
          }}
          isSubmitting={false}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.queryByLabelText("Mot de passe")).not.toBeInTheDocument();
      const emailInput = screen.getByLabelText<HTMLInputElement>("Email");
      expect(emailInput).toHaveValue("jean.dupont@example.com");
      expect(emailInput).not.toBeDisabled();
      expect(screen.getByLabelText("Nom")).toHaveValue("Dupont");
      expect(screen.getByLabelText("Téléphone")).toHaveValue("0612345678");
      expect(screen.queryByLabelText("Photo")).not.toBeInTheDocument();
    });

    it("n'affiche jamais le champ Photo en mode edit, même pour un rôle Veilleur (hors périmètre de cette proposition)", () => {
      render(
        <UserForm
          mode="edit"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          defaultValues={{
            email: "veilleur@example.com",
            nom: "Dupont",
            prenoms: "Jean",
            role: UserRole.VEILLEUR,
          }}
          isSubmitting={false}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.queryByLabelText("Photo")).not.toBeInTheDocument();
    });

    it("appelle onSubmit avec un UpdateUserRequest valide, email modifié inclus", async () => {
      const onSubmit = vi.fn();
      render(
        <UserForm
          mode="edit"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          defaultValues={{
            email: "jean.dupont@example.com",
            nom: "Dupont",
            prenoms: "Jean",
            role: UserRole.ADORATEUR,
          }}
          isSubmitting={false}
          onSubmit={onSubmit}
        />,
      );

      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "modifie@example.com" } });
      fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: "modifie@example.com",
          nom: "Dupont",
          prenoms: "Jean",
          telephone: undefined,
          role: UserRole.ADORATEUR,
        });
      });
    });

    it("n'affiche pas de bouton Annuler quand onCancel n'est pas fourni", () => {
      render(
        <UserForm
          mode="edit"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          defaultValues={{
            email: "jean.dupont@example.com",
            nom: "Dupont",
            prenoms: "Jean",
            role: UserRole.ADORATEUR,
          }}
          isSubmitting={false}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.queryByRole("button", { name: "Annuler" })).not.toBeInTheDocument();
    });
  });
});
