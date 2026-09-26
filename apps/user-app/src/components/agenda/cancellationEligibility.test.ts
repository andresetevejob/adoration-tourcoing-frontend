import { describe, expect, it } from "vitest";
import { canCancelBooking } from "./cancellationEligibility";

describe("components/agenda/cancellationEligibility (user-app)", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  it("retourne true quand le début est à plus de 24h de maintenant", () => {
    expect(canCancelBooking("2026-01-02T00:00:01Z", now)).toBe(true);
  });

  it("retourne true à exactement 24h (limite inclusive)", () => {
    expect(canCancelBooking("2026-01-02T00:00:00Z", now)).toBe(true);
  });

  it("retourne false quand le début est à moins de 24h de maintenant", () => {
    expect(canCancelBooking("2026-01-01T23:59:59Z", now)).toBe(false);
  });

  it("retourne false quand le début est déjà passé", () => {
    expect(canCancelBooking("2025-12-31T00:00:00Z", now)).toBe(false);
  });
});
