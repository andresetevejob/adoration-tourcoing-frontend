import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatutAnnonce, type AnnonceResponse } from "@chapelle/shared/types";
import {
  createAnnonce,
  deleteAnnonce,
  getAnnonce,
  listAnnonces,
  publishAnnonce,
  updateAnnonce,
} from "./annonces";

const { getMock, postMock, putMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("../client", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    put: putMock,
    delete: deleteMock,
  },
}));

const annonce: AnnonceResponse = {
  id: "a1",
  titre: "Titre",
  contenu: "Contenu",
  datePublication: "2026-01-01",
  statut: StatutAnnonce.BROUILLON,
};

describe("api/endpoints/annonces (admin-app)", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    putMock.mockReset();
    deleteMock.mockReset();
  });

  it("listAnnonces() effectue un GET /annonces avec le statut fourni", async () => {
    getMock.mockResolvedValueOnce([annonce]);

    const result = await listAnnonces({ statut: StatutAnnonce.PUBLIE });

    expect(getMock).toHaveBeenCalledWith("/annonces", { statut: StatutAnnonce.PUBLIE });
    expect(result).toEqual([annonce]);
  });

  it("getAnnonce() effectue un GET /annonces/{id}", async () => {
    getMock.mockResolvedValueOnce(annonce);

    const result = await getAnnonce("a1");

    expect(getMock).toHaveBeenCalledWith("/annonces/a1");
    expect(result).toBe(annonce);
  });

  it("createAnnonce() effectue un POST /annonces avec skipForbiddenRedirect", async () => {
    postMock.mockResolvedValueOnce(annonce);
    const dto = { titre: "Titre", contenu: "Contenu", datePublication: "2026-01-01" };

    const result = await createAnnonce(dto);

    expect(postMock).toHaveBeenCalledWith("/annonces", dto, { skipForbiddenRedirect: true });
    expect(result).toBe(annonce);
  });

  it("updateAnnonce() effectue un PUT /annonces/{id} avec skipForbiddenRedirect", async () => {
    putMock.mockResolvedValueOnce(annonce);
    const dto = { titre: "Nouveau titre" };

    const result = await updateAnnonce("a1", dto);

    expect(putMock).toHaveBeenCalledWith("/annonces/a1", dto, { skipForbiddenRedirect: true });
    expect(result).toBe(annonce);
  });

  it("deleteAnnonce() effectue un DELETE /annonces/{id} avec skipForbiddenRedirect", async () => {
    deleteMock.mockResolvedValueOnce(undefined);

    await deleteAnnonce("a1");

    expect(deleteMock).toHaveBeenCalledWith("/annonces/a1", { skipForbiddenRedirect: true });
  });

  it("publishAnnonce() effectue un POST /annonces/{id}/publier quand statut=PUBLIE", async () => {
    postMock.mockResolvedValueOnce(annonce);

    const result = await publishAnnonce("a1", StatutAnnonce.PUBLIE);

    expect(postMock).toHaveBeenCalledWith("/annonces/a1/publier", undefined, { skipForbiddenRedirect: true });
    expect(result).toBe(annonce);
  });

  it("publishAnnonce() effectue un POST /annonces/{id}/depublier quand statut=DEPUBLIE", async () => {
    postMock.mockResolvedValueOnce(annonce);

    await publishAnnonce("a1", StatutAnnonce.DEPUBLIE);

    expect(postMock).toHaveBeenCalledWith("/annonces/a1/depublier", undefined, { skipForbiddenRedirect: true });
  });
});
