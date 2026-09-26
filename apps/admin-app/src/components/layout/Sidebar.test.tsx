import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { UserRole } from "@chapelle/shared/types";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

function mockRole(role: UserRole | null) {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    role,
    isAuthenticated: role !== null,
    isHydrated: true,
    login: vi.fn(),
    logout: vi.fn(),
  });
}

describe("components/layout/Sidebar (admin-app)", () => {
  it("affiche les liens Utilisateurs/Planning/Annonces/Mon compte pour un ADMINISTRATEUR", () => {
    mockRole(UserRole.ADMINISTRATEUR);

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Utilisateurs" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Planning" })).toHaveAttribute("href", "/planning");
    expect(screen.getByRole("link", { name: "Annonces" })).toHaveAttribute("href", "/annonces");
    expect(screen.getByRole("link", { name: "Mon compte" })).toHaveAttribute(
      "href",
      "/mon-compte",
    );
    expect(screen.queryByRole("link", { name: "Administrateurs" })).not.toBeInTheDocument();
  });

  it("affiche en plus le lien Administrateurs pour un SUPERADMINISTRATEUR", () => {
    mockRole(UserRole.SUPERADMINISTRATEUR);

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Administrateurs" })).toHaveAttribute(
      "href",
      "/administrateurs",
    );
  });
});
