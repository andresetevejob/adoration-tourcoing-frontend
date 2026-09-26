import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import AppLayout from "./AppLayout";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

const user: UserResponse = {
  id: "1",
  email: "adorateur@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.ADORATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/mon-compte"]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/mon-compte" element={<div>Contenu mon compte</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("components/layout/AppLayout (user-app)", () => {
  it("n'affiche pas le bloc utilisateur quand user est null", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderLayout();

    expect(screen.queryByText(/Déconnexion/)).not.toBeInTheDocument();
    expect(screen.getByText("Contenu mon compte")).toBeInTheDocument();
  });

  it("affiche prénoms/nom/rôle et déclenche logout() au clic sur Déconnexion", () => {
    const logout = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      user,
      role: UserRole.ADORATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout,
    });

    renderLayout();

    expect(screen.getByText("Jean Dupont — Adorateur")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Déconnexion" }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
