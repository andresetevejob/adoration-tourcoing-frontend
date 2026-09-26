import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PagePlaceholder from "./PagePlaceholder";

describe("pages/PagePlaceholder (admin-app)", () => {
  it("affiche le titre fourni et le message d'indisponibilité", () => {
    render(<PagePlaceholder title="Gestion des utilisateurs" />);

    expect(screen.getByRole("heading", { name: "Gestion des utilisateurs" })).toBeInTheDocument();
    expect(screen.getByText("Cette page sera disponible prochainement.")).toBeInTheDocument();
  });
});
