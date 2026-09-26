import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { UserRole } from "@chapelle/shared/types";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

const ADMIN_ROLES = [UserRole.ADMINISTRATEUR, UserRole.SUPERADMINISTRATEUR];

function renderProtected(allowedRoles: UserRole[] = ADMIN_ROLES) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>Contenu protégé</div>
            </ProtectedRoute>
          }
        />
        <Route path="/connexion" element={<div>Page connexion</div>} />
        <Route path="/non-autorise" element={<div>Page 403</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("components/auth/ProtectedRoute (admin-app)", () => {
  it("affiche un spinner centré tant que isHydrated est false", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isHydrated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected();

    expect(screen.getByRole("status", { name: "Chargement" })).toBeInTheDocument();
    expect(screen.queryByText("Contenu protégé")).not.toBeInTheDocument();
  });

  it("redirige vers /connexion quand isHydrated est true mais isAuthenticated est false", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected();

    expect(screen.getByText("Page connexion")).toBeInTheDocument();
  });

  it("redirige vers /non-autorise quand le rôle n'est pas dans allowedRoles (ex. ADORATEUR)", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: UserRole.ADORATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected(ADMIN_ROLES);

    expect(screen.getByText("Page 403")).toBeInTheDocument();
  });

  it("rend les children quand authentifié et rôle autorisé", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: UserRole.ADMINISTRATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected(ADMIN_ROLES);

    expect(screen.getByText("Contenu protégé")).toBeInTheDocument();
  });

  it("redirige vers /non-autorise pour un ADMINISTRATEUR sur une route réservée SUPERADMINISTRATEUR", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: UserRole.ADMINISTRATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected([UserRole.SUPERADMINISTRATEUR]);

    expect(screen.getByText("Page 403")).toBeInTheDocument();
  });
});
