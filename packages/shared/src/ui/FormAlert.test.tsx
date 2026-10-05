import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormAlert } from "./FormAlert";

describe("FormAlert", () => {
  it("affiche le message avec role=alert", () => {
    render(<FormAlert message="Cet email est déjà utilisé" onDismiss={vi.fn()} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Cet email est déjà utilisé");
  });

  it("appelle onDismiss au clic sur le bouton de fermeture", () => {
    const onDismiss = vi.fn();
    render(<FormAlert message="Erreur" onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
