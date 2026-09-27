import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { Navbar } from "./Navbar";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

describe("components/layout/Navbar (user-app)", () => {
  it("affiche les liens de site et délègue la partie auth à AuthNav", () => {
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
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Chapelle du Vœux" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Agenda" })).toHaveAttribute("href", "/agenda");
    expect(screen.getByRole("link", { name: "Actualités" })).toHaveAttribute("href", "/actualites");
    expect(screen.getByRole("link", { name: "Qui sommes-nous ?" })).toHaveAttribute("href", "/qui-sommes-nous");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Connexion" })).toBeInTheDocument();
  });

  it("affiche Mon compte/Déconnexion (via AuthNav) quand authentifié", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Mon compte" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Connexion" })).not.toBeInTheDocument();
  });
});
