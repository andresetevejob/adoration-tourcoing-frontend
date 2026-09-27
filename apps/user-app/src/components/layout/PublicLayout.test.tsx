import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import PublicLayout from "./PublicLayout";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

describe("components/layout/PublicLayout (user-app)", () => {
  it("rend Navbar (site + AuthNav), l'Outlet des routes enfants et Footer (chargé en différé)", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<div>Contenu de la page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Connexion" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Actualités" })).toBeInTheDocument();
    expect(screen.getByText("Contenu de la page")).toBeInTheDocument();
    expect(await screen.findByText(/Chapelle du Vœux · Tous droits réservés/)).toBeInTheDocument();
  });
});
