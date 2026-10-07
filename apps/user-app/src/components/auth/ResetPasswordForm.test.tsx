import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResetPasswordForm } from "./ResetPasswordForm";

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), { target: { value: "Azerty1!" } });
  fireEvent.change(screen.getByLabelText("Confirmation"), { target: { value: "Azerty1!" } });
}

describe("components/auth/ResetPasswordForm (user-app)", () => {
  it("affiche les champs Nouveau mot de passe et Confirmation, et le bouton d'envoi", () => {
    render(<ResetPasswordForm isSubmitting={false} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Nouveau mot de passe")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Réinitialiser le mot de passe" })).toBeInTheDocument();
  });

  it("appelle onSubmit avec newPassword/confirmPassword quand le formulaire est valide", async () => {
    const onSubmit = vi.fn();
    render(<ResetPasswordForm isSubmitting={false} onSubmit={onSubmit} />);

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser le mot de passe" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        newPassword: "Azerty1!",
        confirmPassword: "Azerty1!",
      });
    });
  });

  it("n'appelle pas onSubmit et affiche une erreur quand les mots de passe ne correspondent pas", async () => {
    const onSubmit = vi.fn();
    render(<ResetPasswordForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), { target: { value: "Azerty1!" } });
    fireEvent.change(screen.getByLabelText("Confirmation"), { target: { value: "Autre1!" } });
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser le mot de passe" }));

    expect(await screen.findByText("Les mots de passe ne correspondent pas")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("n'appelle pas onSubmit quand le nouveau mot de passe ne respecte pas la règle de robustesse", async () => {
    const onSubmit = vi.fn();
    render(<ResetPasswordForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), { target: { value: "faible" } });
    fireEvent.change(screen.getByLabelText("Confirmation"), { target: { value: "faible" } });
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser le mot de passe" }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("passe isSubmitting au bouton de soumission pour désactiver la double soumission", () => {
    const { container } = render(<ResetPasswordForm isSubmitting={true} onSubmit={vi.fn()} />);

    expect(container.querySelector('button[type="submit"]')).toBeDisabled();
  });
});
