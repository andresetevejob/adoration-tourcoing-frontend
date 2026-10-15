import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { AuthNav } from "./AuthNav";
import { useAuth } from "../../hooks/useAuth";
import { getUserPhoto } from "../../api/endpoints/users";

vi.mock("../../hooks/useAuth");
vi.mock("../../api/endpoints/users", () => ({
  getUserPhoto: vi.fn(),
}));

/** `AuthNav` appelle `useUserPhoto` (donc `useQuery`) : nécessite un `QueryClientProvider`
 *  ancêtre, même pattern que `ReservationConfirmModal.test.tsx`/`ReservationDetailModal.test.tsx`. */
function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

function veilleur(overrides: Partial<UserResponse> = {}): UserResponse {
  return {
    id: "u1",
    email: "jean.dupont@example.com",
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.VEILLEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
    photo: "photo-1.jpg",
    ...overrides,
  };
}

beforeEach(() => {
  // Jamais résolue par défaut : évite tout avertissement de promesse non gérée pour les
  // tests qui ne s'intéressent pas spécifiquement à l'issue de la requête photo.
  vi.mocked(getUserPhoto).mockReset().mockReturnValue(new Promise(() => {}));
  URL.createObjectURL = vi.fn().mockReturnValue("blob:fake-url");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.mocked(getUserPhoto).mockReset();
});

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

    renderWithQueryClient(<AuthNav />);

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

    renderWithQueryClient(<AuthNav />);

    expect(screen.getByRole("link", { name: "Mon compte" })).toHaveAttribute(
      "href",
      "/mon-compte",
    );
    fireEvent.click(screen.getByRole("button", { name: "Déconnexion" }));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("affiche la miniature photo dans le lien Mon compte quand l'utilisateur connecté a une photo", async () => {
    const fakeBlob = new Blob(["contenu"], { type: "image/jpeg" });
    vi.mocked(getUserPhoto).mockResolvedValueOnce(fakeBlob);
    vi.mocked(useAuth).mockReturnValue({
      user: veilleur(),
      role: UserRole.VEILLEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderWithQueryClient(<AuthNav />);

    expect(getUserPhoto).toHaveBeenCalledWith("u1");
    const link = screen.getByRole("link", { name: "Mon compte" });
    // `alt=""` (décoratif, cf. design.md §2.1) : l'image n'a pas de rôle accessible
    // "img" exposé par le navigateur/jsdom, donc on la cherche via `querySelector`.
    const photo = await waitFor(() => {
      const img = link.querySelector("img");
      expect(img).not.toBeNull();
      return img as HTMLImageElement;
    });
    expect(photo).toHaveAttribute("src", "blob:fake-url");
    expect(photo).toHaveAttribute("alt", "");
  });

  it("n'affiche aucune photo et ne déclenche aucun appel réseau quand l'utilisateur connecté n'a pas de photo (Adorateur ou Veilleur sans photo)", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: veilleur({ role: UserRole.ADORATEUR, photo: null }),
      role: UserRole.ADORATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderWithQueryClient(<AuthNav />);

    expect(screen.getByRole("link", { name: "Mon compte" })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(getUserPhoto).not.toHaveBeenCalled();
  });

  it("dégradation silencieuse : aucune photo affichée et aucune erreur visible quand la récupération de la photo échoue (403/404/réseau) pour un utilisateur qui a pourtant une photo", async () => {
    vi.mocked(getUserPhoto).mockRejectedValueOnce(new Error("403 Forbidden"));
    vi.mocked(useAuth).mockReturnValue({
      user: veilleur(),
      role: UserRole.VEILLEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderWithQueryClient(<AuthNav />);

    await waitFor(() => {
      expect(getUserPhoto).toHaveBeenCalledWith("u1");
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mon compte" })).toBeInTheDocument();
  });
});
