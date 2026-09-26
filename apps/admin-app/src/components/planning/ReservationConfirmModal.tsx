import type { CreateBookingRequest, PlanningEntryResponse } from "@chapelle/shared/types";
import { Button, Modal } from "@chapelle/shared/ui";
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
 * Seul point d'appel à la mutation de création/annulation (§8.2) : `ReservationForm`
 * n'appelle jamais l'API directement. Contrairement à la variante user-app, aucun appel
 * à `canCancelBooking` : le bouton "Confirmer" est toujours actif (EF-4, annulation libre).
 */
export function ReservationConfirmModal(props: ReservationConfirmModalProps) {
  if (props.variant === "create") {
    const { isOpen, onClose, dto, beneficiaireLabel, isSubmitting, onConfirm } = props;
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
            <Button onClick={onConfirm} isLoading={isSubmitting}>
              Confirmer
            </Button>
          </>
        }
      >
        <ReservationCard
          dateDebut={dto.dateDebut}
          dateFin={dto.dateFin}
          beneficiaireLabel={beneficiaireLabel}
          description={dto.description}
        />
      </Modal>
    );
  }

  const { isOpen, onClose, booking, isSubmitting, onConfirm } = props;

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
          <Button variant="danger" onClick={onConfirm} isLoading={isSubmitting}>
            Confirmer
          </Button>
        </>
      }
    >
      <ReservationCard
        dateDebut={booking.dateDebut}
        dateFin={booking.dateFin}
        beneficiaireLabel={`${booking.prenomsUtilisateur} ${booking.nomUtilisateur}`}
        description={booking.description}
      />
    </Modal>
  );
}
