import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatutAnnonce } from "@chapelle/shared/types";
import { AnnonceStatutBadge } from "./AnnonceStatutBadge";

describe("components/annonces/AnnonceStatutBadge", () => {
  it.each([
    [StatutAnnonce.BROUILLON, "Brouillon"],
    [StatutAnnonce.PUBLIE, "Publié"],
    [StatutAnnonce.DEPUBLIE, "Dépublié"],
  ])("affiche le libellé « %s » -> « %s »", (statut, label) => {
    render(<AnnonceStatutBadge statut={statut} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
