import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Modal } from "@chapelle/shared/ui";
import { formatDateTime } from "@chapelle/shared/utils";

/**
 * Schéma local, non factorisé depuis `bookingSchema` : `bookingSchema` est un
 * `ZodEffects` (`.refine()` en chaîne) qui ne permet pas de `.pick()` un sous-ensemble
 * de champs, et ce formulaire ne collecte de toute façon que `description` (les dates
 * sont fixées par la sélection calendrier, cf. conception U3 §6.1).
 */
const reservationFormSchema = z.object({
  description: z.string().max(1000).optional(),
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;

export interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  slot: { start: string; end: string };
  onSubmit: (values: ReservationFormValues) => void;
}

/** N'appelle jamais l'API : ouvre `ReservationConfirmModal` (US-RESA-01/05). */
export function ReservationForm({ isOpen, onClose, slot, onSubmit }: ReservationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: { description: "" },
  });

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
