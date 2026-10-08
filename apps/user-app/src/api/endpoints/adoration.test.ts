import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StatutAdorationDirectResponse } from "@chapelle/shared/types";
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

  it("getStatutAdorationDirect() effectue un GET /adoration/en-cours sans paramètre", async () => {
    const response: StatutAdorationDirectResponse = {
      enCours: true,
      creneauActuel: { dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-01T11:00:00Z" },
    };
    getMock.mockResolvedValueOnce(response);

    const result = await getStatutAdorationDirect();

    expect(getMock).toHaveBeenCalledWith("/adoration/en-cours");
    expect(result).toBe(response);
  });
});
