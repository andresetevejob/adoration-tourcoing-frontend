import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { VeilleurSelect } from "./VeilleurSelect";

function veilleur(overrides: Partial<UserResponse> = {}): UserResponse {
  return {
    id: "v1",
    email: "jean.dupont@example.com",
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.VEILLEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("components/planning/VeilleurSelect (admin-app)", () => {
  it("affiche tous les Veilleurs quand la recherche est vide", () => {
    const veilleurs = [veilleur(), veilleur({ id: "v2", nom: "Martin", prenoms: "Alice", email: "alice.martin@example.com" })];
    render(<VeilleurSelect veilleurs={veilleurs} onChange={vi.fn()} />);

    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
    expect(screen.getByText(/Alice Martin/)).toBeInTheDocument();
  });

  it("filtre la liste selon le texte saisi (nom/prénoms/email)", () => {
    const veilleurs = [veilleur(), veilleur({ id: "v2", nom: "Martin", prenoms: "Alice", email: "alice.martin@example.com" })];
    render(<VeilleurSelect veilleurs={veilleurs} onChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Rechercher un Veilleur"), { target: { value: "alice" } });

    expect(screen.queryByText(/Jean Dupont/)).not.toBeInTheDocument();
    expect(screen.getByText(/Alice Martin/)).toBeInTheDocument();
  });

  it("affiche un message quand aucun résultat ne correspond à la recherche", () => {
    render(<VeilleurSelect veilleurs={[veilleur()]} onChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Rechercher un Veilleur"), { target: { value: "zzz" } });

    expect(screen.getByText("Aucun Veilleur trouvé.")).toBeInTheDocument();
  });

  it("appelle onChange avec l'id du Veilleur cliqué et affiche le libellé sélectionné", () => {
    const onChange = vi.fn();
    const target = veilleur();
    render(<VeilleurSelect veilleurs={[target]} value={target.id} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Jean Dupont/ }));

    expect(onChange).toHaveBeenCalledWith("v1");
    expect(screen.getByText(/Sélectionné/)).toHaveTextContent("Jean Dupont");
  });

  it("affiche le message d'erreur transmis", () => {
    render(<VeilleurSelect veilleurs={[]} onChange={vi.fn()} error="Sélectionnez un Veilleur" />);

    expect(screen.getByText("Sélectionnez un Veilleur")).toBeInTheDocument();
  });
});
