import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { StatutValidation, UserRole, type AuthResponse } from "@chapelle/shared/types";
import PageInscription from "./PageInscription";
import type { RegisterFormProps } from "../components/auth/RegisterForm";

const { capturedOnSuccess } = vi.hoisted(() => ({
  capturedOnSuccess: { current: undefined as RegisterFormProps["onSuccess"] | undefined },
}));

vi.mock("../components/auth/RegisterForm", () => ({
  RegisterForm: ({ onSuccess }: RegisterFormProps) => {
    capturedOnSuccess.current = onSuccess;
    return <div>Formulaire d'inscription</div>;
  },
}));

const authResponse: AuthResponse = {
  user: {
    id: "1",
    email: "a@b.com",
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.VEILLEUR,
    statutValidation: StatutValidation.EN_ATTENTE,
    dateCreation: "2026-01-01T00:00:00Z",
  },
  authenticatedAt: "2026-01-01T00:00:00Z",
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/inscription"]}>
      <Routes>
        <Route path="/inscription" element={<PageInscription />} />
        <Route
          path="/inscription/confirmation"
          element={<div>Page confirmation inscription</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("pages/PageInscription (user-app)", () => {
  it("affiche le titre Inscription et le RegisterForm", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Inscription" })).toBeInTheDocument();
    expect(screen.getByText("Formulaire d'inscription")).toBeInTheDocument();
  });

  it("navigue vers /inscription/confirmation avec role/statutValidation en state après succès", () => {
    renderPage();

    act(() => {
      capturedOnSuccess.current?.(authResponse);
    });

    expect(screen.getByText("Page confirmation inscription")).toBeInTheDocument();
  });
});
