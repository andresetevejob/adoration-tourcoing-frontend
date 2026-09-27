import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AnnonceCreateRequest } from "@chapelle/shared/types";
import { Button, Input } from "@chapelle/shared/ui";

export type AnnonceFormProps =
  | {
      mode: "create";
      isSubmitting: boolean;
      onSubmit: (dto: AnnonceCreateRequest) => void;
      onCancel: () => void;
    }
  | {
      mode: "edit";
      defaultValues: { titre: string; contenu: string; datePublication: string };
      isSubmitting: boolean;
      onSubmit: (dto: Partial<AnnonceCreateRequest>) => void;
      onCancel?: () => void;
    };

/** Schéma local, non partagé (structure propre à ce formulaire, même choix que
 *  `UserForm`, U4 §6.7). Pas de champ `statut` (ni en création ni en édition) : la
 *  transition de statut passe exclusivement par `usePublishAnnonce` (§6.4, §9.3). */
function buildAnnonceFormSchema() {
  return z.object({
    titre: z.string().min(1).max(255),
    contenu: z.string().min(1).max(5000),
    datePublication: z.string().min(1),
  });
}

type AnnonceFormValues = z.infer<ReturnType<typeof buildAnnonceFormSchema>>;

type CreateAnnonceFormProps = Extract<AnnonceFormProps, { mode: "create" }>;
type EditAnnonceFormProps = Extract<AnnonceFormProps, { mode: "edit" }>;

/** Scindé en deux composants (`CreateAnnonceForm`/`EditAnnonceForm`) plutôt qu'un rendu
 *  unique branché sur `mode` : même contrainte que `UserForm` (U4) — `tsc --strict` ne
 *  peut pas résoudre l'appel de `props.onSubmit(values)` à travers une union discriminée
 *  de signatures de fonction non littérales au site d'appel. */
export function AnnonceForm(props: AnnonceFormProps) {
  if (props.mode === "create") {
    return <CreateAnnonceForm {...props} />;
  }
  return <EditAnnonceForm {...props} />;
}

function CreateAnnonceForm({ isSubmitting, onSubmit, onCancel }: CreateAnnonceFormProps) {
  const schema = buildAnnonceFormSchema();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnonceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { titre: "", contenu: "", datePublication: "" },
  });

  function submit(values: AnnonceFormValues): void {
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
      <Input label="Titre" error={errors.titre?.message} {...register("titre")} />
      <Input label="Contenu" error={errors.contenu?.message} {...register("contenu")} />
      <Input
        label="Date de publication"
        type="date"
        error={errors.datePublication?.message}
        {...register("datePublication")}
      />
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

function EditAnnonceForm({ defaultValues, isSubmitting, onSubmit, onCancel }: EditAnnonceFormProps) {
  const schema = buildAnnonceFormSchema();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnonceFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  function submit(values: AnnonceFormValues): void {
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
      <Input label="Titre" error={errors.titre?.message} {...register("titre")} />
      <Input label="Contenu" error={errors.contenu?.message} {...register("contenu")} />
      <Input
        label="Date de publication"
        type="date"
        error={errors.datePublication?.message}
        {...register("datePublication")}
      />
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
