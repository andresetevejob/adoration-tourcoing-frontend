import { StatutAnnonce, type AnnonceResponse } from "@chapelle/shared/types";
import { Button, Table, type TableColumn } from "@chapelle/shared/ui";
import { formatDate } from "@chapelle/shared/utils";
import { AnnonceStatutBadge } from "./AnnonceStatutBadge";

export interface AnnonceListProps {
  annonces: AnnonceResponse[];
  isLoading: boolean;
  onEdit: (annonce: AnnonceResponse) => void;
  onDelete: (annonce: AnnonceResponse) => void;
  onTogglePublication: (annonce: AnnonceResponse) => void;
  togglingIds?: ReadonlySet<string>;
}

/** `Table` exige `T extends Record<string, unknown>` ; `AnnonceResponse` n'a pas d'index signature. */
type AnnonceRow = AnnonceResponse & Record<string, unknown>;

export function AnnonceList({
  annonces,
  isLoading,
  onEdit,
  onDelete,
  onTogglePublication,
  togglingIds,
}: AnnonceListProps) {
  const columns: TableColumn<AnnonceRow>[] = [
    { key: "titre", header: "Titre" },
    { key: "datePublication", header: "Date de publication", render: (row) => formatDate(row.datePublication) },
    { key: "statut", header: "Statut", render: (row) => <AnnonceStatutBadge statut={row.statut} /> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onEdit(row);
            }}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="primary"
            isLoading={togglingIds?.has(row.id) ?? false}
            onClick={() => {
              onTogglePublication(row);
            }}
          >
            {row.statut === StatutAnnonce.PUBLIE ? "Dépublier" : "Publier"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              onDelete(row);
            }}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<AnnonceRow>
      columns={columns}
      data={annonces as AnnonceRow[]}
      isLoading={isLoading}
      emptyMessage="Aucune annonce trouvée."
    />
  );
}
