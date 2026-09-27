import { describe, expect, it } from "vitest";
import { truncateExcerpt } from "./excerpt";

describe("lib/excerpt", () => {
  it("retourne le contenu inchangé si déjà plus court que la limite", () => {
    expect(truncateExcerpt("Court texte.", 220)).toBe("Court texte.");
  });

  it("tronque et ajoute une ellipse si le contenu dépasse la limite", () => {
    const contenu = "a".repeat(300);

    const result = truncateExcerpt(contenu, 220);

    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(221);
  });

  it("coupe sur un espace plutôt qu'au milieu d'un mot", () => {
    const contenu = `${"mot ".repeat(60)}dernierMot`;

    const result = truncateExcerpt(contenu, 50);

    expect(result.endsWith("…")).toBe(true);
    expect(result.slice(0, -1).endsWith(" ")).toBe(false);
    expect(contenu.startsWith(result.slice(0, -1))).toBe(true);
  });

  it("utilise 220 comme longueur par défaut", () => {
    const contenu = "b".repeat(250);

    const result = truncateExcerpt(contenu);

    expect(result.length).toBe(221);
  });
});
