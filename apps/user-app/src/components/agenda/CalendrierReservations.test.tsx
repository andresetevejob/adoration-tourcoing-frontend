import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { EventClickArg } from "@fullcalendar/core";
import { UserRole, type PlanningEntryResponse } from "@chapelle/shared/types";
import CalendrierReservations from "./CalendrierReservations";

function entry(overrides: Partial<PlanningEntryResponse> = {}): PlanningEntryResponse {
  return {
    id: "e1",
    idUtilisateur: "u1",
    nomUtilisateur: "Dupont",
    prenomsUtilisateur: "Jean",
    roleUtilisateur: UserRole.VEILLEUR,
    dateDebut: "2026-01-01T10:00:00Z",
    dateFin: "2026-01-01T11:00:00Z",
    estArchivee: false,
    estAnonymise: false,
    ...overrides,
  };
}

describe("CalendrierReservations (user-app)", () => {
  it("affiche un Spinner à la place du calendrier pendant le premier chargement", () => {
    render(<CalendrierReservations date="2026-01-01" entries={[]} isLoading />);

    expect(screen.getByRole("status", { name: "Chargement" })).toBeInTheDocument();
  });

  it("rend le calendrier avec les entrées fournies une fois chargé", () => {
    render(
      <CalendrierReservations date="2026-01-01" entries={[entry()]} isLoading={false} />,
    );

    expect(screen.queryByRole("status", { name: "Chargement" })).not.toBeInTheDocument();
    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
  });

  it("anonymise le titre pour une entrée estAnonymise=true", () => {
    render(
      <CalendrierReservations
        date="2026-01-01"
        entries={[entry({ estAnonymise: true })]}
        isLoading={false}
      />,
    );

    expect(screen.getByText(/Créneau réservé/)).toBeInTheDocument();
  });

  it("appelle onEventClick avec l'événement cliqué quand la prop est fournie", () => {
    const onEventClick = vi.fn<(info: EventClickArg) => void>();
    render(
      <CalendrierReservations
        date="2026-01-01"
        entries={[entry()]}
        isLoading={false}
        onEventClick={onEventClick}
      />,
    );

    fireEvent.click(screen.getByText(/Jean Dupont/));

    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onEventClick.mock.calls[0][0].event.id).toBe("e1");
  });

  it("n'appelle pas onEventClick sur un clic quand la prop n'est pas fournie", () => {
    render(<CalendrierReservations date="2026-01-01" entries={[entry()]} isLoading={false} />);

    expect(() => {
      fireEvent.click(screen.getByText(/Jean Dupont/));
    }).not.toThrow();
  });

  it("rend le calendrier sans erreur quand onSelectSlot est fourni (sélection activée)", () => {
    const onSelectSlot = vi.fn();
    render(
      <CalendrierReservations
        date="2026-01-01"
        entries={[entry()]}
        isLoading={false}
        onSelectSlot={onSelectSlot}
      />,
    );

    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
  });
});
