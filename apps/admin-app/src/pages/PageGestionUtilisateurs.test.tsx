import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import {
  StatutValidation,
  UserRole,
  type CreateUserRequest,
  type SpringPage,
  type UserResponse,
} from "@chapelle/shared/types";
import PageGestionUtilisateurs from "./PageGestionUtilisateurs";
import { useUsers } from "../hooks/useUsers";
import { useCreateUser } from "../hooks/useCreateUser";

vi.mock("../hooks/useUsers");
vi.mock("../hooks/useCreateUser");

interface UserTableStubProps {
  users: UserResponse[];
  isLoading: boolean;
}

vi.mock("../components/users/UserTable", () => ({
  UserTable: ({ users, isLoading }: UserTableStubProps) => (
    <div data-testid="user-table-stub">
      <span data-testid="loading">{String(isLoading)}</span>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </div>
  ),
}));

interface UserFiltersStubProps {
  onSubmit: (values: { statutValidation?: StatutValidation }) => void;
  onPendingShortcut: () => void;
}

vi.mock("../components/users/UserFilters", () => ({
  UserFilters: ({ onSubmit, onPendingShortcut }: UserFiltersStubProps) => (
    <div data-testid="user-filters-stub">
      <button
        type="button"
        onClick={() => {
          onSubmit({ statutValidation: StatutValidation.VALIDE });
        }}
      >
        soumettre-filtres
      </button>
      <button type="button" onClick={onPendingShortcut}>
        comptes-en-attente
      </button>
    </div>
  ),
}));

interface UserFormStubProps {
  mode: "create" | "edit";
  onSubmit: (dto: CreateUserRequest, photo?: File) => void;
  onCancel?: () => void;
}

const stubDto: CreateUserRequest = {
  email: "nouveau@example.com",
  password: "Password1!",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.ADORATEUR,
};
const stubPhoto = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });

vi.mock("../components/users/UserForm", () => ({
  UserForm: ({ onSubmit, onCancel }: UserFormStubProps) => (
    <div data-testid="user-form-stub">
      <button
        type="button"
        onClick={() => {
          onSubmit(stubDto);
        }}
      >
        soumettre-creation
      </button>
      <button
        type="button"
        onClick={() => {
          onSubmit({ ...stubDto, role: UserRole.VEILLEUR }, stubPhoto);
        }}
      >
        soumettre-creation-avec-photo
      </button>
      <button type="button" onClick={onCancel}>
        annuler-creation
      </button>
    </div>
  ),
}));

function user(id: string): UserResponse {
  return {
    id,
    email: `${id}@example.com`,
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.ADORATEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
  };
}

function mockUsers(page: SpringPage<UserResponse>, overrides: Partial<ReturnType<typeof useUsers>> = {}) {
  vi.mocked(useUsers).mockReturnValue({
    data: page,
    isLoading: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useUsers>);
}

function mockCreateUser(mutate = vi.fn(), isPending = false) {
  vi.mocked(useCreateUser).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useCreateUser>);
  return mutate;
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PageGestionUtilisateurs />
    </MemoryRouter>,
  );
}

const emptyPage: SpringPage<UserResponse> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 20,
  number: 0,
  numberOfElements: 0,
  first: true,
  last: true,
  empty: true,
};

describe("pages/PageGestionUtilisateurs (admin-app)", () => {
  it("affiche le titre, les filtres et le tableau des utilisateurs", () => {
    mockUsers({ ...emptyPage, content: [user("u1")], totalElements: 1, numberOfElements: 1 });
    mockCreateUser();

    renderPage();

    expect(screen.getByRole("heading", { name: "Gestion des utilisateurs" })).toBeInTheDocument();
    expect(screen.getByTestId("user-filters-stub")).toBeInTheDocument();
    expect(screen.getByTestId("user-table-stub")).toHaveTextContent("u1@example.com");
  });

  it("affiche un message d'erreur quand la requête échoue", () => {
    mockUsers(emptyPage, { isError: true, data: undefined });
    mockCreateUser();

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Impossible de charger les utilisateurs. Veuillez réessayer plus tard.",
    );
    expect(screen.queryByTestId("user-table-stub")).not.toBeInTheDocument();
  });

  it("ouvre la modale de création, soumet et appelle createUser.mutate", () => {
    mockUsers(emptyPage);
    const mutate = mockCreateUser();

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Ajouter un utilisateur" }));
    expect(screen.getByTestId("user-form-stub")).toBeInTheDocument();

    fireEvent.click(screen.getByText("soumettre-creation"));

    expect(mutate).toHaveBeenCalledWith(
      {
        dto: {
          email: "nouveau@example.com",
          password: "Password1!",
          nom: "Dupont",
          prenoms: "Jean",
          role: UserRole.ADORATEUR,
        },
        photo: undefined,
      },
      expect.anything(),
    );
  });

  it("transmet la photo à createUser.mutate quand UserForm en fournit une", () => {
    mockUsers(emptyPage);
    const mutate = mockCreateUser();

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Ajouter un utilisateur" }));
    fireEvent.click(screen.getByText("soumettre-creation-avec-photo"));

    expect(mutate).toHaveBeenCalledWith(
      {
        dto: {
          email: "nouveau@example.com",
          password: "Password1!",
          nom: "Dupont",
          prenoms: "Jean",
          role: UserRole.VEILLEUR,
        },
        photo: stubPhoto,
      },
      expect.anything(),
    );
  });

  it("ferme la modale de création au clic sur Annuler", () => {
    mockUsers(emptyPage);
    mockCreateUser();

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Ajouter un utilisateur" }));
    fireEvent.click(screen.getByText("annuler-creation"));

    expect(screen.queryByTestId("user-form-stub")).not.toBeInTheDocument();
  });

  it("interroge useUsers avec statutValidation=EN_ATTENTE après le raccourci 'Comptes en attente'", () => {
    mockUsers(emptyPage);
    mockCreateUser();

    renderPage();

    fireEvent.click(screen.getByText("comptes-en-attente"));

    expect(useUsers).toHaveBeenLastCalledWith({
      statutValidation: StatutValidation.EN_ATTENTE,
      page: 0,
      size: 20,
    });
  });

  it("interroge useUsers avec les filtres soumis", () => {
    mockUsers(emptyPage);
    mockCreateUser();

    renderPage();

    fireEvent.click(screen.getByText("soumettre-filtres"));

    expect(useUsers).toHaveBeenLastCalledWith({
      statutValidation: StatutValidation.VALIDE,
      page: 0,
      size: 20,
    });
  });
});
