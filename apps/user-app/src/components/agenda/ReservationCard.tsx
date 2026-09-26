import { Card } from "@chapelle/shared/ui";
import { formatDateTime } from "@chapelle/shared/utils";

export interface ReservationCardProps {
  dateDebut: string;
  dateFin: string;
  beneficiaireLabel: string;
  description?: string;
}

/** Présentation pure, réutilisée par les deux variantes (création/annulation) de `ReservationConfirmModal`. */
export function ReservationCard({ dateDebut, dateFin, beneficiaireLabel, description }: ReservationCardProps) {
  return (
    <Card className="flex flex-col gap-2">
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
