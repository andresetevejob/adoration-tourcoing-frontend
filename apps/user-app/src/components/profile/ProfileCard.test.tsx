import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { ProfileCard } from "./ProfileCard";

const baseUser: UserResponse = {
  id: "1",
  email: "adorateur@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  telephone: "0612345678",
  role: UserRole.ADORATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

describe("components/profile/ProfileCard (user-app)", () => {
  it("affiche nom/prénoms/email/téléphone", () => {
    render(<ProfileCard user={baseUser} />);

    expect(screen.getByText("Dupont")).toBeInTheDocument();
    expect(screen.getByText("Jean")).toBeInTheDocument();
    expect(screen.getByText("adorateur@example.com")).toBeInTheDocument();
    expect(screen.getByText("0612345678")).toBeInTheDocument();
  });

  it("affiche '—' quand le téléphone est absent", () => {
    render(<ProfileCard user={{ ...baseUser, telephone: undefined }} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it.each([
    [StatutValidation.VALIDE, "Validé"],
    [StatutValidation.EN_ATTENTE, "En attente"],
    [StatutValidation.REJETE, "Rejeté"],
  ])("affiche le badge de statut '%s' -> '%s'", (statutValidation, label) => {
    render(<ProfileCard user={{ ...baseUser, statutValidation }} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
