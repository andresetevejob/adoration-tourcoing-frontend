import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import PublicLayout from "./PublicLayout";

describe("components/layout/PublicLayout (admin-app)", () => {
  it("rend uniquement le lien Connexion et l'Outlet des routes enfants", () => {
    render(
      <MemoryRouter initialEntries={["/connexion"]}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/connexion" element={<div>Contenu de la page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Connexion" })).toHaveAttribute("href", "/connexion");
    expect(screen.getByText("Contenu de la page")).toBeInTheDocument();
  });
});
