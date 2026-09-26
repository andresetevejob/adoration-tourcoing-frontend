import { describe, expect, it } from "vitest";
import { UserRole, type PlanningEntryResponse } from "@chapelle/shared/types";
import { filterOwnEntries, mapPlanningEntriesToEvents, mapPlanningEntryToEvent } from "./planningEntries";

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

describe("mapPlanningEntryToEvent (user-app)", () => {
  it("affiche l'identité complète et isMine=true quand estAnonymise=false", () => {
    const event = mapPlanningEntryToEvent(entry({ estAnonymise: false }));

    expect(event).toEqual({
      id: "e1",
      start: "2026-01-01T10:00:00Z",
      end: "2026-01-01T11:00:00Z",
      title: "Jean Dupont",
      classNames: ["planning-event--mine"],
      extendedProps: { roleUtilisateur: UserRole.VEILLEUR, isMine: true },
    });
  });

  it("anonymise le titre et isMine=false quand estAnonymise=true", () => {
    const event = mapPlanningEntryToEvent(entry({ estAnonymise: true }));

    expect(event.title).toBe("Créneau réservé");
    expect(event.classNames).toEqual([]);
    expect(event.extendedProps.isMine).toBe(false);
  });
});

describe("mapPlanningEntriesToEvents (user-app)", () => {
  it("mappe chaque entrée", () => {
    const events = mapPlanningEntriesToEvents([
      entry({ id: "e1" }),
      entry({ id: "e2", estAnonymise: true }),
    ]);

    expect(events.map((e) => e.id)).toEqual(["e1", "e2"]);
    expect(events[1].title).toBe("Créneau réservé");
  });

  it("retourne un tableau vide pour une liste vide", () => {
    expect(mapPlanningEntriesToEvents([])).toEqual([]);
  });
});

describe("filterOwnEntries", () => {
  it("ne conserve que les entrées dont idUtilisateur correspond", () => {
    const entries = [
      entry({ id: "e1", idUtilisateur: "u1" }),
      entry({ id: "e2", idUtilisateur: "u2" }),
    ];

    expect(filterOwnEntries(entries, "u1").map((e) => e.id)).toEqual(["e1"]);
  });

  it("retourne un tableau vide si aucune entrée ne correspond", () => {
    const entries = [entry({ id: "e1", idUtilisateur: "u2" })];

    expect(filterOwnEntries(entries, "u1")).toEqual([]);
  });
});
