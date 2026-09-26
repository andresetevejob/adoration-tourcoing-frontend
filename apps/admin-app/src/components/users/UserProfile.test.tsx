import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { UserProfile } from "./UserProfile";

const baseUser: UserResponse = {
  id: "u1",
  email: "jean.dupont@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  telephone: "0612345678",
  role: UserRole.VEILLEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

describe("components/users/UserProfile (admin-app)", () => {
  it("affiche nom/prénoms/email/téléphone/rôle/date de création", () => {
    render(<UserProfile user={baseUser} />);

    expect(screen.getByText("Dupont")).toBeInTheDocument();
    expect(screen.getByText("Jean")).toBeInTheDocument();
    expect(screen.getByText("jean.dupont@example.com")).toBeInTheDocument();
    expect(screen.getByText("0612345678")).toBeInTheDocument();
    expect(screen.getByText("Veilleur")).toBeInTheDocument();
    expect(screen.getByText("01/01/2026")).toBeInTheDocument();
  });

  it("affiche '—' quand le téléphone est absent", () => {
    render(<UserProfile user={{ ...baseUser, telephone: undefined }} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it.each([
    [StatutValidation.VALIDE, "Validé"],
    [StatutValidation.EN_ATTENTE, "En attente"],
    [StatutValidation.REJETE, "Rejeté"],
  ])("affiche le badge de statut '%s' -> '%s'", (statutValidation, label) => {
    render(<UserProfile user={{ ...baseUser, statutValidation }} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
