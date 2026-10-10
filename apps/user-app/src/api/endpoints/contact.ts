import { apiClient } from "../client";

/** Contrat propre à `user-app`, non partagé avec `admin-app` — pas de fichier
 *  `packages/shared/src/types/contact.ts`, rien à mutualiser. */
export interface ContactMessageDto {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}

/** POST /contact — endpoint public, aucune garde d'authentification (US-CONTACT-01,
 *  persona Anonyme incluse), même absence de garde que `listAnnonces` (U6)/`getPlanning` (U2). */
export function sendContactMessage(dto: ContactMessageDto): Promise<void> {
  return apiClient.post("/contact", dto, { skipAuthRetry: true });
}
