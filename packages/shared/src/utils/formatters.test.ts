import { afterEach, describe, expect, it, vi } from "vitest";
import {
  diffJoursInclusif,
  exceedsMaxDuration,
  formatDate,
  formatDateTime,
  formatTime,
  toISODateString,
  toParisISOString,
} from "./formatters";

describe("formatDate", () => {
  it("formate une date d'été (CEST, UTC+2) en dd/MM/yyyy Europe/Paris", () => {
    // 2026-09-26T22:30:00Z -> 27/09/2026 00:30 à Paris (CEST, UTC+2)
    expect(formatDate("2026-09-26T22:30:00Z")).toBe("27/09/2026");
  });

  it("formate une date d'hiver (CET, UTC+1)", () => {
    // 2026-01-15T23:30:00Z -> 16/01/2026 00:30 à Paris (CET, UTC+1)
    expect(formatDate("2026-01-15T23:30:00Z")).toBe("16/01/2026");
  });

  it("accepte un objet Date en entrée", () => {
    expect(formatDate(new Date("2026-06-01T08:00:00Z"))).toBe("01/06/2026");
  });
});

describe("formatDateTime", () => {
  it("formate en dd/MM/yyyy HH:mm sans virgule résiduelle", () => {
    const result = formatDateTime("2026-09-26T10:15:00Z");
    expect(result).not.toContain(",");
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });

  it("convertit correctement l'heure UTC vers Europe/Paris (été, +2h)", () => {
    // 10:15 UTC -> 12:15 Paris en septembre (CEST)
    expect(formatDateTime("2026-09-26T10:15:00Z")).toBe("26/09/2026 12:15");
  });

  it("convertit correctement l'heure UTC vers Europe/Paris (hiver, +1h)", () => {
    // 10:00 UTC -> 11:00 Paris en janvier (CET)
    expect(formatDateTime("2026-01-15T10:00:00Z")).toBe("15/01/2026 11:00");
  });
});

describe("formatTime", () => {
  it("formate en HH:mm", () => {
    expect(formatTime("2026-09-26T10:15:00Z")).toMatch(/^\d{2}:\d{2}$/);
  });

  it("applique le fuseau Europe/Paris", () => {
    expect(formatTime("2026-09-26T10:15:00Z")).toBe("12:15");
  });
});

describe("toISODateString", () => {
  it("formate une date en yyyy-MM-dd (fuseau Europe/Paris)", () => {
    expect(toISODateString(new Date("2026-06-01T08:00:00Z"))).toBe("2026-06-01");
  });

  it("applique le fuseau Europe/Paris près de minuit (été, +2h)", () => {
    // 2026-09-26T22:30:00Z -> 27/09/2026 00:30 à Paris (CEST, UTC+2)
    expect(toISODateString(new Date("2026-09-26T22:30:00Z"))).toBe("2026-09-27");
  });

  it("applique le fuseau Europe/Paris près de minuit (hiver, +1h)", () => {
    // 2026-01-15T23:30:00Z -> 16/01/2026 00:30 à Paris (CET, UTC+1)
    expect(toISODateString(new Date("2026-01-15T23:30:00Z"))).toBe("2026-01-16");
  });
});

describe("diffJoursInclusif", () => {
  it("retourne 1 pour deux fois la même date (bornes incluses)", () => {
    expect(diffJoursInclusif("2026-01-01", "2026-01-01")).toBe(1);
  });

  it("retourne 2 pour deux jours consécutifs", () => {
    expect(diffJoursInclusif("2026-01-01", "2026-01-02")).toBe(2);
  });

  it("retourne 31 pour un intervalle de 31 jours (janvier complet)", () => {
    expect(diffJoursInclusif("2026-01-01", "2026-01-31")).toBe(31);
  });

  it("retourne une valeur négative sans lever d'erreur quand dateFin précède dateDebut", () => {
    expect(diffJoursInclusif("2026-01-05", "2026-01-01")).toBe(-3);
  });
});

describe("exceedsMaxDuration", () => {
  it("retourne false pour une durée courte (1h)", () => {
    expect(exceedsMaxDuration("2026-01-01T10:00:00Z", "2026-01-01T11:00:00Z")).toBe(false);
  });

  it("retourne false pour une durée de exactement 24h (borne incluse)", () => {
    expect(exceedsMaxDuration("2026-01-01T10:00:00Z", "2026-01-02T10:00:00Z")).toBe(false);
  });

  it("retourne true pour une durée dépassant 24h d'une seconde", () => {
    expect(exceedsMaxDuration("2026-01-01T10:00:00Z", "2026-01-02T10:00:01Z")).toBe(true);
  });

  it("applique un maxHeures personnalisé", () => {
    expect(exceedsMaxDuration("2026-01-01T10:00:00Z", "2026-01-01T11:00:00Z", 1)).toBe(false);
    expect(exceedsMaxDuration("2026-01-01T10:00:00Z", "2026-01-01T11:00:01Z", 1)).toBe(true);
  });
});

describe("toParisISOString", () => {
  it("formate une date d'hiver en ISO 8601 complet avec offset +01:00 (CET)", () => {
    // 2026-01-15T10:00:00Z -> 11:00:00 à Paris (CET, UTC+1)
    expect(toParisISOString(new Date("2026-01-15T10:00:00Z"))).toBe("2026-01-15T11:00:00+01:00");
  });

  it("formate une date d'été en ISO 8601 complet avec offset +02:00 (CEST)", () => {
    // 2026-09-26T10:15:00Z -> 12:15:00 à Paris (CEST, UTC+2)
    expect(toParisISOString(new Date("2026-09-26T10:15:00Z"))).toBe("2026-09-26T12:15:00+02:00");
  });

  it("bascule l'offset de +01:00 à +02:00 au passage à l'heure d'été (dernier dimanche de mars)", () => {
    // La bascule 2026 a lieu à 2026-03-29T01:00:00Z (02:00 CET -> 03:00 CEST)
    // Juste avant : encore en CET (+01:00)
    expect(toParisISOString(new Date("2026-03-29T00:59:00Z"))).toBe("2026-03-29T01:59:00+01:00");
    // Juste après : déjà en CEST (+02:00)
    expect(toParisISOString(new Date("2026-03-29T01:00:00Z"))).toBe("2026-03-29T03:00:00+02:00");
  });

  it("bascule l'offset de +02:00 à +01:00 au retour à l'heure d'hiver (dernier dimanche d'octobre)", () => {
    // La bascule 2026 a lieu à 2026-10-25T01:00:00Z (03:00 CEST -> 02:00 CET)
    // Juste avant : encore en CEST (+02:00)
    expect(toParisISOString(new Date("2026-10-25T00:59:00Z"))).toBe("2026-10-25T02:59:00+02:00");
    // Juste après : déjà en CET (+01:00)
    expect(toParisISOString(new Date("2026-10-25T01:00:00Z"))).toBe("2026-10-25T02:00:00+01:00");
  });

  describe("format d'offset inattendu (getParisOffset)", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("lève une erreur explicite plutôt qu'un fallback silencieux à +00:00 si le format Intl diverge", () => {
      // Simule un moteur ICU dont `timeZoneName: "shortOffset"` renvoie un format
      // ne correspondant pas au pattern "GMT±H"/"GMT±HH:MM" attendu (ex. "UTC+1").
      const original = Intl.DateTimeFormat.prototype.formatToParts;
      vi.spyOn(Intl.DateTimeFormat.prototype, "formatToParts").mockImplementation(function (
        this: Intl.DateTimeFormat,
        date?: number | Date,
      ) {
        if (this.resolvedOptions().timeZoneName === "shortOffset") {
          return [{ type: "timeZoneName", value: "UTC+1" }] as Intl.DateTimeFormatPart[];
        }
        return original.call(this, date);
      });

      expect(() => toParisISOString(new Date("2026-01-15T10:00:00Z"))).toThrow(/getParisOffset/);
    });
  });
});
