import type {
  CreateUserRequest,
  SpringPage,
  StatutValidation,
  UpdateUserRequest,
  UserResponse,
} from "@chapelle/shared/types";
import { apiClient } from "../client";

/**
 * `skipForbiddenRedirect: true` (cf. `packages/shared/src/api/client.ts`) : un refus
 * scoped à cette route précise (ex. tentative d'action sur un compte admin malgré le
 * masquage UI, cf. conception U4 §4) ne doit jamais rediriger toute l'application vers
 * `/non-autorise` — même raisonnement préventif que `bookings.ts` (U3). Signature
 * inchangée, appelants existants (`useUpdateProfile`, U1) non impactés.
 */
export function updateUser(id: string, dto: UpdateUserRequest): Promise<UserResponse> {
  return apiClient.put<UserResponse>(`/users/${id}`, dto, { skipForbiddenRedirect: true });
}

export interface ListUsersParams {
  nom?: string;
  prenoms?: string;
  email?: string;
  telephone?: string;
  statutValidation?: StatutValidation;
  page?: number;
  size?: number;
}

/** GET /users — aucun filtre `role` exposé par le swagger, cf. `useVeilleurs` pour le
 * contournement côté client (filtrage de la page renvoyée). */
export function listUsers(params: ListUsersParams): Promise<SpringPage<UserResponse>> {
  return apiClient.get<SpringPage<UserResponse>>("/users", {
    nom: params.nom,
    prenoms: params.prenoms,
    email: params.email,
    telephone: params.telephone,
    statutValidation: params.statutValidation,
    page: params.page,
    size: params.size,
  });
}

export function getUser(id: string): Promise<UserResponse> {
  return apiClient.get<UserResponse>(`/users/${id}`);
}

/** POST /users — création par un Administrateur/SuperAdministrateur, statut initial
 * `VALIDE` automatiquement quel que soit le rôle (cf. conception U4 §2). */
export function createUser(dto: CreateUserRequest, photo?: File): Promise<UserResponse> {
  return apiClient.post<UserResponse>("/users", photo ? toMultipartFormData(dto, photo) : dto, {
    skipForbiddenRedirect: true,
  });
}

function toMultipartFormData(dto: CreateUserRequest, photo: File): FormData {
  const formData = new FormData();
  formData.append("email", dto.email);
  formData.append("password", dto.password);
  formData.append("nom", dto.nom);
  formData.append("prenoms", dto.prenoms);
  if (dto.telephone) formData.append("telephone", dto.telephone);
  formData.append("role", dto.role);
  formData.append("photo", photo);
  return formData;
}

export function deleteUser(id: string): Promise<void> {
  return apiClient.delete(`/users/${id}`, { skipForbiddenRedirect: true });
}

export function validerUser(id: string): Promise<UserResponse> {
  return apiClient.post<UserResponse>(`/users/${id}/valider`, undefined, { skipForbiddenRedirect: true });
}

export function rejeterUser(id: string): Promise<UserResponse> {
  return apiClient.post<UserResponse>(`/users/${id}/rejeter`, undefined, { skipForbiddenRedirect: true });
}
