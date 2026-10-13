import { UserRole, type UserResponse } from "@chapelle/shared/types";
import { Card, Spinner } from "@chapelle/shared/ui";
import { formatDate } from "@chapelle/shared/utils";
import { useUserPhoto } from "../../hooks/useUserPhoto";
import { StatutValidationBadge } from "./StatutValidationBadge";

export interface UserProfileProps {
  user: UserResponse;
}

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.ADORATEUR]: "Adorateur",
  [UserRole.VEILLEUR]: "Veilleur",
  [UserRole.ADMINISTRATEUR]: "Administrateur",
  [UserRole.SUPERADMINISTRATEUR]: "SuperAdministrateur",
};

/**
 * Forme jumelle de `ProfileCard` (U1, `components/profile/`) mais générique à un
 * utilisateur *cible* passé en prop plutôt qu'à l'utilisateur connecté — cf.
 * conception U4 §6.6.
 */
export function UserProfile({ user }: UserProfileProps) {
  const hasPhoto = Boolean(user.photo);
  const { data: photoUrl, isLoading: isPhotoLoading } = useUserPhoto(user.id, hasPhoto);

  return (
    <Card title="Informations">
      {hasPhoto && isPhotoLoading && (
        <div className="mb-4 flex justify-center">
          <Spinner size="md" />
        </div>
      )}
      {photoUrl && (
        <div className="mb-4 flex justify-center">
          <img
            src={photoUrl}
            alt={`Photo de ${user.prenoms} ${user.nom}`}
            className="h-24 w-24 rounded-full object-cover"
          />
        </div>
      )}
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
          <dt className="font-medium text-night-600">Rôle</dt>
          <dd>{ROLE_LABEL[user.role]}</dd>
        </div>
        <div>
          <dt className="font-medium text-night-600">Statut</dt>
          <dd>
            <StatutValidationBadge statut={user.statutValidation} />
          </dd>
        </div>
        <div>
          <dt className="font-medium text-night-600">Date de création</dt>
          <dd>{formatDate(user.dateCreation)}</dd>
        </div>
      </dl>
    </Card>
  );
}
