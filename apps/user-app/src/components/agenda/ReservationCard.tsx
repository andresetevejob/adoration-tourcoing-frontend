import { Card } from "@chapelle/shared/ui";
import { formatDateTime } from "@chapelle/shared/utils";

export interface ReservationCardProps {
  dateDebut: string;
  dateFin: string;
  beneficiaireLabel: string;
  description?: string;
  photoUrl?: string; // URL objet (Blob) du bénéficiaire, cf. useUserPhoto — absente si pas de
                      // photo, erreur (403/404) ou chargement non terminé (dégradation silencieuse,
                      // voir useUserPhoto). `undefined` ⇒ aucun bloc photo rendu, comportement inchangé.
}

/** Présentation pure, réutilisée par les deux variantes (création/annulation) de
 * `ReservationConfirmModal` ainsi que par `ReservationDetailModal`. */
export function ReservationCard({
  dateDebut,
  dateFin,
  beneficiaireLabel,
  description,
  photoUrl,
}: ReservationCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      {photoUrl && (
        <div className="flex justify-center">
          <img
            src={photoUrl}
            alt={`Photo de ${beneficiaireLabel}`}
            className="h-24 w-24 rounded-full object-cover"
          />
        </div>
      )}
      <div>
        <span className="text-sm font-medium text-night-800">Début : </span>
        <span>{formatDateTime(dateDebut)}</span>
      </div>
      <div>
        <span className="text-sm font-medium text-night-800">Fin : </span>
        <span>{formatDateTime(dateFin)}</span>
      </div>
      <div>
        <span className="text-sm font-medium text-night-800">Bénéficiaire : </span>
        <span>{beneficiaireLabel}</span>
      </div>
      {description && (
        <div>
          <span className="text-sm font-medium text-night-800">Description : </span>
          <span>{description}</span>
        </div>
      )}
    </Card>
  );
}
