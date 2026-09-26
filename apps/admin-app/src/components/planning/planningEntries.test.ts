import { describe, expect, it } from "vitest";
import { UserRole, type PlanningEntryResponse } from "@chapelle/shared/types";
import { mapPlanningEntriesToEvents, mapPlanningEntryToEvent } from "./planningEntries";

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

describe("mapPlanningEntryToEvent (admin-app)", () => {
  it("affiche toujours l'identité complète, même si estAnonymise=true", () => {
    const event = mapPlanningEntryToEvent(entry({ estAnonymise: true }));

    expect(event.title).toBe("Jean Dupont");
  });

  it("isMine est toujours false", () => {
    const event = mapPlanningEntryToEvent(entry({ estAnonymise: false }));

    expect(event.extendedProps.isMine).toBe(false);
    expect(event.classNames).toEqual([]);
  });

  it("conserve id/start/end/roleUtilisateur", () => {
    const event = mapPlanningEntryToEvent(entry());

    expect(event).toMatchObject({
      id: "e1",
      start: "2026-01-01T10:00:00Z",
      end: "2026-01-01T11:00:00Z",
      extendedProps: { roleUtilisateur: UserRole.VEILLEUR },
    });
  });
});

describe("mapPlanningEntriesToEvents (admin-app)", () => {
  it("mappe chaque entrée", () => {
    const events = mapPlanningEntriesToEvents([entry({ id: "e1" }), entry({ id: "e2" })]);

    expect(events.map((e) => e.id)).toEqual(["e1", "e2"]);
  });

  it("retourne un tableau vide pour une liste vide", () => {
    expect(mapPlanningEntriesToEvents([])).toEqual([]);
  });
});
