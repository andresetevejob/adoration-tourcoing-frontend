import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatutValidation } from "@chapelle/shared/types";
import { UserFilters } from "./UserFilters";

describe("components/users/UserFilters (admin-app)", () => {
  it("affiche les champs email/téléphone/nom/prénoms/statut avec les valeurs par défaut", () => {
    render(
      <UserFilters
        defaultValues={{ email: "a@b.com", statutValidation: StatutValidation.EN_ATTENTE }}
        onSubmit={vi.fn()}
        onPendingShortcut={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Email")).toHaveValue("a@b.com");
    expect(screen.getByLabelText("Téléphone")).toHaveValue("");
    expect(screen.getByLabelText("Statut")).toHaveValue(StatutValidation.EN_ATTENTE);
  });

  it("convertit les chaînes vides en undefined et appelle onSubmit à la soumission", async () => {
    const onSubmit = vi.fn();
    render(<UserFilters defaultValues={{}} onSubmit={onSubmit} onPendingShortcut={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Dupont" } });
    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: undefined,
        telephone: undefined,
        nom: "Dupont",
        prenoms: undefined,
        statutValidation: undefined,
      });
    });
  });

  it("appelle onPendingShortcut indépendamment de l'état du formulaire", () => {
    const onPendingShortcut = vi.fn();
    const onSubmit = vi.fn();
    render(<UserFilters defaultValues={{}} onSubmit={onSubmit} onPendingShortcut={onPendingShortcut} />);

    fireEvent.click(screen.getByRole("button", { name: "Comptes en attente" }));

    expect(onPendingShortcut).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
