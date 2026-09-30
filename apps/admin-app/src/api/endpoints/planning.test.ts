import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole, type PageResponse, type PlanningEntryResponse } from "@chapelle/shared/types";
import { getPlanning, getPlanningIntervalle, getPlanningMensuel } from "./planning";

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

function entryWithId(id: string): PlanningEntryResponse {
  return { ...entry, id };
}

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

  describe("getPlanningMensuel", () => {
    it("effectue un GET /planning/mensuel avec annee/mois, page 0 et une taille d'agrégation de 100", async () => {
      getMock.mockResolvedValueOnce({
        content: [entryWithId("e1")],
        page: 0,
        size: 1,
        totalElements: 1,
        totalPages: 1,
        last: true,
      });

      const result = await getPlanningMensuel({ annee: 2026, mois: 3 });

      expect(getMock).toHaveBeenCalledWith("/planning/mensuel", {
        annee: 2026,
        mois: 3,
        page: 0,
        size: 100,
      });
      expect(result.content).toEqual([entryWithId("e1")]);
      expect(result.last).toBe(true);
    });

    it("agrège toutes les pages tant que `last` est false, en fusionnant `content`", async () => {
      getMock
        .mockResolvedValueOnce({
          content: [entryWithId("e1"), entryWithId("e2")],
          page: 0,
          size: 2,
          totalElements: 3,
          totalPages: 2,
          last: false,
        })
        .mockResolvedValueOnce({
          content: [entryWithId("e3")],
          page: 1,
          size: 1,
          totalElements: 3,
          totalPages: 2,
          last: true,
        });

      const result = await getPlanningMensuel({ annee: 2026, mois: 3 });

      expect(getMock).toHaveBeenCalledTimes(2);
      expect(getMock).toHaveBeenNthCalledWith(1, "/planning/mensuel", {
        annee: 2026,
        mois: 3,
        page: 0,
        size: 100,
      });
      expect(getMock).toHaveBeenNthCalledWith(2, "/planning/mensuel", {
        annee: 2026,
        mois: 3,
        page: 1,
        size: 100,
      });
      expect(result.content.map((e) => e.id)).toEqual(["e1", "e2", "e3"]);
      expect(result.totalElements).toBe(3);
      expect(result.last).toBe(true);
      expect(result.totalPages).toBe(1);
    });

    it("s'arrête après un nombre maximal de pages même si `last` ne devient jamais true (garde-fou anti-boucle infinie)", async () => {
      getMock.mockResolvedValue({
        content: [entryWithId("e1")],
        page: 0,
        size: 1,
        totalElements: 999,
        totalPages: 999,
        last: false,
      });

      const result = await getPlanningMensuel({ annee: 2026, mois: 3 });

      expect(getMock).toHaveBeenCalledTimes(50);
      expect(result.content).toHaveLength(50);
    });
  });

  describe("getPlanningIntervalle", () => {
    it("effectue un GET /planning/intervalle avec dateDebut/dateFin, page 0 et une taille d'agrégation de 100", async () => {
      getMock.mockResolvedValueOnce({
        content: [entryWithId("e1")],
        page: 0,
        size: 1,
        totalElements: 1,
        totalPages: 1,
        last: true,
      });

      const result = await getPlanningIntervalle({ dateDebut: "2026-01-01", dateFin: "2026-01-10" });

      expect(getMock).toHaveBeenCalledWith("/planning/intervalle", {
        dateDebut: "2026-01-01",
        dateFin: "2026-01-10",
        page: 0,
        size: 100,
      });
      expect(result.content).toEqual([entryWithId("e1")]);
    });

    it("agrège toutes les pages tant que `last` est false, en fusionnant `content`", async () => {
      getMock
        .mockResolvedValueOnce({
          content: [entryWithId("e1")],
          page: 0,
          size: 1,
          totalElements: 2,
          totalPages: 2,
          last: false,
        })
        .mockResolvedValueOnce({
          content: [entryWithId("e2")],
          page: 1,
          size: 1,
          totalElements: 2,
          totalPages: 2,
          last: true,
        });

      const result = await getPlanningIntervalle({ dateDebut: "2026-01-01", dateFin: "2026-01-10" });

      expect(getMock).toHaveBeenCalledTimes(2);
      expect(getMock).toHaveBeenNthCalledWith(1, "/planning/intervalle", {
        dateDebut: "2026-01-01",
        dateFin: "2026-01-10",
        page: 0,
        size: 100,
      });
      expect(getMock).toHaveBeenNthCalledWith(2, "/planning/intervalle", {
        dateDebut: "2026-01-01",
        dateFin: "2026-01-10",
        page: 1,
        size: 100,
      });
      expect(result.content.map((e) => e.id)).toEqual(["e1", "e2"]);
      expect(result.totalElements).toBe(2);
      expect(result.last).toBe(true);
    });
  });
});
