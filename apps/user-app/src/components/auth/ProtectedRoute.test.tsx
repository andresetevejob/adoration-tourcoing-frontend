import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { UserRole } from "@chapelle/shared/types";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

function renderProtected(allowedRoles: UserRole[] = [UserRole.ADORATEUR, UserRole.VEILLEUR]) {
  return render(
    <MemoryRouter initialEntries={["/mon-compte"]}>
      <Routes>
        <Route
          path="/mon-compte"
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

describe("components/auth/ProtectedRoute (user-app)", () => {
  it("affiche un spinner centré tant que isHydrated est false", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isHydrated: false,
      login: vi.fn(),
      register: vi.fn(),
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
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected();

    expect(screen.getByText("Page connexion")).toBeInTheDocument();
  });

  it("redirige vers /non-autorise quand le rôle n'est pas dans allowedRoles", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: UserRole.ADMINISTRATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected([UserRole.ADORATEUR, UserRole.VEILLEUR]);

    expect(screen.getByText("Page 403")).toBeInTheDocument();
  });

  it("rend les children quand authentifié et rôle autorisé", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: UserRole.ADORATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected([UserRole.ADORATEUR, UserRole.VEILLEUR]);

    expect(screen.getByText("Contenu protégé")).toBeInTheDocument();
  });
});
