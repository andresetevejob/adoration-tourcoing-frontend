import type { PlanningEntryResponse } from "@chapelle/shared/types";
import { Button, Modal } from "@chapelle/shared/ui";
import { useUserPhoto } from "../../hooks/useUserPhoto";
import { ReservationCard } from "./ReservationCard";

export interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: PlanningEntryResponse;
}

/**
 * Modale de détail, lecture seule, pour toute réservation cliquée qui n'est pas la sienne
 * (`isMine === false`, cf. `PageAgenda.tsx`) — révèle le nom et la photo du bénéficiaire,
 * sans action possible (pas d'annulation : seul le titulaire ou un administrateur peut
 * annuler une réservation).
 */
export function ReservationDetailModal({ isOpen, onClose, booking }: ReservationDetailModalProps) {
  const { data: photoUrl } = useUserPhoto(booking.idUtilisateur);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détail de la réservation"
      footer={
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <ReservationCard
        dateDebut={booking.dateDebut}
        dateFin={booking.dateFin}
        beneficiaireLabel={`${booking.prenomsUtilisateur} ${booking.nomUtilisateur}`}
        description={booking.description}
        photoUrl={photoUrl}
      />
    </Modal>
  );
}
