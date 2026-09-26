import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { Header } from "./Header";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

const user: UserResponse = {
  id: "1",
  email: "admin@example.com",
  nom: "Curé",
  prenoms: "Michel",
  role: UserRole.SUPERADMINISTRATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

describe("components/layout/Header (admin-app)", () => {
  it("n'affiche pas le bloc utilisateur quand user est null", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);

    expect(screen.queryByText(/Déconnexion/)).not.toBeInTheDocument();
    expect(screen.getByText("Administration — Chapelle du Vœux")).toBeInTheDocument();
  });

  it("affiche prénoms/nom/rôle et déclenche logout() au clic sur Déconnexion", () => {
    const logout = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      user,
      role: UserRole.SUPERADMINISTRATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      logout,
    });

    render(<Header />);

    expect(screen.getByText("Michel Curé — Super administrateur")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Déconnexion" }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
