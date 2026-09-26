import { z } from "zod";
import { UserRole } from "../types/user";
import { PASSWORD_MIN_LENGTH, TELEPHONE_PATTERN } from "./constants";

export const emailSchema = z.string().email();

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/);

export const nomSchema = z.string().max(255);

export const prenomsSchema = z.string().max(255);

export const telephoneSchema = z.string().regex(TELEPHONE_PATTERN).optional().or(z.literal(""));

export const roleSchema = z.nativeEnum(UserRole);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    nom: nomSchema,
    prenoms: prenomsSchema,
    telephone: telephoneSchema,
    role: z.enum([UserRole.ADORATEUR, UserRole.VEILLEUR]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  email: emailSchema,
  nom: nomSchema,
  prenoms: prenomsSchema,
  telephone: telephoneSchema,
});

export const bookingSchema = z
  .object({
    idUtilisateur: z.string().optional(),
    dateDebut: z.string().datetime(),
    dateFin: z.string().datetime(),
    description: z.string().max(1000).optional(),
  })
  .refine((data) => new Date(data.dateDebut) < new Date(data.dateFin), {
    message: "La date de début doit précéder la date de fin",
    path: ["dateFin"],
  })
  .refine((data) => new Date(data.dateDebut) >= new Date(), {
    message: "La date de début doit être future",
    path: ["dateDebut"],
  });
