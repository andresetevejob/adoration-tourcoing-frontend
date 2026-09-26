import { Badge, Table, type TableColumn } from "@chapelle/shared/ui";
import { StatutReservation, type BookingResponse } from "@chapelle/shared/types";
import { formatDateTime } from "@chapelle/shared/utils";

export interface MyBookingsListProps {
  bookings: BookingResponse[];
  isLoading: boolean;
}

/** `Table` exige `T extends Record<string, unknown>` ; `BookingResponse` n'a pas d'index signature. */
type BookingRow = BookingResponse & Record<string, unknown>;

const STATUS_LABEL: Record<StatutReservation, string> = {
  [StatutReservation.EFFECTUEE]: "Effectuée",
  [StatutReservation.ANNULEE]: "Annulée",
};

const STATUS_VARIANT: Record<StatutReservation, "success" | "danger"> = {
  [StatutReservation.EFFECTUEE]: "success",
  [StatutReservation.ANNULEE]: "danger",
};

const columns: TableColumn<BookingRow>[] = [
  { key: "dateDebut", header: "Début", render: (row) => formatDateTime(row.dateDebut) },
  { key: "dateFin", header: "Fin", render: (row) => formatDateTime(row.dateFin) },
  {
    key: "status",
    header: "Statut",
    render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
  },
];

export function MyBookingsList({ bookings, isLoading }: MyBookingsListProps) {
  return (
    <Table<BookingRow>
      columns={columns}
      data={bookings as BookingRow[]}
      isLoading={isLoading}
      emptyMessage="Aucune réservation pour le moment."
    />
  );
}
