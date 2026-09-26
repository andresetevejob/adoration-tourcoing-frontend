import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("concatène des classes simples", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("ignore les valeurs falsy", () => {
    expect(cn("flex", false, undefined, null, "", "gap-2")).toBe("flex gap-2");
  });

  it("supporte les objets conditionnels de clsx", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("fusionne les classes Tailwind conflictuelles via tailwind-merge (dernière gagne)", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("résout un conflit de couleur de fond", () => {
    expect(cn("bg-red-500", "bg-gold-500")).toBe("bg-gold-500");
  });

  it("supporte les tableaux imbriqués", () => {
    expect(cn(["flex", "gap-2"], "items-center")).toBe("flex gap-2 items-center");
  });
});
