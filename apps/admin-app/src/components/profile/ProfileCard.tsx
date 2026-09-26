import { Card } from "@chapelle/shared/ui";
import type { UserResponse } from "@chapelle/shared/types";
import { StatutValidationBadge } from "../users/StatutValidationBadge";

export interface ProfileCardProps {
  user: UserResponse;
}

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
            <StatutValidationBadge statut={user.statutValidation} />
          </dd>
        </div>
      </dl>
    </Card>
  );
}
