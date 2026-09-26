import { describe, expect, it } from "vitest";
import { API_TIMEOUT_MS, DEFAULT_PAGE_SIZE, PASSWORD_MIN_LENGTH, TELEPHONE_PATTERN } from "./constants";

describe("constants", () => {
  it("expose les valeurs attendues (non-régression)", () => {
    expect(API_TIMEOUT_MS).toBe(15000);
    expect(DEFAULT_PAGE_SIZE).toBe(20);
    expect(PASSWORD_MIN_LENGTH).toBe(8);
  });

  describe("TELEPHONE_PATTERN", () => {
    it("accepte un numéro français à 10 chiffres", () => {
      expect(TELEPHONE_PATTERN.test("0612345678")).toBe(true);
    });

    it("accepte un numéro au format international avec +", () => {
      expect(TELEPHONE_PATTERN.test("+33612345678")).toBe(true);
    });

    it("rejette un numéro trop court", () => {
      expect(TELEPHONE_PATTERN.test("123")).toBe(false);
    });

    it("rejette un numéro contenant des lettres", () => {
      expect(TELEPHONE_PATTERN.test("06abcd5678")).toBe(false);
    });

    it("rejette un numéro trop long (>15 chiffres)", () => {
      expect(TELEPHONE_PATTERN.test("+123456789012345678")).toBe(false);
    });
  });
});
