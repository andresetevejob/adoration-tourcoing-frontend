import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlanningEntryResponse } from "@chapelle/shared/types";
import { UserRole } from "@chapelle/shared/types";
import { ApiError } from "@chapelle/shared/api";
import { getStatutAdorationDirect } from "./adoration";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("../client", () => ({
  apiClient: {
    get: getMock,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("api/endpoints/adoration (user-app)", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("getStatutAdorationDirect() effectue un GET /adoration/en-cours sans paramètre et normalise une 200 (entrée brute) en enCours:true", async () => {
    const entry: PlanningEntryResponse = {
      id: "entry-1",
      idUtilisateur: "user-1",
      nomUtilisateur: "Dupont",
      prenomsUtilisateur: "Jean",
      roleUtilisateur: UserRole.VEILLEUR,
      dateDebut: "2026-01-01T10:00:00Z",
      dateFin: "2026-01-01T11:00:00Z",
      estArchivee: false,
      estAnonymise: false,
    };
    getMock.mockResolvedValueOnce(entry);

    const result = await getStatutAdorationDirect();

    expect(getMock).toHaveBeenCalledWith("/adoration/en-cours", undefined, { skipAuthRetry: true });
    expect(result).toEqual({
      enCours: true,
      creneauActuel: { dateDebut: entry.dateDebut, dateFin: entry.dateFin },
    });
  });

  it("getStatutAdorationDirect() normalise une 404 (ApiError) en enCours:false, creneauActuel:null", async () => {
    getMock.mockRejectedValueOnce(new ApiError("NOT_FOUND", 404, "Aucune adoration en cours"));

    const result = await getStatutAdorationDirect();

    expect(result).toEqual({ enCours: false, creneauActuel: null });
  });

  it("getStatutAdorationDirect() propage les erreurs autres qu'une 404 (ex. ApiError 500, ou erreur réseau)", async () => {
    const error = new ApiError("INTERNAL_ERROR", 500, "Erreur serveur");
    getMock.mockRejectedValueOnce(error);

    await expect(getStatutAdorationDirect()).rejects.toBe(error);
  });
});
