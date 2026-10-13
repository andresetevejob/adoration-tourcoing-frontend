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
    render(<CalendrierReservations periode={{ mode: "jour", date: "2026-01-01" }} entries={[]} isLoading />);

    expect(screen.getByRole("status", { name: "Chargement" })).toBeInTheDocument();
  });

  it("rend le calendrier avec les entrées fournies une fois chargé", () => {
    render(
      <CalendrierReservations
        periode={{ mode: "jour", date: "2026-01-01" }}
        entries={[entry()]}
        isLoading={false}
      />,
    );

    expect(screen.queryByRole("status", { name: "Chargement" })).not.toBeInTheDocument();
    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
  });

  it("anonymise le titre pour une entrée estAnonymise=true", () => {
    render(
      <CalendrierReservations
        periode={{ mode: "jour", date: "2026-01-01" }}
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
        periode={{ mode: "jour", date: "2026-01-01" }}
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
    render(
      <CalendrierReservations
        periode={{ mode: "jour", date: "2026-01-01" }}
        entries={[entry()]}
        isLoading={false}
      />,
    );

    expect(() => {
      fireEvent.click(screen.getByText(/Jean Dupont/));
    }).not.toThrow();
  });

  it("rend le calendrier sans erreur quand onSelectSlot est fourni (sélection activée)", () => {
    const onSelectSlot = vi.fn();
    render(
      <CalendrierReservations
        periode={{ mode: "jour", date: "2026-01-01" }}
        entries={[entry()]}
        isLoading={false}
        onSelectSlot={onSelectSlot}
      />,
    );

    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
  });

  describe("résolution de la vue FullCalendar selon le mode", () => {
    it("mode jour : vue timeGridDay", () => {
      const { container } = render(
        <CalendrierReservations periode={{ mode: "jour", date: "2026-01-01" }} entries={[]} isLoading={false} />,
      );

      expect(container.querySelector(".fc-view")).toHaveClass("fc-timeGridDay-view");
    });

    it("mode semaine : vue timeGridWeek", () => {
      const { container } = render(
        <CalendrierReservations
          periode={{ mode: "semaine", dateDebut: "2026-01-05" }}
          entries={[]}
          isLoading={false}
        />,
      );

      expect(container.querySelector(".fc-view")).toHaveClass("fc-timeGridWeek-view");
    });

    it("mode mois : vue dayGridMonth", () => {
      const { container } = render(
        <CalendrierReservations
          periode={{ mode: "mois", annee: 2026, mois: 3 }}
          entries={[]}
          isLoading={false}
        />,
      );

      expect(container.querySelector(".fc-view")).toHaveClass("fc-dayGridMonth-view");
    });

    it("mode intervalle : vue dayGrid avec une durée dynamique égale au nombre de jours sélectionnés (bornes incluses)", () => {
      const { container } = render(
        <CalendrierReservations
          periode={{ mode: "intervalle", dateDebut: "2026-01-01", dateFin: "2026-01-05" }}
          entries={[]}
          isLoading={false}
        />,
      );

      const view = container.querySelector(".fc-view");
      expect(view?.className).toContain("fc-daygrid");
      expect(container.querySelectorAll(".fc-col-header-cell")).toHaveLength(5);
    });

    it("mode intervalle : la durée suit le nombre de jours même sur une seule journée (bornes égales)", () => {
      const { container } = render(
        <CalendrierReservations
          periode={{ mode: "intervalle", dateDebut: "2026-01-01", dateFin: "2026-01-01" }}
          entries={[]}
          isLoading={false}
        />,
      );

      expect(container.querySelectorAll(".fc-col-header-cell")).toHaveLength(1);
    });
  });
});
