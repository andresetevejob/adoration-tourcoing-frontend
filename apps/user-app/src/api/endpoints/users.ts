import type { UpdateUserRequest, UserResponse } from "@chapelle/shared/types";
import { apiClient } from "../client";

/** U4 (`UserManagementModule`) étendra ce fichier avec listUsers/createUser/deleteUser/validerUser/rejeterUser. */
export function updateUser(id: string, dto: UpdateUserRequest): Promise<UserResponse> {
  return apiClient.put<UserResponse>(`/users/${id}`, dto);
}

/**
 * GET /users/{id}/photo — contenu binaire (image/jpeg|png). Tenté SYSTÉMATIQUEMENT pour
 * toute réservation affichée en modale : contrairement à `UserResponse.photo` (admin-app),
 * `PlanningEntryResponse` ne porte aucun indicateur de présence de photo permettant de
 * court-circuiter l'appel (cf. `useUserPhoto`).
 *
 * `skipForbiddenRedirect: true` (cf. `packages/shared/src/api/client.ts`) — DIFFÉRENCE
 * CRITIQUE avec `getUserPhoto` côté admin-app (qui ne passe pas cette option) : un Veilleur
 * consultant la photo d'un AUTRE Veilleur peut recevoir un 403 selon l'autorisation backend
 * réelle (cf. proposal.md, "Point de vigilance backend" — `GET /users/{id}/photo` est
 * documenté comme réservé au titulaire ou à un administrateur). Sans cette option, le hook
 * `onForbidden` de `apps/user-app/src/api/client.ts` redirige TOUTE l'application vers
 * `/non-autorise` (`navigate("/non-autorise", { replace: true })`) — un simple clic sur la
 * réservation d'un collègue éjecterait l'utilisateur de `/agenda`. Avec cette option, le 403
 * se traduit uniquement par l'absence du bloc photo dans la modale (dégradation silencieuse),
 * même raisonnement que `createBooking`/`cancelBooking` (`bookings.ts`, même fichier de
 * référence).
 */
export function getUserPhoto(id: string): Promise<Blob> {
  return apiClient.getBlob(`/users/${id}/photo`, { skipForbiddenRedirect: true });
}
