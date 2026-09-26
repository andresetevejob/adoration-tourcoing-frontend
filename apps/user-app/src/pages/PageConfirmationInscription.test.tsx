import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { StatutValidation, UserRole } from "@chapelle/shared/types";
import PageConfirmationInscription from "./PageConfirmationInscription";

function renderAt(state?: { role: UserRole; statutValidation: StatutValidation }) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: "/inscription/confirmation", state }]}
    >
      <Routes>
        <Route
          path="/inscription/confirmation"
          element={<PageConfirmationInscription />}
        />
        <Route path="/inscription" element={<div>Page inscription</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("pages/PageConfirmationInscription (user-app)", () => {
  it("redirige vers /inscription si location.state est absent (accès direct par URL)", () => {
    renderAt(undefined);

    expect(screen.getByText("Page inscription")).toBeInTheDocument();
  });

  it("affiche le message de compte validé quand statutValidation === VALIDE", () => {
    renderAt({ role: UserRole.ADORATEUR, statutValidation: StatutValidation.VALIDE });

    expect(
      screen.getByText("Votre compte est créé, vous pouvez vous connecter."),
    ).toBeInTheDocument();
  });

  it("affiche le message d'attente de validation quand statutValidation === EN_ATTENTE", () => {
    renderAt({ role: UserRole.VEILLEUR, statutValidation: StatutValidation.EN_ATTENTE });

    expect(
      screen.getByText("Votre compte est en attente de validation par un administrateur."),
    ).toBeInTheDocument();
  });
});
