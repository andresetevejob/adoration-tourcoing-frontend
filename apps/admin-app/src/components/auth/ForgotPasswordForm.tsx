import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { ForgotPasswordRequest } from "@chapelle/shared/types";
import { forgotPasswordSchema } from "@chapelle/shared/utils";
import { Button, Input } from "@chapelle/shared/ui";

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  isSubmitting: boolean;
  onSubmit: (dto: ForgotPasswordRequest) => void;
}

export function ForgotPasswordForm({ isSubmitting, onSubmit }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  function submit(values: ForgotPasswordFormValues): void {
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
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Envoyer le lien de réinitialisation
      </Button>
    </form>
  );
}
