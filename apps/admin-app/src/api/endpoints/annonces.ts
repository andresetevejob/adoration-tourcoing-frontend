import { StatutAnnonce, type AnnonceCreateRequest, type AnnonceResponse } from "@chapelle/shared/types";
import { apiClient } from "../client";

export interface ListAnnoncesParams {
  statut?: StatutAnnonce;
}

export function listAnnonces(params: ListAnnoncesParams): Promise<AnnonceResponse[]> {
  return apiClient.get<AnnonceResponse[]>("/annonces", { statut: params.statut });
}

export function getAnnonce(id: string): Promise<AnnonceResponse> {
  return apiClient.get<AnnonceResponse>(`/annonces/${id}`);
}

/** `skipForbiddenRedirect: true` (cf. `packages/shared/src/api/client.ts`) : un refus
 * scoped à cette route précise ne doit jamais rediriger toute l'admin-app vers
 * `/non-autorise` — même précaution que `createUser` (U4). */
export function createAnnonce(dto: AnnonceCreateRequest): Promise<AnnonceResponse> {
  return apiClient.post<AnnonceResponse>("/annonces", dto, { skipForbiddenRedirect: true });
}

export function updateAnnonce(id: string, dto: Partial<AnnonceCreateRequest>): Promise<AnnonceResponse> {
  return apiClient.put<AnnonceResponse>(`/annonces/${id}`, dto, { skipForbiddenRedirect: true });
}

export function deleteAnnonce(id: string): Promise<void> {
  return apiClient.delete(`/annonces/${id}`, { skipForbiddenRedirect: true });
}

export function publishAnnonce(id: string, statut: StatutAnnonce): Promise<AnnonceResponse> {
  const action = statut === StatutAnnonce.PUBLIE ? "publier" : "depublier";
  return apiClient.post<AnnonceResponse>(`/annonces/${id}/${action}`, undefined, { skipForbiddenRedirect: true });
}
