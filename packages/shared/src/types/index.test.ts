import { describe, expect, it } from "vitest";
import { StatutAnnonce, StatutReservation, StatutValidation, UserRole } from "./index";

describe("enums exportés (non-régression des valeurs runtime consommées par l'API)", () => {
  it("UserRole", () => {
    expect(UserRole.ADORATEUR).toBe("ADORATEUR");
    expect(UserRole.VEILLEUR).toBe("VEILLEUR");
    expect(UserRole.ADMINISTRATEUR).toBe("ADMINISTRATEUR");
    expect(UserRole.SUPERADMINISTRATEUR).toBe("SUPERADMINISTRATEUR");
  });

  it("StatutValidation", () => {
    expect(StatutValidation.EN_ATTENTE).toBe("EN_ATTENTE");
    expect(StatutValidation.VALIDE).toBe("VALIDE");
    expect(StatutValidation.REJETE).toBe("REJETE");
  });

  it("StatutReservation", () => {
    expect(StatutReservation.EFFECTUEE).toBe("EFFECTUEE");
    expect(StatutReservation.ANNULEE).toBe("ANNULEE");
  });

  it("StatutAnnonce", () => {
    expect(StatutAnnonce.BROUILLON).toBe("BROUILLON");
    expect(StatutAnnonce.PUBLIE).toBe("PUBLIE");
    expect(StatutAnnonce.DEPUBLIE).toBe("DEPUBLIE");
  });
});
