import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReservationCard } from "./ReservationCard";

describe("components/agenda/ReservationCard (user-app)", () => {
  it("affiche les dates et le bénéficiaire", () => {
    render(
      <ReservationCard
        dateDebut="2026-01-01T10:00:00Z"
        dateFin="2026-01-01T11:00:00Z"
        beneficiaireLabel="Moi-même"
      />,
    );

    expect(screen.getByText("Moi-même")).toBeInTheDocument();
    expect(screen.queryByText(/Description/)).not.toBeInTheDocument();
  });

  it("affiche la description quand elle est fournie", () => {
    render(
      <ReservationCard
        dateDebut="2026-01-01T10:00:00Z"
        dateFin="2026-01-01T11:00:00Z"
        beneficiaireLabel="Moi-même"
        description="Adoration silencieuse"
      />,
    );

    expect(screen.getByText("Adoration silencieuse")).toBeInTheDocument();
  });

  it("n'affiche aucun bloc photo quand photoUrl n'est pas fourni (undefined)", () => {
    render(
      <ReservationCard
        dateDebut="2026-01-01T10:00:00Z"
        dateFin="2026-01-01T11:00:00Z"
        beneficiaireLabel="Moi-même"
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("affiche la photo (miniature circulaire) quand photoUrl est fourni", () => {
    render(
      <ReservationCard
        dateDebut="2026-01-01T10:00:00Z"
        dateFin="2026-01-01T11:00:00Z"
        beneficiaireLabel="Jean Dupont"
        photoUrl="blob:fake-url"
      />,
    );

    const photo = screen.getByRole("img", { name: "Photo de Jean Dupont" });
    expect(photo).toHaveAttribute("src", "blob:fake-url");
    expect(photo).toHaveClass("rounded-full");
  });
});
