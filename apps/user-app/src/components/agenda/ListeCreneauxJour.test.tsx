import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserRole, type PlanningEntryResponse } from "@chapelle/shared/types";
import { ListeCreneauxJour } from "./ListeCreneauxJour";

function entry(overrides: Partial<PlanningEntryResponse> = {}): PlanningEntryResponse {
  return {
    id: "e1",
    idUtilisateur: "u1",
    nomUtilisateur: "Dupont",
    prenomsUtilisateur: "Jean",
    roleUtilisateur: UserRole.VEILLEUR,
    dateDebut: "2026-01-15T10:00:00Z",
    dateFin: "2026-01-15T11:00:00Z",
    estArchivee: false,
    estAnonymise: false,
    ...overrides,
  };
}

describe("components/agenda/ListeCreneauxJour (user-app)", () => {
  it("affiche un message quand il n'y a aucun créneau ce jour-là", () => {
    render(<ListeCreneauxJour date="2026-01-15" entries={[]} />);

    expect(screen.getByText("Aucun créneau ce jour-là.")).toBeInTheDocument();
  });

  it("affiche le titre (identité ou anonymisé) et les horaires de chaque créneau", () => {
    render(
      <ListeCreneauxJour
        date="2026-01-15"
        entries={[entry({ id: "e1" }), entry({ id: "e2", estAnonymise: true })]}
      />,
    );

    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText("Créneau réservé")).toBeInTheDocument();
    expect(screen.queryByText("Aucun créneau ce jour-là.")).not.toBeInTheDocument();
  });

  it("affiche le badge « Ma réservation » uniquement pour les entrées non anonymisées (isMine)", () => {
    render(
      <ListeCreneauxJour
        date="2026-01-15"
        entries={[entry({ id: "e1", estAnonymise: false }), entry({ id: "e2", estAnonymise: true })]}
      />,
    );

    expect(screen.getAllByText("Ma réservation")).toHaveLength(1);
  });
});
