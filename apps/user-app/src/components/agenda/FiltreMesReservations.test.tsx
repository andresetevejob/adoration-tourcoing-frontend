import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FiltreMesReservations } from "./FiltreMesReservations";

describe("FiltreMesReservations (user-app)", () => {
  it("reflète l'état checked fourni", () => {
    render(<FiltreMesReservations checked={false} onChange={vi.fn()} />);

    expect(screen.getByLabelText("Mes réservations uniquement")).not.toBeChecked();
  });

  it("appelle onChange avec la nouvelle valeur au clic", () => {
    const onChange = vi.fn();
    render(<FiltreMesReservations checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Mes réservations uniquement"));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
