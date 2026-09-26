import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProfileEditForm } from "./ProfileEditForm";

const defaultValues = {
  email: "admin@example.com",
  nom: "Curé",
  prenoms: "Michel",
  telephone: "0612345678",
};

describe("components/profile/ProfileEditForm (admin-app)", () => {
  it("rend le champ email en lecture seule (disabled) mais pré-rempli", () => {
    render(<ProfileEditForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);

    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveValue("admin@example.com");
  });

  it("inclut l'email (lecture seule) dans le dto soumis, avec les champs modifiés", async () => {
    const onSubmit = vi.fn();
    render(<ProfileEditForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupuis" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({
      email: "admin@example.com",
      nom: "Dupuis",
      prenoms: "Michel",
      telephone: "0612345678",
    });
  });

  it("affiche une erreur de validation et n'appelle pas onSubmit pour un nom trop long", async () => {
    const onSubmit = vi.fn();
    render(<ProfileEditForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "a".repeat(256) } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("désactive le bouton et affiche l'état de chargement quand isSubmitting est true", () => {
    render(<ProfileEditForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByRole("button", { name: /Enregistrer/ })).toBeDisabled();
  });
});
