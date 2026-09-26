import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { UserTable } from "./UserTable";

vi.mock("./ValidationActions", () => ({
  ValidationActions: ({ user }: { user: UserResponse }) => (
    <div data-testid={`validation-actions-${user.id}`} />
  ),
}));

function user(overrides: Partial<UserResponse>): UserResponse {
  return {
    id: "u1",
    email: "jean.dupont@example.com",
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.ADORATEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function renderTable(users: UserResponse[], isLoading = false) {
  return render(
    <MemoryRouter>
      <UserTable users={users} isLoading={isLoading} />
    </MemoryRouter>,
  );
}

describe("components/users/UserTable (admin-app)", () => {
  it("affiche le message vide quand il n'y a aucun utilisateur", () => {
    renderTable([]);

    expect(screen.getByText("Aucun utilisateur trouvé.")).toBeInTheDocument();
  });

  it("affiche le spinner de chargement quand isLoading est true", () => {
    renderTable([], true);

    expect(screen.getByRole("status", { name: "Chargement" })).toBeInTheDocument();
  });

  it("affiche une ligne par utilisateur avec le libellé de rôle, le badge de statut et le lien Voir", () => {
    renderTable([user({ id: "u1", role: UserRole.VEILLEUR, statutValidation: StatutValidation.VALIDE })]);

    expect(screen.getByText("jean.dupont@example.com")).toBeInTheDocument();
    expect(screen.getByText("Veilleur")).toBeInTheDocument();
    expect(screen.getByText("Validé")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voir" })).toHaveAttribute("href", "/utilisateurs/u1");
  });

  it("rend ValidationActions dans la ligne uniquement pour un compte EN_ATTENTE", () => {
    renderTable([
      user({ id: "u1", statutValidation: StatutValidation.EN_ATTENTE }),
      user({ id: "u2", statutValidation: StatutValidation.VALIDE }),
    ]);

    expect(screen.getByTestId("validation-actions-u1")).toBeInTheDocument();
    expect(screen.queryByTestId("validation-actions-u2")).not.toBeInTheDocument();
  });

  it("remplace la colonne Actions par renderRowActions quand elle est fournie", () => {
    render(
      <MemoryRouter>
        <UserTable
          users={[user({ id: "u1" })]}
          isLoading={false}
          renderRowActions={(u) => <button type="button">Action pour {u.id}</button>}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Action pour u1" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Voir" })).not.toBeInTheDocument();
  });
});
