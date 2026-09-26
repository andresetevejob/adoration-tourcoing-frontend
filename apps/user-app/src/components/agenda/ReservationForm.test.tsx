import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReservationForm } from "./ReservationForm";

const slot = { start: "2026-01-01T10:00:00Z", end: "2026-01-01T11:00:00Z" };

describe("components/agenda/ReservationForm (user-app)", () => {
  it("n'affiche rien quand isOpen est false", () => {
    render(<ReservationForm isOpen={false} onClose={vi.fn()} slot={slot} onSubmit={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("affiche le récapitulatif du créneau en lecture seule", () => {
    render(<ReservationForm isOpen onClose={vi.fn()} slot={slot} onSubmit={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Réserver ce créneau" })).toBeInTheDocument();
  });

  it("appelle onSubmit avec la description saisie, sans jamais appeler l'API", () => {
    const onSubmit = vi.fn();
    render(<ReservationForm isOpen onClose={vi.fn()} slot={slot} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Description (facultatif)"), {
      target: { value: "Adoration silencieuse" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Réserver" }));

    return waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ description: "Adoration silencieuse" });
    });
  });

  it("appelle onClose au clic sur Annuler", () => {
    const onClose = vi.fn();
    render(<ReservationForm isOpen onClose={onClose} slot={slot} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(onClose).toHaveBeenCalled();
  });
});
