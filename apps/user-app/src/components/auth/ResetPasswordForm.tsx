import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { resetPasswordSchema } from "@chapelle/shared/utils";
import { Button, Input } from "@chapelle/shared/ui";

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  isSubmitting: boolean;
  onSubmit: (values: ResetPasswordFormValues) => void;
}

export function ResetPasswordForm({ isSubmitting, onSubmit }: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  function submit(values: ResetPasswordFormValues): void {
    onSubmit(values);
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <Input
        label="Nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <Input
        label="Confirmation"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Réinitialiser le mot de passe
      </Button>
    </form>
  );
}
