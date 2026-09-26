import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageAccueil from "./PageAccueil";

describe("pages/PageAccueil (user-app)", () => {
  it("affiche le titre principal", () => {
    render(<PageAccueil />);

    expect(
      screen.getByRole("heading", { name: /Chapelle du Vœux — Adoration Eucharistique/ }),
    ).toBeInTheDocument();
  });
});
