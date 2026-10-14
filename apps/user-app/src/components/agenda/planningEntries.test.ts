import { describe, expect, it } from "vitest";
import { UserRole, type PlanningEntryResponse } from "@chapelle/shared/types";
import {
  filterEntriesByDay,
  filterOwnEntries,
  mapPlanningEntriesToEvents,
  mapPlanningEntryToEvent,
} from "./planningEntries";

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
  it("ne révèle jamais l'identité sur le titre, et pose isMine=true quand estAnonymise=false", () => {
    const event = mapPlanningEntryToEvent(entry({ estAnonymise: false }));

    expect(event).toEqual({
      id: "e1",
      start: "2026-01-01T10:00:00Z",
      end: "2026-01-01T11:00:00Z",
      title: "Créneau réservé",
      classNames: ["planning-event--mine"],
      extendedProps: { roleUtilisateur: UserRole.VEILLEUR, isMine: true },
    });
  });

  it("pose isMine=false quand estAnonymise=true (titre déjà générique dans les deux cas)", () => {
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

// Construit la date `dateISO` attendue à partir des mêmes composants locaux (année/mois/jour)
// que ceux utilisés pour fabriquer les `Date` des entrées ci-dessous — indépendant du fuseau
// d'exécution de la machine qui lance les tests (cf. commentaire de `localDateKey` dans
// `planningEntries.ts` : le calcul repose volontairement sur les accesseurs *locaux*).
function isoDateString(year: number, month: number, day: number): string {
  return `${String(year)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

describe("filterEntriesByDay", () => {
  it("ne conserve que les entrées dont dateDebut tombe sur dateISO, triées chronologiquement", () => {
    const dayLate = new Date(2026, 0, 15, 14, 0); // 15 janvier 2026, 14h heure locale
    const dayEarly = new Date(2026, 0, 15, 9, 0);
    const otherDay = new Date(2026, 0, 16, 9, 0);

    const entries = [
      entry({ id: "late", dateDebut: dayLate.toISOString() }),
      entry({ id: "early", dateDebut: dayEarly.toISOString() }),
      entry({ id: "other-day", dateDebut: otherDay.toISOString() }),
    ];

    const result = filterEntriesByDay(entries, isoDateString(2026, 1, 15));

    expect(result.map((e) => e.id)).toEqual(["early", "late"]);
  });

  it("retourne un tableau vide si aucune entrée ne tombe sur dateISO", () => {
    const entries = [entry({ dateDebut: new Date(2026, 0, 15, 10, 0).toISOString() })];

    expect(filterEntriesByDay(entries, isoDateString(2026, 1, 16))).toEqual([]);
  });

  it("retourne un tableau vide pour une liste vide", () => {
    expect(filterEntriesByDay([], isoDateString(2026, 1, 15))).toEqual([]);
  });
});
