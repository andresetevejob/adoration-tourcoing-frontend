import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page404 from "./Page404";

describe("pages/Page404 (user-app)", () => {
  it("affiche le message de page introuvable", () => {
    render(<Page404 />);

    expect(screen.getByRole("heading", { name: "Page introuvable" })).toBeInTheDocument();
  });
});
