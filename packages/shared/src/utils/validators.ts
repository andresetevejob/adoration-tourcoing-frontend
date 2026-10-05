import { z } from "zod";
import { UserRole } from "../types/user";
import { PASSWORD_MIN_LENGTH, PHOTO_ACCEPTED_MIME_TYPES, PHOTO_MAX_SIZE_BYTES, TELEPHONE_PATTERN } from "./constants";

export const emailSchema = z.string().email();

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/);

export const nomSchema = z.string().max(255);

export const prenomsSchema = z.string().max(255);

export const telephoneSchema = z.string().regex(TELEPHONE_PATTERN).optional().or(z.literal(""));

export const roleSchema = z.nativeEnum(UserRole);

export const photoSchema = z.custom<FileList | undefined>().optional();

export function validatePhotoForRole(
  role: UserRole,
  photo: FileList | undefined,
  ctx: z.RefinementCtx,
): void {
  if (role !== UserRole.VEILLEUR) return;
  const file = photo?.[0];
  if (!file) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La photo est obligatoire pour un compte Veilleur",
      path: ["photo"],
    });
    return;
  }
  if (!PHOTO_ACCEPTED_MIME_TYPES.includes(file.type)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Format de photo non supporté (jpeg ou png uniquement)",
      path: ["photo"],
    });
  }
  if (file.size > PHOTO_MAX_SIZE_BYTES) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La photo ne doit pas dépasser 5 Mo",
      path: ["photo"],
    });
  }
}

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
    photo: photoSchema,
  })
  .superRefine((data, ctx) => {
    validatePhotoForRole(data.role, data.photo, ctx);
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
