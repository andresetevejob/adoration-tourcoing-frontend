import { describe, expect, it } from "vitest";
import { periodeCacheKey } from "./planningPeriode";

describe("hooks/planningPeriode (user-app)", () => {
  describe("periodeCacheKey", () => {
    it("mode jour : préfixe « jour: » suivi de la date", () => {
      expect(periodeCacheKey({ mode: "jour", date: "2026-01-01" })).toBe("jour:2026-01-01");
    });

    it("mode mois : préfixe « mois: » suivi de l'année et du mois sur 2 chiffres", () => {
      expect(periodeCacheKey({ mode: "mois", annee: 2026, mois: 3 })).toBe("mois:2026-03");
    });

    it("mode mois : le mois n'est pas re-tronqué s'il est déjà sur 2 chiffres", () => {
      expect(periodeCacheKey({ mode: "mois", annee: 2026, mois: 12 })).toBe("mois:2026-12");
    });

    it("mode intervalle : préfixe « intervalle: » suivi des deux dates", () => {
      expect(
        periodeCacheKey({ mode: "intervalle", dateDebut: "2026-01-01", dateFin: "2026-01-10" }),
      ).toBe("intervalle:2026-01-01:2026-01-10");
    });

    it("produit des clés distinctes pour des modes différents portant la même date", () => {
      const jour = periodeCacheKey({ mode: "jour", date: "2026-01-01" });
      const intervalle = periodeCacheKey({
        mode: "intervalle",
        dateDebut: "2026-01-01",
        dateFin: "2026-01-01",
      });
      expect(jour).not.toBe(intervalle);
    });
  });
});
