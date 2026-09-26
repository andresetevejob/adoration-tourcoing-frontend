import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatutValidation } from "@chapelle/shared/types";
import { StatutValidationBadge } from "./StatutValidationBadge";

describe("components/users/StatutValidationBadge (admin-app)", () => {
  it.each([
    [StatutValidation.VALIDE, "Validé"],
    [StatutValidation.EN_ATTENTE, "En attente"],
    [StatutValidation.REJETE, "Rejeté"],
  ])("affiche le badge de statut '%s' -> '%s'", (statut, label) => {
    render(<StatutValidationBadge statut={statut} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
