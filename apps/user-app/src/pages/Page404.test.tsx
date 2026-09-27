import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import Page404 from "./Page404";

describe("pages/Page404 (user-app)", () => {
  it("affiche le message de page introuvable et un lien de retour à l'accueil", () => {
    render(
      <MemoryRouter>
        <Page404 />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Page introuvable" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Retour à l'accueil" })).toHaveAttribute("href", "/");
  });
});
