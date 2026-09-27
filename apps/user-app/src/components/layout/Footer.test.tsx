import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { Footer } from "./Footer";

describe("components/layout/Footer (user-app)", () => {
  it("affiche les liens de navigation et de compte vers des routes réelles", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Actualités" })).toHaveAttribute("href", "/actualites");
    expect(screen.getByRole("link", { name: "Qui sommes-nous ?" })).toHaveAttribute("href", "/qui-sommes-nous");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Connexion" })).toHaveAttribute("href", "/connexion");
    expect(screen.getByRole("link", { name: "Inscription" })).toHaveAttribute("href", "/inscription");
  });

  it("affiche l'année courante dans la mention de copyright", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText(new RegExp(`© ${String(new Date().getFullYear())} Chapelle du Vœux`))).toBeInTheDocument();
  });
});
