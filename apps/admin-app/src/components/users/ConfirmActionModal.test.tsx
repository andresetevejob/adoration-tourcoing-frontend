import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmActionModal } from "./ConfirmActionModal";

describe("components/users/ConfirmActionModal (admin-app)", () => {
  it("n'affiche rien quand isOpen est false", () => {
    render(
      <ConfirmActionModal
        isOpen={false}
        title="Titre"
        message="Message"
        confirmLabel="Confirmer"
        isSubmitting={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("affiche le titre, le message et appelle onConfirm/onClose", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmActionModal
        isOpen
        title="Confirmer la suppression de l'utilisateur"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmVariant="danger"
        isSubmitting={false}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("heading", { name: "Confirmer la suppression de l'utilisateur" })).toBeInTheDocument();
    expect(screen.getByText("Cette action est irréversible.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("affiche isSubmitting via le bouton de confirmation en chargement", () => {
    render(
      <ConfirmActionModal
        isOpen
        title="Titre"
        message="Message"
        confirmLabel="Confirmer"
        isSubmitting
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Confirmer/ })).toBeDisabled();
  });
});
