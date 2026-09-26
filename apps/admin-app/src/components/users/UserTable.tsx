import type { ReactNode } from "react";
import { Link } from "react-router";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { Table, type TableColumn } from "@chapelle/shared/ui";
import { formatDate } from "@chapelle/shared/utils";
import { StatutValidationBadge } from "./StatutValidationBadge";
import { ValidationActions } from "./ValidationActions";

export interface UserTableProps {
  users: UserResponse[];
  isLoading: boolean;
  /** [AJOUTÉ, U5] Quand fourni, remplace entièrement le contenu par défaut de la colonne
   *  Actions (lien "Voir" + `ValidationActions`) pour chaque ligne. Omis (cas de U4,
   *  `PageGestionUtilisateurs`), le rendu par défaut reste strictement identique — aucun
   *  changement de comportement pour l'appelant existant. */
  renderRowActions?: (user: UserResponse) => ReactNode;
}

/** `Table` exige `T extends Record<string, unknown>` ; `UserResponse` n'a pas d'index signature. */
type UserRow = UserResponse & Record<string, unknown>;

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.ADORATEUR]: "Adorateur",
  [UserRole.VEILLEUR]: "Veilleur",
  [UserRole.ADMINISTRATEUR]: "Administrateur",
  [UserRole.SUPERADMINISTRATEUR]: "SuperAdministrateur",
};

export function UserTable({ users, isLoading, renderRowActions }: UserTableProps) {
  const columns: TableColumn<UserRow>[] = [
    { key: "email", header: "Email" },
    { key: "nom", header: "Nom" },
    { key: "prenoms", header: "Prénoms" },
    { key: "role", header: "Rôle", render: (row) => ROLE_LABEL[row.role] },
    {
      key: "statutValidation",
      header: "Statut",
      render: (row) => <StatutValidationBadge statut={row.statutValidation} />,
    },
    { key: "dateCreation", header: "Date de création", render: (row) => formatDate(row.dateCreation) },
    {
      key: "actions",
      header: "Actions",
      render: (row) =>
        renderRowActions ? (
          renderRowActions(row)
        ) : (
          <div className="flex items-center gap-3">
            <Link to={`/utilisateurs/${row.id}`} className="text-gold-700 hover:underline">
              Voir
            </Link>
            {row.statutValidation === StatutValidation.EN_ATTENTE && <ValidationActions user={row} />}
          </div>
        ),
    },
  ];

  return (
    <Table<UserRow>
      columns={columns}
      data={users as UserRow[]}
      isLoading={isLoading}
      emptyMessage="Aucun utilisateur trouvé."
    />
  );
}
