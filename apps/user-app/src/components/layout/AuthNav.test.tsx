import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { AuthNav } from "./AuthNav";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

describe("components/layout/AuthNav (user-app)", () => {
  it("affiche les liens Connexion/Inscription quand non authentifié", () => {
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
        <AuthNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Connexion" })).toHaveAttribute("href", "/connexion");
    expect(screen.getByRole("link", { name: "Inscription" })).toHaveAttribute(
      "href",
      "/inscription",
    );
    expect(screen.queryByRole("link", { name: "Mon compte" })).not.toBeInTheDocument();
  });

  it("affiche le lien Mon compte et Déconnexion, qui appelle logout() au clic, quand authentifié", () => {
    const logout = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout,
    });

    render(
      <MemoryRouter>
        <AuthNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Mon compte" })).toHaveAttribute(
      "href",
      "/mon-compte",
    );
    fireEvent.click(screen.getByRole("button", { name: "Déconnexion" }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
