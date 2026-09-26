import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("rend le titre quand fourni", () => {
    render(<Card title="Réservations">Contenu</Card>);
    expect(screen.getByRole("heading", { name: "Réservations" })).toBeInTheDocument();
  });

  it("ne rend pas de titre quand non fourni", () => {
    render(<Card>Contenu</Card>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("rend les enfants", () => {
    render(<Card>Contenu de la carte</Card>);
    expect(screen.getByText("Contenu de la carte")).toBeInTheDocument();
  });

  it("applique une className personnalisée", () => {
    const { container } = render(<Card className="mt-4">Contenu</Card>);
    expect(container.firstElementChild?.className).toContain("mt-4");
  });
});
