import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatutAnnonce, type AnnonceResponse } from "@chapelle/shared/types";
import { listAnnonces } from "./annonces";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("../client", () => ({
  apiClient: {
    get: getMock,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const annonces: AnnonceResponse[] = [
  {
    id: "a1",
    titre: "Titre",
    contenu: "Contenu",
    datePublication: "2026-01-01",
    statut: StatutAnnonce.PUBLIE,
  },
];

describe("api/endpoints/annonces (user-app)", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("listAnnonces() effectue un GET /annonces avec le statut fourni", async () => {
    getMock.mockResolvedValueOnce(annonces);

    const result = await listAnnonces({ statut: StatutAnnonce.PUBLIE });

    expect(getMock).toHaveBeenCalledWith("/annonces", { statut: StatutAnnonce.PUBLIE }, { skipAuthRetry: true });
    expect(result).toBe(annonces);
  });

  it("transmet statut undefined quand non fourni", async () => {
    getMock.mockResolvedValueOnce(annonces);

    await listAnnonces({});

    expect(getMock).toHaveBeenCalledWith("/annonces", { statut: undefined }, { skipAuthRetry: true });
  });
});
