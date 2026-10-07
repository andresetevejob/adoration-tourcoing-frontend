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

describe("components/agenda/ReservationConfirmModal (user-app)", () => {
  it("variant create : affiche le récapitulatif et appelle onConfirm", () => {
    const onConfirm = vi.fn();
    render(
      <ReservationConfirmModal
        variant="create"
        isOpen
        onClose={vi.fn()}
        dto={{ dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-01T11:00:00Z" }}
        beneficiaireLabel="Moi-même"
        isSubmitting={false}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Confirmer la réservation" })).toBeInTheDocument();
    expect(screen.getByText("Moi-même")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("variant create : bouton Confirmer actif pour une durée de exactement 24h (borne incluse)", () => {
    render(
      <ReservationConfirmModal
        variant="create"
        isOpen
        onClose={vi.fn()}
        dto={{ dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-02T10:00:00Z" }}
        beneficiaireLabel="Moi-même"
        isSubmitting={false}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Confirmer" })).not.toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("variant create : bouton Confirmer désactivé et message affiché quand la durée dépasse 24h", () => {
    render(
      <ReservationConfirmModal
        variant="create"
        isOpen
        onClose={vi.fn()}
        dto={{ dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-02T10:00:01Z" }}
        beneficiaireLabel="Moi-même"
        isSubmitting={false}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Confirmer" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Un créneau ne peut pas dépasser 24h.");
  });

  it("variant cancel : bouton Confirmer actif quand le délai de 24h est respecté", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    render(
      <ReservationConfirmModal
        variant="cancel"
        isOpen
        onClose={vi.fn()}
        booking={entry({ dateDebut: "2026-01-03T00:00:00Z" })}
        isSubmitting={false}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Confirmer l'annulation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmer" })).not.toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("variant cancel : bouton Confirmer désactivé et message affiché quand le délai de 24h est dépassé", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    render(
      <ReservationConfirmModal
        variant="cancel"
        isOpen
        onClose={vi.fn()}
        booking={entry({ dateDebut: "2026-01-01T10:00:00Z" })}
        isSubmitting={false}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Confirmer" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Le délai d'annulation (24h) est dépassé.");

    vi.useRealTimers();
  });
});
