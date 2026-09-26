import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatutReservation, type BookingResponse } from "@chapelle/shared/types";
import { MyBookingsList } from "./MyBookingsList";

function booking(id: string, status: StatutReservation): BookingResponse {
  return {
    id,
    idUtilisateur: "u1",
    creatorId: "u1",
    dateDebut: "2026-01-01T10:00:00Z",
    dateFin: "2026-01-01T11:00:00Z",
    status,
    dateCreation: "2025-12-01T00:00:00Z",
    estArchivee: false,
  };
}

describe("components/profile/MyBookingsList (user-app)", () => {
  it("affiche le message vide quand il n'y a aucune réservation", () => {
    render(<MyBookingsList bookings={[]} isLoading={false} />);

    expect(screen.getByText("Aucune réservation pour le moment.")).toBeInTheDocument();
  });

  it("affiche le spinner de chargement quand isLoading est true", () => {
    render(<MyBookingsList bookings={[]} isLoading />);

    expect(screen.getByRole("status", { name: "Chargement" })).toBeInTheDocument();
  });

  it("affiche une ligne par réservation avec le libellé de statut", () => {
    render(
      <MyBookingsList
        bookings={[booking("b1", StatutReservation.EFFECTUEE), booking("b2", StatutReservation.ANNULEE)]}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Effectuée")).toBeInTheDocument();
    expect(screen.getByText("Annulée")).toBeInTheDocument();
  });
});
