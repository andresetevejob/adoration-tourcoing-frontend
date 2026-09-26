import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole, type PageResponse, type PlanningEntryResponse } from "@chapelle/shared/types";
import { getPlanning } from "./planning";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("../client", () => ({
  apiClient: {
    get: getMock,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const entry: PlanningEntryResponse = {
  id: "e1",
  idUtilisateur: "u1",
  nomUtilisateur: "Dupont",
  prenomsUtilisateur: "Jean",
  roleUtilisateur: UserRole.VEILLEUR,
  dateDebut: "2026-01-01T10:00:00Z",
  dateFin: "2026-01-01T11:00:00Z",
  estArchivee: false,
  estAnonymise: false,
};

const page: PageResponse<PlanningEntryResponse> = {
  content: [entry],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  last: true,
};

describe("api/endpoints/planning (admin-app)", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("getPlanning() effectue un GET /planning avec les query params fournis", async () => {
    getMock.mockResolvedValueOnce(page);

    const result = await getPlanning({ date: "2026-01-01", page: 0, size: 20 });

    expect(getMock).toHaveBeenCalledWith("/planning", {
      date: "2026-01-01",
      page: 0,
      size: 20,
    });
    expect(result).toBe(page);
  });

  it("transmet date/page/size undefined tels quels quand ils ne sont pas fournis", async () => {
    getMock.mockResolvedValueOnce(page);

    await getPlanning({});

    expect(getMock).toHaveBeenCalledWith("/planning", {
      date: undefined,
      page: undefined,
      size: undefined,
    });
  });
});
