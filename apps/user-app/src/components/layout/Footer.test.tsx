import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { Footer } from "./Footer";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

describe("components/layout/Footer (user-app)", () => {
  it("affiche les liens de navigation et de compte vers des routes réelles quand non authentifié", () => {
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
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Actualités" })).toHaveAttribute("href", "/actualites");
    expect(screen.getByRole("link", { name: "Qui sommes-nous ?" })).toHaveAttribute("href", "/qui-sommes-nous");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Connexion" })).toHaveAttribute("href", "/connexion");
    expect(screen.getByRole("link", { name: "Inscription" })).toHaveAttribute("href", "/inscription");
  });

  it("masque la section Compte (Connexion/Inscription) mais conserve les autres sections quand authentifié", () => {
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
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Compte")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Connexion" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Inscription" })).not.toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Actualités" })).toHaveAttribute("href", "/actualites");
    expect(screen.getByRole("link", { name: "Qui sommes-nous ?" })).toHaveAttribute("href", "/qui-sommes-nous");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");

    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("YouTube")).toBeInTheDocument();
  });

  it("affiche l'année courante dans la mention de copyright", () => {
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
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText(new RegExp(`© ${String(new Date().getFullYear())} Chapelle du Vœux`))).toBeInTheDocument();
  });

  it("affiche la grille du footer sur 4 colonnes (lg) quand non authentifié", () => {
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
        <Footer />
      </MemoryRouter>,
    );

    const gridContainer = screen.getByRole("heading", { name: "Navigation" }).closest("div")?.parentElement;
    expect(gridContainer).toHaveClass("lg:grid-cols-4");
    expect(gridContainer).not.toHaveClass("lg:grid-cols-3");
  });

  it("affiche la grille du footer sur 3 colonnes (lg) quand authentifié", () => {
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
        <Footer />
      </MemoryRouter>,
    );

    const gridContainer = screen.getByRole("heading", { name: "Navigation" }).closest("div")?.parentElement;
    expect(gridContainer).toHaveClass("lg:grid-cols-3");
    expect(gridContainer).not.toHaveClass("lg:grid-cols-4");
  });
});
