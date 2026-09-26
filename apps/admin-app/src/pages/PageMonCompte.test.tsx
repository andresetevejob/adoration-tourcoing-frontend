import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import PageMonCompte from "./PageMonCompte";
import { useAuth } from "../hooks/useAuth";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

vi.mock("../hooks/useAuth");
vi.mock("../hooks/useUpdateProfile");

const admin: UserResponse = {
  id: "1",
  email: "admin@example.com",
  nom: "Curé",
  prenoms: "Michel",
  role: UserRole.ADMINISTRATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

function mockUpdateProfile(mutate = vi.fn()) {
  vi.mocked(useUpdateProfile).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProfile>);
  return mutate;
}

describe("pages/PageMonCompte (admin-app)", () => {
  it("ne rend rien (null) quand user est null", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockUpdateProfile();

    const { container } = render(<PageMonCompte />);

    expect(container).toBeEmptyDOMElement();
  });

  it("affiche ProfileCard/ProfileEditForm (pas de section réservations côté admin-app) et appelle updateProfile.mutate au submit", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: admin,
      role: UserRole.ADMINISTRATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    const mutate = mockUpdateProfile();

    render(<PageMonCompte />);

    expect(screen.getByRole("heading", { name: "Mon compte" })).toBeInTheDocument();
    expect(screen.getByText("Mes informations")).toBeInTheDocument();
    expect(screen.getByText("Modifier mes informations")).toBeInTheDocument();
    expect(screen.queryByText("Mes réservations")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Enregistrer/ }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1);
    });
    expect(mutate).toHaveBeenCalledWith({
      email: admin.email,
      nom: admin.nom,
      prenoms: admin.prenoms,
      telephone: "",
    });
  });
});
