import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { StatutValidation, UserRole, type AuthResponse } from "@chapelle/shared/types";
import PageConnexion from "./PageConnexion";
import type { LoginFormProps } from "../components/auth/LoginForm";

const { capturedOnSuccess } = vi.hoisted(() => ({
  capturedOnSuccess: { current: undefined as LoginFormProps["onSuccess"] | undefined },
}));

vi.mock("../components/auth/LoginForm", () => ({
  LoginForm: ({ onSuccess }: LoginFormProps) => {
    capturedOnSuccess.current = onSuccess;
    return <div>Formulaire de connexion</div>;
  },
}));

function authResponseFor(role: UserRole): AuthResponse {
  return {
    user: {
      id: "1",
      email: "admin@example.com",
      nom: "Curé",
      prenoms: "Michel",
      role,
      statutValidation: StatutValidation.VALIDE,
      dateCreation: "2026-01-01T00:00:00Z",
    },
    authenticatedAt: "2026-01-01T00:00:00Z",
  };
}

function renderAt(initialEntry: string | { pathname: string; state?: unknown }) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/connexion" element={<PageConnexion />} />
        <Route path="/" element={<div>Page gestion utilisateurs</div>} />
        <Route path="/administrateurs" element={<div>Page administrateurs</div>} />
        <Route path="/non-autorise" element={<div>Page 403</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("pages/PageConnexion (admin-app)", () => {
  it("affiche le titre Connexion et le LoginForm", () => {
    renderAt("/connexion");
    expect(screen.getByRole("heading", { name: "Connexion" })).toBeInTheDocument();
    expect(screen.getByText("Formulaire de connexion")).toBeInTheDocument();
  });

  it("navigue vers '/' après connexion réussie d'un ADMINISTRATEUR sans 'from'", () => {
    renderAt("/connexion");

    act(() => {
      capturedOnSuccess.current?.(authResponseFor(UserRole.ADMINISTRATEUR));
    });

    expect(screen.getByText("Page gestion utilisateurs")).toBeInTheDocument();
  });

  it("navigue vers 'from' (location.state) après connexion réussie", () => {
    renderAt({ pathname: "/connexion", state: { from: { pathname: "/administrateurs" } } });

    act(() => {
      capturedOnSuccess.current?.(authResponseFor(UserRole.SUPERADMINISTRATEUR));
    });

    expect(screen.getByText("Page administrateurs")).toBeInTheDocument();
  });

  it("navigue vers /non-autorise quand le rôle n'est pas autorisé pour admin-app (ex. ADORATEUR)", () => {
    renderAt("/connexion");

    act(() => {
      capturedOnSuccess.current?.(authResponseFor(UserRole.ADORATEUR));
    });

    expect(screen.getByText("Page 403")).toBeInTheDocument();
  });
});
