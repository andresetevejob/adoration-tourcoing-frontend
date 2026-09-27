import { beforeEach, describe, expect, it } from "vitest";
import { StatutAnnonce } from "../types/annonce";
import {
  createAnnonce,
  deleteAnnonce,
  getAnnonceById,
  listAnnonces,
  resetAnnoncesStore,
  setAnnonceStatut,
  updateAnnonce,
} from "./annoncesStore";

describe("mocks/annoncesStore", () => {
  beforeEach(() => {
    resetAnnoncesStore();
  });

  it("liste toutes les annonces du seed triées par datePublication décroissante", () => {
    const result = listAnnonces();

    expect(result).toHaveLength(4);
    expect(result.map((annonce) => annonce.datePublication)).toEqual([
      "2026-06-02",
      "2026-05-15",
      "2026-05-05",
      "2026-04-18",
    ]);
  });

  it("filtre par statut quand fourni", () => {
    const result = listAnnonces(StatutAnnonce.PUBLIE);

    expect(result).toHaveLength(2);
    expect(result.every((annonce) => annonce.statut === StatutAnnonce.PUBLIE)).toBe(true);
  });

  it("getAnnonceById() retourne l'annonce correspondante ou undefined", () => {
    expect(getAnnonceById("annonce-1")?.titre).toBe("Nouveaux horaires d'adoration");
    expect(getAnnonceById("inconnu")).toBeUndefined();
  });

  it("createAnnonce() ajoute une annonce en statut BROUILLON avec un id généré", () => {
    const dto = { titre: "Titre", contenu: "Contenu", datePublication: "2026-07-01" };

    const created = createAnnonce(dto);

    expect(created.statut).toBe(StatutAnnonce.BROUILLON);
    expect(created.id).toBeTruthy();
    expect(getAnnonceById(created.id)).toEqual(created);
  });

  it("updateAnnonce() modifie les champs fournis sans toucher au statut", () => {
    const updated = updateAnnonce("annonce-3", { titre: "Nouveau titre" });

    expect(updated?.titre).toBe("Nouveau titre");
    expect(updated?.statut).toBe(StatutAnnonce.BROUILLON);
  });

  it("updateAnnonce() retourne undefined si l'id est inconnu", () => {
    expect(updateAnnonce("inconnu", { titre: "X" })).toBeUndefined();
  });

  it("deleteAnnonce() supprime l'annonce et retourne true, false si déjà absente", () => {
    expect(deleteAnnonce("annonce-1")).toBe(true);
    expect(getAnnonceById("annonce-1")).toBeUndefined();
    expect(deleteAnnonce("annonce-1")).toBe(false);
  });

  it("setAnnonceStatut() change le statut de l'annonce", () => {
    const updated = setAnnonceStatut("annonce-3", StatutAnnonce.PUBLIE);

    expect(updated?.statut).toBe(StatutAnnonce.PUBLIE);
  });

  it("setAnnonceStatut() retourne undefined si l'id est inconnu", () => {
    expect(setAnnonceStatut("inconnu", StatutAnnonce.PUBLIE)).toBeUndefined();
  });

  it("resetAnnoncesStore() réinitialise l'état au seed", () => {
    createAnnonce({ titre: "Temp", contenu: "Temp", datePublication: "2026-07-01" });
    deleteAnnonce("annonce-1");

    resetAnnoncesStore();

    expect(listAnnonces()).toHaveLength(4);
    expect(getAnnonceById("annonce-1")).toBeDefined();
  });
});
