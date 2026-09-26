import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { ReservationForm } from "./ReservationForm";
import { useVeilleurs } from "../../hooks/useVeilleurs";

vi.mock("../../hooks/useVeilleurs");

const slot = { start: "2026-01-01T10:00:00Z", end: "2026-01-01T11:00:00Z" };

const veilleur: UserResponse = {
  id: "v1",
  email: "jean.dupont@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.VEILLEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

function mockVeilleurs(data: UserResponse[] = [veilleur]) {
  vi.mocked(useVeilleurs).mockReturnValue({
    data,
    isLoading: false,
  } as unknown as ReturnType<typeof useVeilleurs>);
}

describe("components/planning/ReservationForm (admin-app)", () => {
  it("n'affiche rien quand isOpen est false", () => {
    mockVeilleurs();
    render(<ReservationForm isOpen={false} onClose={vi.fn()} slot={slot} onSubmit={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("soumet une réservation pour soi-même sans VeilleurSelect visible par défaut", async () => {
    mockVeilleurs();
    const onSubmit = vi.fn();
    render(<ReservationForm isOpen onClose={vi.fn()} slot={slot} onSubmit={onSubmit} />);

    expect(screen.queryByLabelText("Rechercher un Veilleur")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Réserver" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ beneficiaire: "moi", description: "" });
    });
  });

  it("affiche VeilleurSelect et bloque la soumission tant qu'aucun Veilleur n'est choisi", async () => {
    mockVeilleurs();
    const onSubmit = vi.fn();
    render(<ReservationForm isOpen onClose={vi.fn()} slot={slot} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByLabelText("Un Veilleur"));
    expect(await screen.findByLabelText("Rechercher un Veilleur")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Réserver" }));

    await waitFor(() => {
      expect(screen.getByText("Sélectionnez un Veilleur")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("soumet beneficiaire=veilleur avec veilleurId une fois un Veilleur sélectionné", async () => {
    mockVeilleurs();
    const onSubmit = vi.fn();
    render(<ReservationForm isOpen onClose={vi.fn()} slot={slot} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByLabelText("Un Veilleur"));
    fireEvent.click(await screen.findByRole("button", { name: /Jean Dupont/ }));
    fireEvent.click(screen.getByRole("button", { name: "Réserver" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ beneficiaire: "veilleur", veilleurId: "v1", description: "" });
    });
  });
});
