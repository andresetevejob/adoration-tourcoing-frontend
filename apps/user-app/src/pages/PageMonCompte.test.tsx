import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import PageMonCompte from "./PageMonCompte";
import { useAuth } from "../hooks/useAuth";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useMyBookings } from "../hooks/useMyBookings";

vi.mock("../hooks/useAuth");
vi.mock("../hooks/useUpdateProfile");
vi.mock("../hooks/useMyBookings");

const adorateur: UserResponse = {
  id: "1",
  email: "adorateur@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.ADORATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

const veilleur: UserResponse = { ...adorateur, id: "2", role: UserRole.VEILLEUR };

function mockUpdateProfile(mutate = vi.fn()) {
  vi.mocked(useUpdateProfile).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProfile>);
  return mutate;
}

function mockMyBookings() {
  vi.mocked(useMyBookings).mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useMyBookings>);
}

describe("pages/PageMonCompte (user-app)", () => {
  it("ne rend rien (null) quand user est null", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    mockUpdateProfile();
    mockMyBookings();

    const { container } = render(<PageMonCompte />);

    expect(container).toBeEmptyDOMElement();
  });

  it("affiche ProfileCard/ProfileEditForm mais pas la section réservations pour un ADORATEUR", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: adorateur,
      role: UserRole.ADORATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    mockUpdateProfile();
    mockMyBookings();

    render(<PageMonCompte />);

    expect(screen.getByRole("heading", { name: "Mon compte" })).toBeInTheDocument();
    expect(screen.getByText("Mes informations")).toBeInTheDocument();
    expect(screen.getByText("Modifier mes informations")).toBeInTheDocument();
    expect(screen.queryByText("Mes réservations")).not.toBeInTheDocument();
  });

  it("affiche la section réservations pour un VEILLEUR et appelle updateProfile.mutate au submit", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: veilleur,
      role: UserRole.VEILLEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    const mutate = mockUpdateProfile();
    mockMyBookings();

    render(<PageMonCompte />);

    expect(screen.getByText("Mes réservations")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Enregistrer/ }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1);
    });
    expect(mutate).toHaveBeenCalledWith({
      email: veilleur.email,
      nom: veilleur.nom,
      prenoms: veilleur.prenoms,
      telephone: "",
    });
  });
});
