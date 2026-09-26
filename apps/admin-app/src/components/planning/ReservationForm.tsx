import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Modal } from "@chapelle/shared/ui";
import { formatDateTime } from "@chapelle/shared/utils";
import { useVeilleurs } from "../../hooks/useVeilleurs";
import { VeilleurSelect } from "./VeilleurSelect";

/**
 * Schéma local, non partagé (structure propre à ce formulaire, cf. conception U3 §7.1) :
 * `veilleurId` n'est requis que lorsque `beneficiaire === "veilleur"`.
 */
const reservationFormSchema = z
  .object({
    beneficiaire: z.enum(["moi", "veilleur"]),
    veilleurId: z.string().optional(),
    description: z.string().max(1000).optional(),
  })
  .refine((data) => data.beneficiaire !== "veilleur" || Boolean(data.veilleurId), {
    message: "Sélectionnez un Veilleur",
    path: ["veilleurId"],
  });

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;

export interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  slot: { start: string; end: string };
  onSubmit: (values: ReservationFormValues) => void;
}

/**
 * Composant "connecté" (appelle `useVeilleurs()` en interne) — cohérent avec
 * `component-dependency.md` ("composants présentationnels → hooks pour les composants
 * connectés"). N'appelle jamais l'API de réservation : ouvre `ReservationConfirmModal`.
 */
export function ReservationForm({ isOpen, onClose, slot, onSubmit }: ReservationFormProps) {
  const veilleursQuery = useVeilleurs();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: { beneficiaire: "moi", description: "" },
  });

  const beneficiaire = watch("beneficiaire");
  const veilleurId = watch("veilleurId");

  function submit(values: ReservationFormValues): void {
    onSubmit(values);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Réserver ce créneau">
      <form
        onSubmit={(event) => {
          void handleSubmit(submit)(event);
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1 text-sm">
          <div>
            <span className="font-medium text-night-800">Début : </span>
            {formatDateTime(slot.start)}
          </div>
          <div>
            <span className="font-medium text-night-800">Fin : </span>
            {formatDateTime(slot.end)}
          </div>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-night-800">Réserver pour</legend>
          <label className="flex items-center gap-2 text-sm text-night-800">
            <input type="radio" value="moi" {...register("beneficiaire")} />
            Moi-même
          </label>
          <label className="flex items-center gap-2 text-sm text-night-800">
            <input type="radio" value="veilleur" {...register("beneficiaire")} />
            Un Veilleur
          </label>
        </fieldset>
        {beneficiaire === "veilleur" && (
          <VeilleurSelect
            veilleurs={veilleursQuery.data ?? []}
            value={veilleurId}
            onChange={(id) => {
              setValue("veilleurId", id, { shouldValidate: true });
            }}
            error={errors.veilleurId?.message}
          />
        )}
        <Input
          label="Description (facultatif)"
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit">Réserver</Button>
        </div>
      </form>
    </Modal>
  );
}
