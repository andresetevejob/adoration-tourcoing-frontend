import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserRole, type PlanningEntryResponse } from "@chapelle/shared/types";
import { ReservationConfirmModal } from "./ReservationConfirmModal";

function entry(overrides: Partial<PlanningEntryResponse> = {}): PlanningEntryResponse {
  return {
    id: "e1",
    idUtilisateur: "u1",
    nomUtilisateur: "Dupont",
    prenomsUtilisateur: "Jean",
    roleUtilisateur: UserRole.VEILLEUR,
    dateDebut: "2026-01-01T10:00:00Z",
    dateFin: "2026-01-01T11:00:00Z",
    estArchivee: false,
    estAnonymise: false,
    ...overrides,
  };
}

describe("components/planning/ReservationConfirmModal (admin-app)", () => {
  it("variant create : affiche le récapitulatif et appelle onConfirm", () => {
    const onConfirm = vi.fn();
    render(
      <ReservationConfirmModal
        variant="create"
        isOpen
        onClose={vi.fn()}
        dto={{ idUtilisateur: "v1", dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-01T11:00:00Z" }}
        beneficiaireLabel="Jean Dupont"
        isSubmitting={false}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Confirmer la réservation" })).toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("variant cancel : bouton Confirmer toujours actif, quelle que soit la date (pas de délai)", () => {
    const onConfirm = vi.fn();
    render(
      <ReservationConfirmModal
        variant="cancel"
        isOpen
        onClose={vi.fn()}
        booking={entry({ dateDebut: "2020-01-01T00:00:00Z" })}
        isSubmitting={false}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Confirmer l'annulation" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const confirmButton = screen.getByRole("button", { name: "Confirmer" });
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalled();
  });
});
