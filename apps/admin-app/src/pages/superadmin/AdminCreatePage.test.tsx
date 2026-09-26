import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { UserRole, type CreateUserRequest } from "@chapelle/shared/types";
import AdminCreatePage from "./AdminCreatePage";
import { useCreateUser } from "../../hooks/useCreateUser";
import { ADMIN_ROLE_OPTIONS } from "../../lib/adminRoles";

vi.mock("../../hooks/useCreateUser");

interface UserFormStubProps {
  mode: "create" | "edit";
  roleOptions: { value: UserRole; label: string }[];
  onSubmit: (dto: CreateUserRequest) => void;
  onCancel?: () => void;
}

vi.mock("../../components/users/UserForm", () => ({
  UserForm: ({ roleOptions, onSubmit, onCancel }: UserFormStubProps) => (
    <div data-testid="user-form-stub">
      <span data-testid="role-options">{JSON.stringify(roleOptions)}</span>
      <button
        type="button"
        onClick={() => {
          onSubmit({
            email: "nouvel-admin@example.com",
            password: "Password1!",
            nom: "Dupont",
            prenoms: "Jean",
            role: UserRole.ADMINISTRATEUR,
          });
        }}
      >
        soumettre-creation
      </button>
      <button type="button" onClick={onCancel}>
        annuler-creation
      </button>
    </div>
  ),
}));

function mockCreateUser(isPending = false, invokeOnSuccess = false) {
  const mutate = vi.fn(
    (_dto: CreateUserRequest, options?: { onSuccess?: () => void }) => {
      if (invokeOnSuccess) {
        options?.onSuccess?.();
      }
    },
  );
  vi.mocked(useCreateUser).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useCreateUser>);
  return mutate;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/administrateurs/nouveau"]}>
      <Routes>
        <Route path="/administrateurs/nouveau" element={<AdminCreatePage />} />
        <Route path="/administrateurs" element={<div>Liste des administrateurs</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("pages/superadmin/AdminCreatePage (admin-app)", () => {
  it("affiche le lien de retour et le formulaire de création", () => {
    mockCreateUser();

    renderPage();

    expect(screen.getByRole("link", { name: "Retour à la liste" })).toHaveAttribute(
      "href",
      "/administrateurs",
    );
    expect(screen.getByTestId("user-form-stub")).toBeInTheDocument();
  });

  it("transmet ADMIN_ROLE_OPTIONS (rôle ADMINISTRATEUR seul) à UserForm", () => {
    mockCreateUser();

    renderPage();

    expect(JSON.parse(screen.getByTestId("role-options").textContent)).toEqual(ADMIN_ROLE_OPTIONS);
  });

  it("soumet le formulaire, appelle createUser.mutate et navigue vers /administrateurs au succès", () => {
    const mutate = mockCreateUser(false, true);

    renderPage();

    fireEvent.click(screen.getByText("soumettre-creation"));

    expect(mutate).toHaveBeenCalledWith(
      {
        email: "nouvel-admin@example.com",
        password: "Password1!",
        nom: "Dupont",
        prenoms: "Jean",
        role: UserRole.ADMINISTRATEUR,
      },
      expect.anything(),
    );

    expect(screen.getByText("Liste des administrateurs")).toBeInTheDocument();
  });

  it("navigue vers /administrateurs au clic sur Annuler", () => {
    mockCreateUser();

    renderPage();

    fireEvent.click(screen.getByText("annuler-creation"));

    expect(screen.getByText("Liste des administrateurs")).toBeInTheDocument();
  });
});
