import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EventClickArg } from "@fullcalendar/core";
import { UserRole, type PlanningEntryResponse } from "@chapelle/shared/types";
import CalendrierReservations from "./CalendrierReservations";

/** Surcharge locale de `window.matchMedia` (stub par défaut `matches: false` posé dans
 *  `vitest.setup.ts`) pour simuler un viewport mobile (<768px) dans les tests qui en ont
 *  besoin — cf. conception §4.1. */
function mockMobileViewport(matches: boolean): void {
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }) as unknown as MediaQueryList);
}

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
  // Ne PAS utiliser `vi.restoreAllMocks()` ici : le stub par défaut de `window.matchMedia`
  // posé dans `vitest.setup.ts` est lui-même un `vi.fn()` (pas une vraie fonction native) —
  // `restoreAllMocks()` le réduirait à une implémentation vide pour tout le reste du fichier
  // (il ne peut "restaurer" que des espions `vi.spyOn` sur une fonction native préexistante).
  // On réapplique explicitement le viewport desktop par défaut après chaque test.
  afterEach(() => {
    mockMobileViewport(false);
  });

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

  // Non-régression visuelle CSS (`detail-reservation-veilleur`, 3.6) : le conteneur
  // racine doit porter la classe marqueur `.user-agenda-calendar`, seul mécanisme de
  // scope "user-app uniquement" de la règle CSS étendant le cadre doré aux vues
  // Jour/Semaine (`packages/shared/src/ui/fullcalendar-overrides.css`) — cette classe
  // n'existe nulle part côté `admin-app` (`CalendrierPlanningAdmin.tsx`). Un test
  // explicite sur la présence de cette classe ET sur les classes de vue FullCalendar
  // elles-mêmes garantit qu'un futur renommage de l'une ou l'autre ferait échouer ce
  // test plutôt que de casser silencieusement le style (même esprit que les
  // assertions `.fc-view`/`.fc-dayGridMonth-view` ci-dessous).
  it("pose la classe marqueur .user-agenda-calendar sur le conteneur racine, combinée aux classes de vue FullCalendar (Jour/Semaine/listWeek)", () => {
    const { container: dayContainer } = render(
      <CalendrierReservations periode={{ mode: "jour", date: "2026-01-01" }} entries={[]} isLoading={false} />,
    );
    const dayRoot = dayContainer.querySelector(".user-agenda-calendar");
    expect(dayRoot).not.toBeNull();
    expect(dayRoot?.querySelector(".fc-timeGridDay-view")).not.toBeNull();

    const { container: weekContainer } = render(
      <CalendrierReservations
        periode={{ mode: "semaine", dateDebut: "2026-01-05" }}
        entries={[]}
        isLoading={false}
      />,
    );
    const weekRoot = weekContainer.querySelector(".user-agenda-calendar");
    expect(weekRoot).not.toBeNull();
    expect(weekRoot?.querySelector(".fc-timeGridWeek-view")).not.toBeNull();

    mockMobileViewport(true);
    const { container: listContainer } = render(
      <CalendrierReservations
        periode={{ mode: "semaine", dateDebut: "2026-01-05" }}
        entries={[]}
        isLoading={false}
      />,
    );
    const listRoot = listContainer.querySelector(".user-agenda-calendar");
    expect(listRoot).not.toBeNull();
    expect(listRoot?.querySelector(".fc-listWeek-view")).not.toBeNull();
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

    it("mode semaine + mobile (<768px) : bascule vers la vue liste listWeek", () => {
      mockMobileViewport(true);

      const { container } = render(
        <CalendrierReservations
          periode={{ mode: "semaine", dateDebut: "2026-01-05" }}
          entries={[]}
          isLoading={false}
        />,
      );

      expect(container.querySelector(".fc-view")).toHaveClass("fc-listWeek-view");
    });

    it("mode mois + mobile (<768px) : la grille dayGridMonth reste affichée (inchangée)", () => {
      mockMobileViewport(true);

      const { container } = render(
        <CalendrierReservations periode={{ mode: "mois", annee: 2026, mois: 3 }} entries={[]} isLoading={false} />,
      );

      expect(container.querySelector(".fc-view")).toHaveClass("fc-dayGridMonth-view");
    });
  });
});
