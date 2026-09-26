import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { StatutValidation, UserRole, type UpdateUserRequest, type UserResponse } from "@chapelle/shared/types";
import AdminsListPage from "./AdminsListPage";
import { useAdmins } from "../../hooks/useAdmins";
import { useUpdateUser } from "../../hooks/useUpdateUser";
import { useDeleteUser } from "../../hooks/useDeleteUser";
import { ADMIN_ROLE_OPTIONS } from "../../lib/adminRoles";

vi.mock("../../hooks/useAdmins");
vi.mock("../../hooks/useUpdateUser");
vi.mock("../../hooks/useDeleteUser");

interface UserTableStubProps {
  users: UserResponse[];
  isLoading: boolean;
  renderRowActions?: (user: UserResponse) => React.ReactNode;
}

vi.mock("../../components/users/UserTable", () => ({
  UserTable: ({ users, renderRowActions }: UserTableStubProps) => (
    <div data-testid="user-table-stub">
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.email}
            {renderRowActions?.(user)}
          </li>
        ))}
      </ul>
    </div>
  ),
}));

interface UserFormStubProps {
  mode: "create" | "edit";
  roleOptions: { value: UserRole; label: string }[];
  onSubmit: (dto: UpdateUserRequest) => void;
  onCancel?: () => void;
}

vi.mock("../../components/users/UserForm", () => ({
  UserForm: ({ roleOptions, onSubmit, onCancel }: UserFormStubProps) => (
    <div data-testid="user-form-stub">
      <span data-testid="role-options">{JSON.stringify(roleOptions)}</span>
      <button
        type="button"
        onClick={() => {
          onSubmit({ email: "modifie@example.com", nom: "Dupont", prenoms: "Jean", role: UserRole.ADMINISTRATEUR });
        }}
      >
        soumettre-edition
      </button>
      <button type="button" onClick={onCancel}>
        annuler-edition
      </button>
    </div>
  ),
}));

function admin(id: string): UserResponse {
  return {
    id,
    email: `${id}@example.com`,
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.ADMINISTRATEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
  };
}

function mockAdmins(overrides: Partial<ReturnType<typeof useAdmins>> = {}) {
  vi.mocked(useAdmins).mockReturnValue({
    data: [admin("a1")],
    isLoading: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useAdmins>);
}

function mockUpdateUser(mutate = vi.fn(), isPending = false) {
  vi.mocked(useUpdateUser).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useUpdateUser>);
  return mutate;
}

function mockDeleteUser(mutate = vi.fn(), isPending = false) {
  vi.mocked(useDeleteUser).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useDeleteUser>);
  return mutate;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/administrateurs"]}>
      <Routes>
        <Route path="/administrateurs" element={<AdminsListPage />} />
        <Route path="/administrateurs/nouveau" element={<div>Nouvel administrateur</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("pages/superadmin/AdminsListPage (admin-app)", () => {
  it("affiche le titre et le tableau des administrateurs", () => {
    mockAdmins();
    mockUpdateUser();
    mockDeleteUser();

    renderPage();

    expect(screen.getByRole("heading", { name: "Gestion des administrateurs" })).toBeInTheDocument();
    expect(screen.getByTestId("user-table-stub")).toHaveTextContent("a1@example.com");
  });

  it("affiche un message d'erreur quand la requête échoue", () => {
    mockAdmins({ isError: true, data: undefined });
    mockUpdateUser();
    mockDeleteUser();

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Impossible de charger les administrateurs. Veuillez réessayer plus tard.",
    );
    expect(screen.queryByTestId("user-table-stub")).not.toBeInTheDocument();
  });

  it("navigue vers /administrateurs/nouveau au clic sur 'Ajouter un administrateur'", () => {
    mockAdmins();
    mockUpdateUser();
    mockDeleteUser();

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Ajouter un administrateur" }));

    expect(screen.getByText("Nouvel administrateur")).toBeInTheDocument();
  });

  it("ouvre la modale d'édition, soumet et appelle updateUser.mutate", () => {
    mockAdmins();
    const mutate = mockUpdateUser();
    mockDeleteUser();

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
    expect(screen.getByRole("heading", { name: "Modifier l'administrateur" })).toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId("role-options").textContent)).toEqual(ADMIN_ROLE_OPTIONS);

    fireEvent.click(screen.getByText("soumettre-edition"));

    expect(mutate).toHaveBeenCalledWith(
      {
        id: "a1",
        dto: { email: "modifie@example.com", nom: "Dupont", prenoms: "Jean", role: UserRole.ADMINISTRATEUR },
      },
      expect.anything(),
    );
  });

  it("ferme la modale d'édition au clic sur Annuler", () => {
    mockAdmins();
    mockUpdateUser();
    mockDeleteUser();

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
    fireEvent.click(screen.getByText("annuler-edition"));

    expect(screen.queryByTestId("user-form-stub")).not.toBeInTheDocument();
  });

  it("ouvre la modale de suppression, confirme et appelle deleteUser.mutate", () => {
    mockAdmins();
    mockUpdateUser();
    const mutate = mockDeleteUser();

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(screen.getByRole("heading", { name: "Supprimer l'administrateur" })).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "Supprimer" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    expect(mutate).toHaveBeenCalledWith("a1", expect.anything());
  });
});
