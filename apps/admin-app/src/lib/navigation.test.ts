import { afterEach, describe, expect, it, vi } from "vitest";
import { navigate, setNavigate } from "./navigation";

describe("lib/navigation", () => {
  afterEach(() => {
    setNavigate(() => {
      /* no-op */
    });
  });

  it("ne plante pas si navigate() est appelé avant tout setNavigate()", () => {
    expect(() => {
      navigate("/quelque-part");
    }).not.toThrow();
  });

  it("délègue les appels navigate() à la fonction enregistrée via setNavigate()", () => {
    const fn = vi.fn();
    setNavigate(fn);

    navigate("/connexion", { replace: true });

    expect(fn).toHaveBeenCalledWith("/connexion", { replace: true });
  });

  it("transmet l'absence d'options telle quelle", () => {
    const fn = vi.fn();
    setNavigate(fn);

    navigate("/mon-compte");

    expect(fn).toHaveBeenCalledWith("/mon-compte", undefined);
  });

  it("permet de remplacer la fonction enregistrée par un appel ultérieur à setNavigate()", () => {
    const first = vi.fn();
    const second = vi.fn();
    setNavigate(first);
    setNavigate(second);

    navigate("/non-autorise");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith("/non-autorise", undefined);
  });
});
