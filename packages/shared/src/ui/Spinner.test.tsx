import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("a le rôle status et un aria-label Chargement", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Chargement" })).toBeInTheDocument();
  });

  it("applique la taille md par défaut", () => {
    render(<Spinner />);
    expect(screen.getByRole("status").className).toContain("h-6 w-6");
  });

  it("applique la taille sm", () => {
    render(<Spinner size="sm" />);
    expect(screen.getByRole("status").className).toContain("h-4 w-4");
  });

  it("applique la taille lg", () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole("status").className).toContain("h-10 w-10");
  });
});
