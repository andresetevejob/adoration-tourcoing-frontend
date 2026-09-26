import { Badge, Card } from "@chapelle/shared/ui";
import { StatutValidation, type UserResponse } from "@chapelle/shared/types";

export interface ProfileCardProps {
  user: UserResponse;
}

const STATUT_BADGE_VARIANT: Record<StatutValidation, "success" | "warning" | "danger"> = {
  [StatutValidation.VALIDE]: "success",
  [StatutValidation.EN_ATTENTE]: "warning",
  [StatutValidation.REJETE]: "danger",
};

const STATUT_LABEL: Record<StatutValidation, string> = {
  [StatutValidation.VALIDE]: "Validé",
  [StatutValidation.EN_ATTENTE]: "En attente",
  [StatutValidation.REJETE]: "Rejeté",
};

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card title="Mes informations">
      <dl className="grid gap-4 text-sm text-night-800 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-night-600">Nom</dt>
          <dd>{user.nom}</dd>
        </div>
        <div>
          <dt className="font-medium text-night-600">Prénoms</dt>
          <dd>{user.prenoms}</dd>
        </div>
        <div>
          <dt className="font-medium text-night-600">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-night-600">Téléphone</dt>
          <dd>{user.telephone ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-night-600">Statut</dt>
          <dd>
            <Badge variant={STATUT_BADGE_VARIANT[user.statutValidation]}>
              {STATUT_LABEL[user.statutValidation]}
            </Badge>
          </dd>
        </div>
      </dl>
    </Card>
  );
}
