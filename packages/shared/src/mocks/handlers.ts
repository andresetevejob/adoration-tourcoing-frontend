import { http, HttpResponse, type HttpHandler } from "msw";
import { StatutAnnonce, type AnnonceCreateRequest } from "../types/annonce";
import {
  createAnnonce,
  deleteAnnonce,
  getAnnonceById,
  listAnnonces,
  setAnnonceStatut,
  updateAnnonce,
} from "./annoncesStore";

export { resetAnnoncesStore } from "./annoncesStore";

function notFound(message = "Annonce introuvable.") {
  return HttpResponse.json({ error: "ANNONCE_NOT_FOUND", message }, { status: 404 });
}

export const annoncesHandlers: HttpHandler[] = [
  http.get("*/annonces", ({ request }) => {
    const url = new URL(request.url);
    const statut = url.searchParams.get("statut") as StatutAnnonce | null;
    return HttpResponse.json(listAnnonces(statut ?? undefined));
  }),

  http.get("*/annonces/:id", ({ params }) => {
    const annonce = getAnnonceById(params.id as string);
    if (!annonce) return notFound();
    return HttpResponse.json(annonce);
  }),

  http.post("*/annonces", async ({ request }) => {
    const dto = (await request.json()) as AnnonceCreateRequest;
    return HttpResponse.json(createAnnonce(dto), { status: 201 });
  }),

  http.put("*/annonces/:id", async ({ params, request }) => {
    const dto = (await request.json()) as Partial<AnnonceCreateRequest>;
    const updated = updateAnnonce(params.id as string, dto);
    if (!updated) return notFound();
    return HttpResponse.json(updated);
  }),

  http.delete("*/annonces/:id", ({ params }) => {
    const deleted = deleteAnnonce(params.id as string);
    if (!deleted) return notFound();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("*/annonces/:id/publier", ({ params }) => {
    const updated = setAnnonceStatut(params.id as string, StatutAnnonce.PUBLIE);
    if (!updated) return notFound();
    return HttpResponse.json(updated);
  }),

  http.post("*/annonces/:id/depublier", ({ params }) => {
    const updated = setAnnonceStatut(params.id as string, StatutAnnonce.DEPUBLIE);
    if (!updated) return notFound();
    return HttpResponse.json(updated);
  }),
];

/** Sans état (contrairement à `annoncesHandlers`) : US-CONTACT-01 ne décrit qu'un envoi,
 *  aucun récit ne demande de relire les messages envoyés — pas de `contactStore.ts`.
 *  Pas de validation du corps de la requête côté mock : même choix que `/annonces`
 *  (§4 du plan U6, point ouvert 4) — `ContactForm` (Zod) est l'unique point d'entrée
 *  de cette mutation, aucune revalidation "serveur" redondante. */
export const contactHandlers: HttpHandler[] = [
  http.post("*/contact", () => new HttpResponse(null, { status: 204 })),
];
