import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PagePlaceholder from "./PagePlaceholder";

describe("pages/PagePlaceholder (user-app)", () => {
  it("affiche le titre fourni et le message d'indisponibilité", () => {
    render(<PagePlaceholder title="Agenda" />);

    expect(screen.getByRole("heading", { name: "Agenda" })).toBeInTheDocument();
    expect(screen.getByText("Cette page sera disponible prochainement.")).toBeInTheDocument();
  });
});
