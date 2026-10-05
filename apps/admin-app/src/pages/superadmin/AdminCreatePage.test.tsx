import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { ApiError } from "@chapelle/shared/api";
import { UserRole, type CreateUserRequest } from "@chapelle/shared/types";
import AdminCreatePage from "./AdminCreatePage";
import { useCreateUser } from "../../hooks/useCreateUser";
import { ADMIN_ROLE_OPTIONS } from "../../lib/adminRoles";

vi.mock("../../hooks/useCreateUser");

interface UserFormStubProps {
  mode: "create" | "edit";
  roleOptions: { value: UserRole; label: string }[];
  onSubmit: (dto: CreateUserRequest, photo?: File) => void;
  onCancel?: () => void;
  apiErrorMessage?: string | null;
  onDismissError?: () => void;
}

vi.mock("../../components/users/UserForm", () => ({
  UserForm: ({ roleOptions, onSubmit, onCancel, apiErrorMessage, onDismissError }: UserFormStubProps) => (
    <div data-testid="user-form-stub">
      <span data-testid="role-options">{JSON.stringify(roleOptions)}</span>
      {apiErrorMessage && onDismissError && (
        <div role="alert">
          {apiErrorMessage}
          <button type="button" onClick={onDismissError}>
            fermer-erreur-creation
          </button>
        </div>
      )}
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
    (
      _variables: { dto: CreateUserRequest; photo?: File },
      options?: { onSuccess?: () => void; onError?: (error: ApiError) => void },
    ) => {
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
        dto: {
          email: "nouvel-admin@example.com",
          password: "Password1!",
          nom: "Dupont",
          prenoms: "Jean",
          role: UserRole.ADMINISTRATEUR,
        },
        photo: undefined,
      },
      expect.anything(),
    );

    expect(screen.getByText("Liste des administrateurs")).toBeInTheDocument();
  });

  it("transmet le message d'erreur à UserForm quand createUser.mutate échoue avec une ApiError 409", () => {
    const mutate = vi.fn(
      (
        _variables: { dto: CreateUserRequest; photo?: File },
        options?: { onError?: (error: ApiError) => void },
      ) => {
        options?.onError?.(new ApiError("Conflict", 409, "Cet email est déjà utilisé"));
      },
    );
    vi.mocked(useCreateUser).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateUser>);

    renderPage();

    fireEvent.click(screen.getByText("soumettre-creation"));

    expect(screen.getByRole("alert")).toHaveTextContent("Cet email est déjà utilisé");
  });

  it("réinitialise l'erreur de création au clic sur la croix du bandeau", () => {
    const mutate = vi.fn(
      (
        _variables: { dto: CreateUserRequest; photo?: File },
        options?: { onError?: (error: ApiError) => void },
      ) => {
        options?.onError?.(new ApiError("Conflict", 409, "Cet email est déjà utilisé"));
      },
    );
    vi.mocked(useCreateUser).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateUser>);

    renderPage();

    fireEvent.click(screen.getByText("soumettre-creation"));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.click(screen.getByText("fermer-erreur-creation"));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("navigue vers /administrateurs au clic sur Annuler", () => {
    mockCreateUser();

    renderPage();

    fireEvent.click(screen.getByText("annuler-creation"));

    expect(screen.getByText("Liste des administrateurs")).toBeInTheDocument();
  });
});
