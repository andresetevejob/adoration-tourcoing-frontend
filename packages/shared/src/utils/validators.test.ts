import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "../types/user";
import {
  bookingSchema,
  emailSchema,
  loginSchema,
  nomSchema,
  passwordSchema,
  prenomsSchema,
  registerSchema,
  roleSchema,
  telephoneSchema,
} from "./validators";

describe("emailSchema", () => {
  it("accepte un email valide", () => {
    expect(emailSchema.safeParse("adorateur@example.com").success).toBe(true);
  });

  it("rejette une chaîne sans arobase", () => {
    expect(emailSchema.safeParse("pas-un-email").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepte un mot de passe avec chiffre et caractère spécial (>= 8 caractères)", () => {
    expect(passwordSchema.safeParse("Azerty1!").success).toBe(true);
  });

  it("rejette un mot de passe trop court", () => {
    expect(passwordSchema.safeParse("Az1!").success).toBe(false);
  });

  it("rejette un mot de passe sans chiffre", () => {
    expect(passwordSchema.safeParse("Azertyui!").success).toBe(false);
  });

  it("rejette un mot de passe sans caractère spécial", () => {
    expect(passwordSchema.safeParse("Azertyui1").success).toBe(false);
  });
});

describe("nomSchema / prenomsSchema", () => {
  it("accepte une chaîne de longueur raisonnable", () => {
    expect(nomSchema.safeParse("Dupont").success).toBe(true);
    expect(prenomsSchema.safeParse("Jean-Michel").success).toBe(true);
  });

  it("rejette une chaîne de plus de 255 caractères", () => {
    const tropLong = "a".repeat(256);
    expect(nomSchema.safeParse(tropLong).success).toBe(false);
    expect(prenomsSchema.safeParse(tropLong).success).toBe(false);
  });

  it("accepte exactement 255 caractères", () => {
    expect(nomSchema.safeParse("a".repeat(255)).success).toBe(true);
  });
});

describe("telephoneSchema", () => {
  it("accepte un numéro français valide", () => {
    expect(telephoneSchema.safeParse("0612345678").success).toBe(true);
  });

  it("accepte une chaîne vide (champ optionnel)", () => {
    expect(telephoneSchema.safeParse("").success).toBe(true);
  });

  it("accepte undefined (champ optionnel)", () => {
    expect(telephoneSchema.safeParse(undefined).success).toBe(true);
  });

  it("rejette un numéro mal formé", () => {
    expect(telephoneSchema.safeParse("abc123").success).toBe(false);
  });
});

describe("roleSchema", () => {
  it("accepte les valeurs de l'enum UserRole", () => {
    expect(roleSchema.safeParse(UserRole.ADORATEUR).success).toBe(true);
    expect(roleSchema.safeParse(UserRole.VEILLEUR).success).toBe(true);
    expect(roleSchema.safeParse(UserRole.ADMINISTRATEUR).success).toBe(true);
  });

  it("rejette une valeur hors énumération", () => {
    expect(roleSchema.safeParse("INCONNU").success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("valide un couple email/password non vide", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "whatever" });
    expect(result.success).toBe(true);
  });

  it("rejette un email invalide", () => {
    const result = loginSchema.safeParse({ email: "invalide", password: "whatever" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    email: "adorateur@example.com",
    password: "Azerty1!",
    confirmPassword: "Azerty1!",
    nom: "Dupont",
    prenoms: "Jean",
    telephone: "0612345678",
    role: UserRole.ADORATEUR,
  };

  it("valide un formulaire complet cohérent", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejette quand confirmPassword ne correspond pas au password", () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: "Autre1!" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejette un role hors ADORATEUR/VEILLEUR", () => {
    const result = registerSchema.safeParse({ ...base, role: UserRole.ADMINISTRATEUR });
    expect(result.success).toBe(false);
  });

  it("accepte un téléphone vide", () => {
    expect(registerSchema.safeParse({ ...base, telephone: "" }).success).toBe(true);
  });
});

describe("bookingSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-26T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("valide une réservation future avec dateDebut < dateFin", () => {
    const result = bookingSchema.safeParse({
      dateDebut: "2026-09-27T10:00:00Z",
      dateFin: "2026-09-27T11:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejette quand dateDebut est postérieure à dateFin", () => {
    const result = bookingSchema.safeParse({
      dateDebut: "2026-09-27T12:00:00Z",
      dateFin: "2026-09-27T11:00:00Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "dateFin")).toBe(true);
    }
  });

  it("rejette une dateDebut dans le passé", () => {
    const result = bookingSchema.safeParse({
      dateDebut: "2026-09-25T10:00:00Z",
      dateFin: "2026-09-27T11:00:00Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "dateDebut")).toBe(true);
    }
  });

  it("rejette une description de plus de 1000 caractères", () => {
    const result = bookingSchema.safeParse({
      dateDebut: "2026-09-27T10:00:00Z",
      dateFin: "2026-09-27T11:00:00Z",
      description: "a".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("rejette une date non ISO", () => {
    const result = bookingSchema.safeParse({
      dateDebut: "pas-une-date",
      dateFin: "2026-09-27T11:00:00Z",
    });
    expect(result.success).toBe(false);
  });
});
