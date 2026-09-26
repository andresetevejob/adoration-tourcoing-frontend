import { useForm } from "react-hook-form";
import { StatutValidation } from "@chapelle/shared/types";
import { Button, Input, Select } from "@chapelle/shared/ui";

export interface UserFiltersValues {
  email?: string;
  telephone?: string;
  nom?: string;
  prenoms?: string;
  statutValidation?: StatutValidation;
}

export interface UserFiltersProps {
  defaultValues: UserFiltersValues;
  onSubmit: (values: UserFiltersValues) => void;
  onPendingShortcut: () => void;
}

const STATUT_OPTIONS = [
  { value: "", label: "Tous" },
  { value: StatutValidation.EN_ATTENTE, label: "En attente" },
  { value: StatutValidation.VALIDE, label: "Validé" },
  { value: StatutValidation.REJETE, label: "Rejeté" },
];

interface UserFiltersFormValues {
  email: string;
  telephone: string;
  nom: string;
  prenoms: string;
  statutValidation: StatutValidation | "";
}

/**
 * Formulaire RHF sans schéma Zod (filtres, pas des données à valider avant envoi —
 * cf. conception U4 §6.2). Soumission explicite (bouton "Rechercher"), pas de filtrage
 * en direct à la frappe, faute d'utilitaire de debounce partagé (§9 point ouvert n°3).
 */
export function UserFilters({ defaultValues, onSubmit, onPendingShortcut }: UserFiltersProps) {
  const { register, handleSubmit } = useForm<UserFiltersFormValues>({
    defaultValues: {
      email: defaultValues.email ?? "",
      telephone: defaultValues.telephone ?? "",
      nom: defaultValues.nom ?? "",
      prenoms: defaultValues.prenoms ?? "",
      statutValidation: defaultValues.statutValidation ?? "",
    },
  });

  function submit(values: UserFiltersFormValues): void {
    onSubmit({
      email: values.email || undefined,
      telephone: values.telephone || undefined,
      nom: values.nom || undefined,
      prenoms: values.prenoms || undefined,
      statutValidation: values.statutValidation || undefined,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(event) => {
          void handleSubmit(submit)(event);
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Email" {...register("email")} />
          <Input label="Téléphone" {...register("telephone")} />
          <Input label="Nom" {...register("nom")} />
          <Input label="Prénoms" {...register("prenoms")} />
        </div>
        <Select label="Statut" options={STATUT_OPTIONS} {...register("statutValidation")} />
        <div className="flex justify-end gap-3">
          <Button type="submit">Rechercher</Button>
        </div>
      </form>
      <div>
        <Button type="button" variant="gold-outline" onClick={onPendingShortcut}>
          Comptes en attente
        </Button>
      </div>
    </div>
  );
}
