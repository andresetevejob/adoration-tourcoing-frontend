import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageQuiSommesNous from "./PageQuiSommesNous";

describe("pages/PageQuiSommesNous (user-app)", () => {
  it("affiche le titre, l'histoire, les valeurs, la frise et l'équipe", () => {
    render(<PageQuiSommesNous />);

    expect(screen.getByRole("heading", { name: "Qui sommes-nous ?", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Un siècle et demi de prière ininterrompue" })).toBeInTheDocument();
    expect(screen.getByText("Prière")).toBeInTheDocument();
    expect(screen.getByText("1885")).toBeInTheDocument();
    expect(screen.getByText("Père Jean-Marie")).toBeInTheDocument();
  });
});
