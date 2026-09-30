import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { UserRole } from "@chapelle/shared/types";
import { GuestRoute } from "./GuestRoute";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

function renderGuest() {
  return render(
    <MemoryRouter initialEntries={["/connexion"]}>
      <Routes>
        <Route
          path="/connexion"
          element={
            <GuestRoute>
              <div>Page connexion</div>
            </GuestRoute>
          }
        />
        <Route path="/" element={<div>Accueil</div>} />
        <Route path="/non-autorise" element={<div>Page 403</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("components/auth/GuestRoute (admin-app)", () => {
  it("affiche un spinner centré tant que isHydrated est false", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isHydrated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderGuest();

    expect(screen.getByRole("status", { name: "Chargement" })).toBeInTheDocument();
    expect(screen.queryByText("Page connexion")).not.toBeInTheDocument();
  });

  it("redirige vers / quand authentifié avec un rôle autorisé (ADMINISTRATEUR)", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: UserRole.ADMINISTRATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderGuest();

    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.queryByText("Page connexion")).not.toBeInTheDocument();
  });

  it("redirige vers /non-autorise quand authentifié avec un rôle non autorisé pour l'app (ADORATEUR)", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: UserRole.ADORATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderGuest();

    expect(screen.getByText("Page 403")).toBeInTheDocument();
  });

  it("rend les children quand non authentifié", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderGuest();

    expect(screen.getByText("Page connexion")).toBeInTheDocument();
  });
});
