import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserRole, type PlanningEntryResponse } from "@chapelle/shared/types";
import type { PlanningPeriode } from "../../hooks/planningPeriode";

// Mock dédié à ce fichier (capture `dateClick`/`selectable` au lieu de rendre le vrai
// calendrier) : FullCalendar n'invoque `dateClick` qu'à l'issue d'une interaction de
// pointeur réelle (pointerdown/pointermove/pointerup + géométrie de cellule via
// `getBoundingClientRect`/`elementFromPoint`), non simulable de façon fiable en jsdom
// (toutes les cellules ont des dimensions nulles, cf. `CalendrierReservations.selectAllow.test.tsx`
// qui applique déjà ce même contournement pour `selectAllow`). On capture ici la fonction
// exacte configurée par `CalendrierReservations` et on l'invoque directement avec un
// `DateClickArg` minimal (`{ dateStr }`, seul champ consommé par le composant, cf. §3.3 de la
// conception). `ListeCreneauxJour`, elle, n'est PAS mockée : on vérifie son rendu réel après
// l'appel du `dateClick` capturé.
let capturedProps: { dateClick?: (info: { dateStr: string }) => void; selectable?: boolean } = {};

vi.mock("@fullcalendar/react", () => ({
  default: (props: { dateClick?: (info: { dateStr: string }) => void; selectable?: boolean }) => {
    capturedProps = props;
    return null;
  },
}));

import CalendrierReservations from "./CalendrierReservations";

function entry(overrides: Partial<PlanningEntryResponse> = {}): PlanningEntryResponse {
  return {
    id: "e1",
    idUtilisateur: "u1",
    nomUtilisateur: "Dupont",
    prenomsUtilisateur: "Jean",
    roleUtilisateur: UserRole.VEILLEUR,
    dateDebut: "2026-03-02T10:00:00Z",
    dateFin: "2026-03-02T11:00:00Z",
    estArchivee: false,
    estAnonymise: false,
    ...overrides,
  };
}

function mockMobileViewport(matches: boolean): void {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

function renderCalendrier(
  periode: PlanningPeriode,
  entries: PlanningEntryResponse[] = [],
  onSelectSlot?: () => void,
) {
  render(
    <CalendrierReservations periode={periode} entries={entries} isLoading={false} onSelectSlot={onSelectSlot} />,
  );
}

describe("CalendrierReservations - dateClick / Mode Mois mobile (user-app)", () => {
  afterEach(() => {
    mockMobileViewport(false);
    capturedProps = {};
  });

  it("Mode Mois + mobile : dateClick est défini (grille tactile)", () => {
    mockMobileViewport(true);
    renderCalendrier({ mode: "mois", annee: 2026, mois: 3 });

    expect(capturedProps.dateClick).toBeDefined();
  });

  it("Mode Mois + desktop : dateClick est undefined (comportement inchangé)", () => {
    mockMobileViewport(false);
    renderCalendrier({ mode: "mois", annee: 2026, mois: 3 });

    expect(capturedProps.dateClick).toBeUndefined();
  });

  it("Mode Jour + mobile : dateClick est undefined (seul Mode Mois est concerné)", () => {
    mockMobileViewport(true);
    renderCalendrier({ mode: "jour", date: "2026-03-02" });

    expect(capturedProps.dateClick).toBeUndefined();
  });

  it("Mode Mois + mobile + onSelectSlot fourni : selectable est désactivé (drag-select)", () => {
    mockMobileViewport(true);
    renderCalendrier({ mode: "mois", annee: 2026, mois: 3 }, [], vi.fn());

    expect(capturedProps.selectable).toBe(false);
  });

  it("Mode Mois + desktop + onSelectSlot fourni : selectable reste activé (inchangé)", () => {
    mockMobileViewport(false);
    renderCalendrier({ mode: "mois", annee: 2026, mois: 3 }, [], vi.fn());

    expect(capturedProps.selectable).toBe(true);
  });

  it("Mode Jour + mobile + onSelectSlot fourni : selectable reste activé (inchangé hors Mode Mois)", () => {
    mockMobileViewport(true);
    renderCalendrier({ mode: "jour", date: "2026-03-02" }, [], vi.fn());

    expect(capturedProps.selectable).toBe(true);
  });

  it("tap sur un jour avec créneaux affiche la liste des créneaux de ce jour dans ListeCreneauxJour", () => {
    mockMobileViewport(true);
    renderCalendrier({ mode: "mois", annee: 2026, mois: 3 }, [entry()]);

    act(() => {
      capturedProps.dateClick?.({ dateStr: "2026-03-02" });
    });

    expect(screen.queryByText("Aucun créneau ce jour-là.")).not.toBeInTheDocument();
    expect(screen.getByText("Créneau réservé")).toBeInTheDocument();
  });

  it("tap sur un jour sans créneau affiche le message 'Aucun créneau ce jour-là.'", () => {
    mockMobileViewport(true);
    renderCalendrier({ mode: "mois", annee: 2026, mois: 3 }, []);

    act(() => {
      capturedProps.dateClick?.({ dateStr: "2026-03-05" });
    });

    expect(screen.getByText("Aucun créneau ce jour-là.")).toBeInTheDocument();
  });

  it("tap sur un jour n'affiche pas les créneaux d'un autre jour", () => {
    mockMobileViewport(true);
    renderCalendrier({ mode: "mois", annee: 2026, mois: 3 }, [entry({ dateDebut: "2026-03-10T10:00:00Z" })]);

    act(() => {
      capturedProps.dateClick?.({ dateStr: "2026-03-05" });
    });

    expect(screen.getByText("Aucun créneau ce jour-là.")).toBeInTheDocument();
    expect(screen.queryByText("Créneau réservé")).not.toBeInTheDocument();
  });

  it("tap deux fois sur le même jour referme le panneau (aucun panneau affiché)", () => {
    mockMobileViewport(true);
    renderCalendrier({ mode: "mois", annee: 2026, mois: 3 }, []);

    act(() => {
      capturedProps.dateClick?.({ dateStr: "2026-03-05" });
    });
    expect(screen.getByText("Aucun créneau ce jour-là.")).toBeInTheDocument();

    act(() => {
      capturedProps.dateClick?.({ dateStr: "2026-03-05" });
    });
    expect(screen.queryByText("Aucun créneau ce jour-là.")).not.toBeInTheDocument();
  });

  it("aucun panneau n'est affiché avant tout tap (état initial)", () => {
    mockMobileViewport(true);
    renderCalendrier({ mode: "mois", annee: 2026, mois: 3 }, []);

    expect(screen.queryByText("Aucun créneau ce jour-là.")).not.toBeInTheDocument();
  });
});
