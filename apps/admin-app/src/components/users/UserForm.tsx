import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreateUserRequest, UpdateUserRequest } from "@chapelle/shared/types";
import { UserRole } from "@chapelle/shared/types";
import {
  emailSchema,
  nomSchema,
  passwordSchema,
  photoSchema,
  PHOTO_ACCEPTED_MIME_TYPES,
  prenomsSchema,
  telephoneSchema,
  validatePhotoForRole,
} from "@chapelle/shared/utils";
import { Button, FileInput, Input, Select } from "@chapelle/shared/ui";

export type UserFormProps =
  | {
      mode: "create";
      roleOptions: { value: UserRole; label: string }[];
      isSubmitting: boolean;
      onSubmit: (dto: CreateUserRequest, photo?: File) => void;
      onCancel: () => void;
    }
  | {
      mode: "edit";
      roleOptions: { value: UserRole; label: string }[];
      defaultValues: { email: string; nom: string; prenoms: string; telephone?: string; role: UserRole };
      isSubmitting: boolean;
      onSubmit: (dto: UpdateUserRequest) => void;
      onCancel?: () => void;
    };

function buildBaseUserFormSchemaShape(allowedRoles: UserRole[]) {
  const roleField = z.custom<UserRole>((value) => allowedRoles.includes(value as UserRole), {
    message: "Rôle invalide",
  });
  return {
    email: emailSchema,
    nom: nomSchema,
    prenoms: prenomsSchema,
    telephone: telephoneSchema,
    role: roleField,
  };
}

/**
 * Schémas locaux, non partagés (structure propre à ce formulaire, cf. conception U4
 * §6.7). `allowedRoles` dérivé de `roleOptions`, jamais codé en dur : c'est ce qui
 * permet à U5 de réutiliser ce composant avec
 * `roleOptions=[{ value: UserRole.ADMINISTRATEUR, ... }]` sans y toucher. Scindé en
 * deux fonctions (`buildCreateUserFormSchema`/`buildEditUserFormSchema`) plutôt que la
 * fonction unique `buildUserFormSchema(mode, allowedRoles)` de la conception — écart de
 * forme (pas de fond) : TypeScript strict ne peut pas spécialiser le type de retour
 * d'une fonction non surchargée à partir d'un paramètre `mode` non littéral au site
 * d'appel, et les surcharges (`buildUserFormSchema(mode: "create", ...)`/`(mode: "edit", ...)`)
 * se sont révélées incompatibles avec la signature d'implémentation exigée par
 * `tsc --strict`. Le contenu des schémas reste rigoureusement identique à la conception.
 */
function buildCreateUserFormSchema(allowedRoles: UserRole[]) {
  return z
    .object({ ...buildBaseUserFormSchemaShape(allowedRoles), password: passwordSchema, photo: photoSchema })
    .superRefine((data, ctx) => {
      validatePhotoForRole(data.role, data.photo, ctx);
    });
}

function buildEditUserFormSchema(allowedRoles: UserRole[]) {
  return z.object(buildBaseUserFormSchemaShape(allowedRoles));
}

type CreateUserFormProps = Extract<UserFormProps, { mode: "create" }>;
type EditUserFormProps = Extract<UserFormProps, { mode: "edit" }>;

type CreateUserFormValues = z.infer<ReturnType<typeof buildCreateUserFormSchema>>;
type EditUserFormValues = z.infer<ReturnType<typeof buildEditUserFormSchema>>;

export function UserForm(props: UserFormProps) {
  if (props.mode === "create") {
    return <CreateUserForm {...props} />;
  }
  return <EditUserForm {...props} />;
}

function CreateUserForm({ roleOptions, isSubmitting, onSubmit, onCancel }: CreateUserFormProps) {
  const allowedRoles = roleOptions.map((option) => option.value);
  const schema = buildCreateUserFormSchema(allowedRoles);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", nom: "", prenoms: "", telephone: "", password: "", role: allowedRoles[0] },
  });
  const role = useWatch({ control, name: "role" });

  function submit(values: CreateUserFormValues): void {
    const dto: CreateUserRequest = {
      email: values.email,
      password: values.password,
      nom: values.nom,
      prenoms: values.prenoms,
      telephone: values.telephone || undefined,
      role: values.role,
    };
    const photo = values.role === UserRole.VEILLEUR ? values.photo?.[0] : undefined;
    onSubmit(dto, photo);
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Input
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nom" error={errors.nom?.message} {...register("nom")} />
        <Input label="Prénoms" error={errors.prenoms?.message} {...register("prenoms")} />
      </div>
      <Input label="Téléphone" type="tel" error={errors.telephone?.message} {...register("telephone")} />
      <Select label="Rôle" options={roleOptions} error={errors.role?.message} {...register("role")} />
      {role === UserRole.VEILLEUR && (
        <FileInput
          label="Photo"
          accept={PHOTO_ACCEPTED_MIME_TYPES.join(",")}
          error={errors.photo?.message}
          {...register("photo")}
        />
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Créer
        </Button>
      </div>
    </form>
  );
}

function EditUserForm({ roleOptions, defaultValues, isSubmitting, onSubmit, onCancel }: EditUserFormProps) {
  const allowedRoles = roleOptions.map((option) => option.value);
  const schema = buildEditUserFormSchema(allowedRoles);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: defaultValues.email,
      nom: defaultValues.nom,
      prenoms: defaultValues.prenoms,
      telephone: defaultValues.telephone ?? "",
      role: defaultValues.role,
    },
  });

  function submit(values: EditUserFormValues): void {
    const dto: UpdateUserRequest = {
      email: values.email,
      nom: values.nom,
      prenoms: values.prenoms,
      telephone: values.telephone || undefined,
      role: values.role,
    };
    onSubmit(dto);
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      {/* Éditable ici, contrairement à `ProfileEditForm` (U1) — US-USERS-06 autorise
          explicitement la modification de l'email d'un tiers par un Administrateur. */}
      <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nom" error={errors.nom?.message} {...register("nom")} />
        <Input label="Prénoms" error={errors.prenoms?.message} {...register("prenoms")} />
      </div>
      <Input label="Téléphone" type="tel" error={errors.telephone?.message} {...register("telephone")} />
      <Select label="Rôle" options={roleOptions} error={errors.role?.message} {...register("role")} />
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
