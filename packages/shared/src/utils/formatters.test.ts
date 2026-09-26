import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatTime } from "./formatters";

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
