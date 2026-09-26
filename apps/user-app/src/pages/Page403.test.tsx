import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page403 from "./Page403";

describe("pages/Page403 (user-app)", () => {
  it("affiche le message d'accès non autorisé", () => {
    render(<Page403 />);

    expect(screen.getByRole("heading", { name: "Accès non autorisé" })).toBeInTheDocument();
  });
});
