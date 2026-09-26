import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, type BadgeProps } from "./Badge";

const variantClass: Record<BadgeProps["variant"], string> = {
  success: "bg-emerald-100",
  warning: "bg-gold-100",
  danger: "bg-red-100",
  info: "bg-night-100",
  neutral: "bg-pearl",
};

describe("Badge", () => {
  it("affiche le contenu enfant", () => {
    render(<Badge variant="success">Validé</Badge>);
    expect(screen.getByText("Validé")).toBeInTheDocument();
  });

  it.each(Object.entries(variantClass) as [BadgeProps["variant"], string][])(
    "applique la classe attendue pour la variante %s",
    (variant, expectedClass) => {
      render(<Badge variant={variant}>Texte</Badge>);
      expect(screen.getByText("Texte").className).toContain(expectedClass);
    },
  );
});
