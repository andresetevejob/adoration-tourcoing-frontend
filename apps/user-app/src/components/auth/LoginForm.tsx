import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ApiError } from "@chapelle/shared/api";
import type { AuthResponse } from "@chapelle/shared/types";
import { loginSchema } from "@chapelle/shared/utils";
import { Button, Input, useToast } from "@chapelle/shared/ui";
import { useAuth } from "../../hooks/useAuth";

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  onSuccess: (response: AuthResponse) => void;
}

const INVALID_CREDENTIALS_MESSAGE = "Identifiants invalides ou compte non encore validé.";
const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const { show } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues): Promise<void> {
    setFormError(null);
    try {
      const response = await login(values);
      onSuccess(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setFormError(INVALID_CREDENTIALS_MESSAGE);
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
      <Input
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {formError && (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        Se connecter
      </Button>
    </form>
  );
}
