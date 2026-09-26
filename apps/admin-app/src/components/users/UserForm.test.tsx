import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserRole } from "@chapelle/shared/types";
import { UserForm } from "./UserForm";
import { MANAGEABLE_ROLE_OPTIONS } from "../../lib/manageableRoles";

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

    it("appelle onSubmit avec un CreateUserRequest valide", async () => {
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

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: "nouveau@example.com",
          password: "Password1!",
          nom: "Dupont",
          prenoms: "Jean",
          telephone: undefined,
          role: UserRole.VEILLEUR,
        });
      });
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
