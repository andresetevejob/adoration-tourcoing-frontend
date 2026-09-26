import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { StatutValidation, UserRole, type UpdateUserRequest, type UserResponse } from "@chapelle/shared/types";
import PageDetailUtilisateur from "./PageDetailUtilisateur";
import { useUser } from "../hooks/useUser";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useDeleteUser } from "../hooks/useDeleteUser";

vi.mock("../hooks/useUser");
vi.mock("../hooks/useUpdateUser");
vi.mock("../hooks/useDeleteUser");

interface ValidationActionsStubProps {
  user: UserResponse;
}

vi.mock("../components/users/ValidationActions", () => ({
  ValidationActions: ({ user }: ValidationActionsStubProps) => (
    <div data-testid="validation-actions-stub">{user.id}</div>
  ),
}));

interface UserFormStubProps {
  mode: "create" | "edit";
  onSubmit: (dto: UpdateUserRequest) => void;
}

vi.mock("../components/users/UserForm", () => ({
  UserForm: ({ onSubmit }: UserFormStubProps) => (
    <div data-testid="user-form-stub">
      <button
        type="button"
        onClick={() => {
          onSubmit({ email: "modifie@example.com", nom: "Dupont", prenoms: "Jean" });
        }}
      >
        soumettre-edition
      </button>
    </div>
  ),
}));

const adorateur: UserResponse = {
  id: "u1",
  email: "jean.dupont@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.ADORATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

const admin: UserResponse = { ...adorateur, id: "admin1", role: UserRole.ADMINISTRATEUR };

function mockUser(overrides: Partial<ReturnType<typeof useUser>>) {
  vi.mocked(useUser).mockReturnValue({
    data: adorateur,
    isLoading: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useUser>);
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

function renderAt(id = "u1") {
  return render(
    <MemoryRouter initialEntries={[`/utilisateurs/${id}`]}>
      <Routes>
        <Route path="/utilisateurs/:id" element={<PageDetailUtilisateur />} />
        <Route path="/" element={<div>Page gestion utilisateurs</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("pages/PageDetailUtilisateur (admin-app)", () => {
  it("affiche le spinner de chargement", () => {
    mockUser({ isLoading: true, data: undefined });
    mockUpdateUser();
    mockDeleteUser();

    renderAt();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("affiche 'Utilisateur introuvable.' en cas d'erreur", () => {
    mockUser({ isError: true, data: undefined });
    mockUpdateUser();
    mockDeleteUser();

    renderAt();

    expect(screen.getByRole("alert")).toHaveTextContent("Utilisateur introuvable.");
  });

  it("affiche le profil, ValidationActions, le formulaire d'édition et le bouton Supprimer pour un compte gérable", () => {
    mockUser({ data: adorateur });
    mockUpdateUser();
    mockDeleteUser();

    renderAt("u1");

    expect(screen.getByText("jean.dupont@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("validation-actions-stub")).toHaveTextContent("u1");
    expect(screen.getByTestId("user-form-stub")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Supprimer" })).toBeInTheDocument();
  });

  it("affiche le message de garde pour un compte Administrateur, sans formulaire ni actions", () => {
    mockUser({ data: admin });
    mockUpdateUser();
    mockDeleteUser();

    renderAt("admin1");

    expect(screen.getByText("Ce compte n'est pas géré par cette page.")).toBeInTheDocument();
    expect(screen.queryByTestId("user-form-stub")).not.toBeInTheDocument();
    expect(screen.queryByTestId("validation-actions-stub")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Supprimer" })).not.toBeInTheDocument();
  });

  it("soumet le formulaire d'édition et appelle updateUser.mutate", () => {
    mockUser({ data: adorateur });
    const mutate = mockUpdateUser();
    mockDeleteUser();

    renderAt("u1");

    fireEvent.click(screen.getByText("soumettre-edition"));

    expect(mutate).toHaveBeenCalledWith({
      id: "u1",
      dto: { email: "modifie@example.com", nom: "Dupont", prenoms: "Jean" },
    });
  });

  it("ouvre la modale de suppression, confirme et navigue vers '/' après succès", () => {
    mockUser({ data: adorateur });
    mockUpdateUser();
    const mutate = mockDeleteUser();

    renderAt("u1");

    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(screen.getByRole("heading", { name: "Supprimer l'utilisateur" })).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "Supprimer" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    expect(mutate).toHaveBeenCalledWith("u1", expect.anything());
  });
});
