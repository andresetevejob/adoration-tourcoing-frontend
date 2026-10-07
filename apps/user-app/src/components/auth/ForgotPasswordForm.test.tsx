import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

describe("components/auth/ForgotPasswordForm (user-app)", () => {
  it("affiche le champ Email et le bouton d'envoi", () => {
    render(<ForgotPasswordForm isSubmitting={false} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer le lien de réinitialisation" })).toBeInTheDocument();
  });

  it("appelle onSubmit avec le ForgotPasswordRequest quand l'email est valide", async () => {
    const onSubmit = vi.fn();
    render(<ForgotPasswordForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "adorateur@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le lien de réinitialisation" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ email: "adorateur@example.com" });
    });
  });

  it("n'appelle pas onSubmit et affiche une erreur quand l'email est malformé", async () => {
    const onSubmit = vi.fn();
    render(<ForgotPasswordForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pas-un-email" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le lien de réinitialisation" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("n'appelle pas onSubmit quand l'email est vide", async () => {
    const onSubmit = vi.fn();
    render(<ForgotPasswordForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Envoyer le lien de réinitialisation" }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("passe isSubmitting au bouton pour désactiver la double soumission", () => {
    render(<ForgotPasswordForm isSubmitting={true} onSubmit={vi.fn()} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
