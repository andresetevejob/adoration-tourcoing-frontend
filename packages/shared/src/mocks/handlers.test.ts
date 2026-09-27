import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { StatutAnnonce, type AnnonceCreateRequest, type AnnonceResponse } from "../types/annonce";
import type { ApiErrorPayload } from "../types/common";
import { annoncesHandlers, contactHandlers, resetAnnoncesStore } from "./handlers";

const server = setupServer(...annoncesHandlers, ...contactHandlers);
const BASE_URL = "http://test.local/api/v1";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => {
  server.resetHandlers();
  resetAnnoncesStore();
});
afterAll(() => {
  server.close();
});

describe("mocks/handlers — /annonces", () => {
  it("GET /annonces retourne la liste complète", async () => {
    const response = await fetch(`${BASE_URL}/annonces`);
    const body = (await response.json()) as AnnonceResponse[];

    expect(response.status).toBe(200);
    expect(body).toHaveLength(4);
  });

  it("GET /annonces?statut= filtre la liste", async () => {
    const response = await fetch(`${BASE_URL}/annonces?statut=${StatutAnnonce.PUBLIE}`);
    const body = (await response.json()) as AnnonceResponse[];

    expect(body.every((annonce) => annonce.statut === StatutAnnonce.PUBLIE)).toBe(true);
  });

  it("GET /annonces/:id retourne l'annonce", async () => {
    const response = await fetch(`${BASE_URL}/annonces/annonce-1`);
    const body = (await response.json()) as AnnonceResponse;

    expect(response.status).toBe(200);
    expect(body.id).toBe("annonce-1");
  });

  it("GET /annonces/:id retourne 404 { code, message } si l'id est inconnu", async () => {
    const response = await fetch(`${BASE_URL}/annonces/inconnu`);
    const body = (await response.json()) as ApiErrorPayload;

    expect(response.status).toBe(404);
    expect(body.code).toBe("ANNONCE_NOT_FOUND");
    expect(typeof body.message).toBe("string");
  });

  it("POST /annonces crée une annonce en statut BROUILLON", async () => {
    const dto: AnnonceCreateRequest = { titre: "Titre", contenu: "Contenu", datePublication: "2026-07-01" };

    const response = await fetch(`${BASE_URL}/annonces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const body = (await response.json()) as AnnonceResponse;

    expect(response.status).toBe(201);
    expect(body.statut).toBe(StatutAnnonce.BROUILLON);
    expect(body.titre).toBe("Titre");
  });

  it("PUT /annonces/:id met à jour l'annonce et retourne 404 si inconnue", async () => {
    const response = await fetch(`${BASE_URL}/annonces/annonce-1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre: "Modifié" }),
    });
    const body = (await response.json()) as AnnonceResponse;

    expect(response.status).toBe(200);
    expect(body.titre).toBe("Modifié");

    const notFoundResponse = await fetch(`${BASE_URL}/annonces/inconnu`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre: "Modifié" }),
    });
    expect(notFoundResponse.status).toBe(404);
  });

  it("DELETE /annonces/:id supprime l'annonce (204) et retourne 404 si déjà absente", async () => {
    const response = await fetch(`${BASE_URL}/annonces/annonce-1`, { method: "DELETE" });
    expect(response.status).toBe(204);

    const notFoundResponse = await fetch(`${BASE_URL}/annonces/annonce-1`, { method: "DELETE" });
    expect(notFoundResponse.status).toBe(404);
  });

  it("POST /annonces/:id/publier passe l'annonce en PUBLIE", async () => {
    const response = await fetch(`${BASE_URL}/annonces/annonce-3/publier`, { method: "POST" });
    const body = (await response.json()) as AnnonceResponse;

    expect(response.status).toBe(200);
    expect(body.statut).toBe(StatutAnnonce.PUBLIE);
  });

  it("POST /annonces/:id/depublier passe l'annonce en DEPUBLIE", async () => {
    const response = await fetch(`${BASE_URL}/annonces/annonce-1/depublier`, { method: "POST" });
    const body = (await response.json()) as AnnonceResponse;

    expect(response.status).toBe(200);
    expect(body.statut).toBe(StatutAnnonce.DEPUBLIE);
  });

  it("POST /annonces/:id/publier retourne 404 si l'id est inconnu", async () => {
    const response = await fetch(`${BASE_URL}/annonces/inconnu/publier`, { method: "POST" });
    expect(response.status).toBe(404);
  });
});

describe("mocks/handlers — /contact", () => {
  it("POST /contact retourne 204 sans corps", async () => {
    const response = await fetch(`${BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: "Jean", email: "jean@test.fr", sujet: "info", message: "Bonjour" }),
    });

    expect(response.status).toBe(204);
  });
});

describe("mocks/handlers — resetAnnoncesStore ré-exporté", () => {
  beforeEach(() => {
    resetAnnoncesStore();
  });

  it("réinitialise l'état entre les tests", async () => {
    await fetch(`${BASE_URL}/annonces/annonce-1`, { method: "DELETE" });
    resetAnnoncesStore();

    const response = await fetch(`${BASE_URL}/annonces/annonce-1`);
    expect(response.status).toBe(200);
  });
});
