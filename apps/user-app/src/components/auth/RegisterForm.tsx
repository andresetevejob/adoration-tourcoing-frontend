import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ApiError } from "@chapelle/shared/api";
import type { AuthResponse, RegisterRequest } from "@chapelle/shared/types";
import { UserRole } from "@chapelle/shared/types";
import { registerSchema } from "@chapelle/shared/utils";
import { Button, Input, Select, useToast } from "@chapelle/shared/ui";
import { useAuth } from "../../hooks/useAuth";

export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  onSuccess: (response: AuthResponse) => void;
}

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

const ROLE_OPTIONS = [
  { value: UserRole.ADORATEUR, label: "Adorateur" },
  { value: UserRole.VEILLEUR, label: "Veilleur" },
];

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: registerUser } = useAuth();
  const { show } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: UserRole.ADORATEUR },
  });

  async function onSubmit(values: RegisterFormValues): Promise<void> {
    // `confirmPassword` ne sert qu'à la validation côté client (registerSchema.refine) :
    // il n'est jamais transmis au backend, `dto` est construit champ par champ plutôt
    // que par déstructuration pour l'exclure explicitement.
    const dto: RegisterRequest = {
      email: values.email,
      password: values.password,
      nom: values.nom,
      prenoms: values.prenoms,
      telephone: values.telephone,
      role: values.role,
    };
    try {
      const response = await registerUser(dto);
      onSuccess(response);
    } catch (error) {
      if (error instanceof ApiError) {
        show(error.message || GENERIC_ERROR_MESSAGE, "error");
        return;
      }
      show(GENERIC_ERROR_MESSAGE, "error");
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nom" error={errors.nom?.message} {...register("nom")} />
        <Input label="Prénoms" error={errors.prenoms?.message} {...register("prenoms")} />
      </div>
      <Input
        label="Téléphone"
        type="tel"
        error={errors.telephone?.message}
        {...register("telephone")}
      />
      <Select
        label="Je m'inscris comme"
        options={ROLE_OPTIONS}
        error={errors.role?.message}
        {...register("role")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirmation"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>
      <Button type="submit" isLoading={isSubmitting}>
        S'inscrire
      </Button>
    </form>
  );
}
