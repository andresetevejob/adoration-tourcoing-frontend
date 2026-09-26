import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { UserRole } from "@chapelle/shared/types";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

describe("components/layout/AdminLayout (admin-app)", () => {
  it("rend Header, Sidebar et l'Outlet des routes enfants", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      role: UserRole.ADMINISTRATEUR,
      isAuthenticated: true,
      isHydrated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<div>Contenu administration</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Administration — Chapelle du Vœux")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Utilisateurs" })).toBeInTheDocument();
    expect(screen.getByText("Contenu administration")).toBeInTheDocument();
  });
});
