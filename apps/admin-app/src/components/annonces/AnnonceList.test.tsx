import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatutAnnonce, type AnnonceResponse } from "@chapelle/shared/types";
import { AnnonceList } from "./AnnonceList";

const annonces: AnnonceResponse[] = [
  {
    id: "a1",
    titre: "Annonce brouillon",
    contenu: "Contenu",
    datePublication: "2026-01-01",
    statut: StatutAnnonce.BROUILLON,
  },
  {
    id: "a2",
    titre: "Annonce publiee",
    contenu: "Contenu",
    datePublication: "2026-02-01",
    statut: StatutAnnonce.PUBLIE,
  },
];

describe("components/annonces/AnnonceList (admin-app)", () => {
  it("affiche les colonnes Titre/Date/Statut et les libellés Publier/Dépublier selon le statut", () => {
    render(
      <AnnonceList
        annonces={annonces}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTogglePublication={vi.fn()}
      />,
    );

    expect(screen.getByText("Annonce brouillon")).toBeInTheDocument();
    expect(screen.getByText("Annonce publiee")).toBeInTheDocument();
    expect(screen.getByText("Brouillon")).toBeInTheDocument();
    expect(screen.getByText("Publié")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Publier" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Dépublier" })).toHaveLength(1);
  });

  it("appelle onEdit/onDelete/onTogglePublication au clic sur les boutons de la ligne", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onTogglePublication = vi.fn();
    render(
      <AnnonceList
        annonces={[annonces[0]]}
        isLoading={false}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePublication={onTogglePublication}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
    expect(onEdit).toHaveBeenCalledWith(annonces[0]);

    fireEvent.click(screen.getByRole("button", { name: "Publier" }));
    expect(onTogglePublication).toHaveBeenCalledWith(annonces[0]);

    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(onDelete).toHaveBeenCalledWith(annonces[0]);
  });

  it("désactive uniquement le bouton Publier/Dépublier de la ligne en cours de bascule (togglingIds)", () => {
    render(
      <AnnonceList
        annonces={annonces}
        isLoading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTogglePublication={vi.fn()}
        togglingIds={new Set(["a2"])}
      />,
    );

    expect(screen.getByRole("button", { name: /Dépublier/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Publier/ })).not.toBeDisabled();
  });

  it("affiche le message vide quand la liste est vide", () => {
    render(
      <AnnonceList annonces={[]} isLoading={false} onEdit={vi.fn()} onDelete={vi.fn()} onTogglePublication={vi.fn()} />,
    );

    expect(screen.getByText("Aucune annonce trouvée.")).toBeInTheDocument();
  });
});
