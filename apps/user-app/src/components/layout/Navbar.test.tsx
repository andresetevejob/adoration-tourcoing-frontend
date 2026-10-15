import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import { Navbar } from "./Navbar";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

/** `Navbar` rend `AuthNav`, qui appelle `useUserPhoto` (donc `useQuery`) : nécessite un
 *  `QueryClientProvider` ancêtre, même pattern que `AuthNav.test.tsx`. */
function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function mockUnauthenticated(): void {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    role: null,
    isAuthenticated: false,
    isHydrated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  });
}

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

    renderWithQueryClient(
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

    renderWithQueryClient(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Mon compte" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Connexion" })).not.toBeInTheDocument();
  });

  describe("drawer mobile", () => {
    it("n'affiche pas le drawer au rendu initial (aria-expanded=false, pas de dialog)", () => {
      mockUnauthenticated();

      renderWithQueryClient(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>,
      );

      const trigger = screen.getByRole("button", { name: "Ouvrir le menu" });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("ouvre le drawer au clic sur le bouton hamburger (aria-expanded=true, dialog visible)", () => {
      mockUnauthenticated();

      renderWithQueryClient(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu" }));

      const trigger = screen.getByRole("button", { name: "Fermer le menu" });
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      const dialog = screen.getByRole("dialog", { name: "Menu" });
      expect(within(dialog).getByRole("link", { name: "Agenda" })).toHaveAttribute("href", "/agenda");
      expect(within(dialog).getByRole("link", { name: "Connexion" })).toBeInTheDocument();
    });

    it("ferme le drawer au clic sur un lien du drawer", () => {
      mockUnauthenticated();

      renderWithQueryClient(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
      const dialog = screen.getByRole("dialog", { name: "Menu" });
      fireEvent.click(within(dialog).getByRole("link", { name: "Agenda" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Ouvrir le menu" })).toHaveAttribute("aria-expanded", "false");
    });

    it("ferme le drawer à la touche Échap", () => {
      mockUnauthenticated();

      renderWithQueryClient(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
