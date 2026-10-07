import type { CreateBookingRequest, PlanningEntryResponse } from "@chapelle/shared/types";
import { Button, Modal } from "@chapelle/shared/ui";
import { exceedsMaxDuration } from "@chapelle/shared/utils";
import { canCancelBooking } from "./cancellationEligibility";
import { ReservationCard } from "./ReservationCard";

export type ReservationConfirmModalProps =
  | {
      variant: "create";
      isOpen: boolean;
      onClose: () => void;
      dto: CreateBookingRequest;
      beneficiaireLabel: string;
      isSubmitting: boolean;
      onConfirm: () => void;
    }
  | {
      variant: "cancel";
      isOpen: boolean;
      onClose: () => void;
      booking: PlanningEntryResponse;
      isSubmitting: boolean;
      onConfirm: () => void;
    };

/**
 * Seul point d'appel à la mutation de création/annulation (§8) : `ReservationForm`
 * n'appelle jamais l'API directement.
 */
export function ReservationConfirmModal(props: ReservationConfirmModalProps) {
  if (props.variant === "create") {
    const { isOpen, onClose, dto, beneficiaireLabel, isSubmitting, onConfirm } = props;
    const dureeValide = !exceedsMaxDuration(dto.dateDebut, dto.dateFin);
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Confirmer la réservation"
        footer={
          <>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={onConfirm} isLoading={isSubmitting} disabled={!dureeValide}>
              Confirmer
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <ReservationCard
            dateDebut={dto.dateDebut}
            dateFin={dto.dateFin}
            beneficiaireLabel={beneficiaireLabel}
            description={dto.description}
          />
          {!dureeValide && (
            <p role="alert" className="text-sm text-red-600">
              Un créneau ne peut pas dépasser 24h.
            </p>
          )}
        </div>
      </Modal>
    );
  }

  const { isOpen, onClose, booking, isSubmitting, onConfirm } = props;
  const eligible = canCancelBooking(booking.dateDebut);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmer l'annulation"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isSubmitting} disabled={!eligible}>
            Confirmer
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ReservationCard
          dateDebut={booking.dateDebut}
          dateFin={booking.dateFin}
          beneficiaireLabel={`${booking.prenomsUtilisateur} ${booking.nomUtilisateur}`}
          description={booking.description}
        />
        {!eligible && (
          <p role="alert" className="text-sm text-red-600">
            Le délai d'annulation (24h) est dépassé.
          </p>
        )}
      </div>
    </Modal>
  );
}
