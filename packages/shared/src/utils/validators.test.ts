import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { UserRole } from "../types/user";
import {
  bookingSchema,
  emailSchema,
  loginSchema,
  nomSchema,
  passwordSchema,
  photoSchema,
  prenomsSchema,
  registerSchema,
  roleSchema,
  telephoneSchema,
  updateProfileSchema,
  validatePhotoForRole,
} from "./validators";

function makeFileList(files: File[]): FileList {
  return {
    ...files,
    length: files.length,
    item: (index: number) => files[index] ?? null,
    [Symbol.iterator]: files[Symbol.iterator].bind(files),
  } as unknown as FileList;
}

function runValidatePhotoForRole(role: UserRole, photo: FileList | undefined) {
  const issues: { message?: string; path: (string | number)[] }[] = [];
  const ctx = {
    addIssue: (issue: { message?: string; path?: (string | number)[] }) => {
      issues.push({ message: issue.message, path: issue.path ?? [] });
    },
  } as unknown as z.RefinementCtx;
  validatePhotoForRole(role, photo, ctx);
  return issues;
}

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

describe("photoSchema", () => {
  it("accepte undefined (champ optionnel)", () => {
    expect(photoSchema.safeParse(undefined).success).toBe(true);
  });

  it("accepte une FileList", () => {
    const file = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    expect(photoSchema.safeParse(makeFileList([file])).success).toBe(true);
  });
});

describe("validatePhotoForRole", () => {
  it("ne remonte aucune erreur quand le rôle n'est pas VEILLEUR, même sans photo", () => {
    expect(runValidatePhotoForRole(UserRole.ADORATEUR, undefined)).toEqual([]);
  });

  it("ne remonte aucune erreur pour un rôle ADMINISTRATEUR sans photo", () => {
    expect(runValidatePhotoForRole(UserRole.ADMINISTRATEUR, undefined)).toEqual([]);
  });

  it("exige une photo quand le rôle est VEILLEUR", () => {
    const issues = runValidatePhotoForRole(UserRole.VEILLEUR, undefined);
    expect(issues).toEqual([
      { message: "La photo est obligatoire pour un compte Veilleur", path: ["photo"] },
    ]);
  });

  it("exige une photo quand le rôle est VEILLEUR et la FileList est vide", () => {
    const issues = runValidatePhotoForRole(UserRole.VEILLEUR, makeFileList([]));
    expect(issues).toEqual([
      { message: "La photo est obligatoire pour un compte Veilleur", path: ["photo"] },
    ]);
  });

  it("rejette un type MIME non supporté pour un Veilleur", () => {
    const file = new File(["contenu"], "photo.gif", { type: "image/gif" });
    const issues = runValidatePhotoForRole(UserRole.VEILLEUR, makeFileList([file]));
    expect(issues).toEqual([
      { message: "Format de photo non supporté (jpeg ou png uniquement)", path: ["photo"] },
    ]);
  });

  it("rejette une photo de plus de 5 Mo pour un Veilleur", () => {
    const file = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 + 1 });
    const issues = runValidatePhotoForRole(UserRole.VEILLEUR, makeFileList([file]));
    expect(issues).toEqual([{ message: "La photo ne doit pas dépasser 5 Mo", path: ["photo"] }]);
  });

  it("accepte une photo jpeg valide de taille correcte pour un Veilleur", () => {
    const file = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    expect(runValidatePhotoForRole(UserRole.VEILLEUR, makeFileList([file]))).toEqual([]);
  });

  it("accepte une photo png valide de taille correcte pour un Veilleur", () => {
    const file = new File(["contenu"], "photo.png", { type: "image/png" });
    expect(runValidatePhotoForRole(UserRole.VEILLEUR, makeFileList([file]))).toEqual([]);
  });

  it("accepte une photo exactement à 5 Mo (limite incluse)", () => {
    const file = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 });
    expect(runValidatePhotoForRole(UserRole.VEILLEUR, makeFileList([file]))).toEqual([]);
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

  it("accepte un Adorateur sans photo", () => {
    expect(registerSchema.safeParse({ ...base, role: UserRole.ADORATEUR }).success).toBe(true);
  });

  it("rejette un Veilleur sans photo", () => {
    const result = registerSchema.safeParse({ ...base, role: UserRole.VEILLEUR });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) =>
            issue.path[0] === "photo" &&
            issue.message === "La photo est obligatoire pour un compte Veilleur",
        ),
      ).toBe(true);
    }
  });

  it("accepte un Veilleur avec une photo jpeg valide", () => {
    const file = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    const result = registerSchema.safeParse({
      ...base,
      role: UserRole.VEILLEUR,
      photo: makeFileList([file]),
    });
    expect(result.success).toBe(true);
  });

  it("rejette un Veilleur avec une photo de type non supporté", () => {
    const file = new File(["contenu"], "photo.gif", { type: "image/gif" });
    const result = registerSchema.safeParse({
      ...base,
      role: UserRole.VEILLEUR,
      photo: makeFileList([file]),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  const base = {
    email: "adorateur@example.com",
    nom: "Dupont",
    prenoms: "Jean",
    telephone: "0612345678",
  };

  it("valide un profil complet cohérent", () => {
    expect(updateProfileSchema.safeParse(base).success).toBe(true);
  });

  it("accepte un téléphone vide (champ optionnel)", () => {
    expect(updateProfileSchema.safeParse({ ...base, telephone: "" }).success).toBe(true);
  });

  it("n'exige ni password ni confirmPassword ni role", () => {
    const result = updateProfileSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("password");
      expect(result.data).not.toHaveProperty("role");
    }
  });

  it("rejette un email invalide", () => {
    const result = updateProfileSchema.safeParse({ ...base, email: "pas-un-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "email")).toBe(true);
    }
  });

  it("rejette un nom de plus de 255 caractères", () => {
    const result = updateProfileSchema.safeParse({ ...base, nom: "a".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejette un téléphone mal formé", () => {
    const result = updateProfileSchema.safeParse({ ...base, telephone: "abc123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "telephone")).toBe(true);
    }
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
