import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { UpdateUserRequest } from "@chapelle/shared/types";
import { updateProfileSchema } from "@chapelle/shared/utils";
import { Button, Input } from "@chapelle/shared/ui";

export type ProfileEditFormValues = z.infer<typeof updateProfileSchema>;

export interface ProfileEditFormProps {
  defaultValues: ProfileEditFormValues;
  onSubmit: (dto: UpdateUserRequest) => void;
  isSubmitting: boolean;
}

export function ProfileEditForm({ defaultValues, onSubmit, isSubmitting }: ProfileEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  });

  function submit(values: ProfileEditFormValues): void {
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
      {/* Champ requis par UpdateUserRequest mais non modifiable depuis cette page (US-AUTH-07). */}
      <Input
        label="Email"
        type="email"
        disabled
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
      <Button type="submit" isLoading={isSubmitting}>
        Enregistrer
      </Button>
    </form>
  );
}
