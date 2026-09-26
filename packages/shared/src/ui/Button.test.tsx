import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("affiche le contenu enfant", () => {
    render(<Button>Valider</Button>);
    expect(screen.getByRole("button", { name: "Valider" })).toBeInTheDocument();
  });

  it("applique la variante primary et la taille md par défaut", () => {
    render(<Button>OK</Button>);
    const button = screen.getByRole("button", { name: "OK" });
    expect(button.className).toContain("bg-gold-500");
    expect(button.className).toContain("px-4 py-2");
  });

  it("applique la classe de la variante danger", () => {
    render(<Button variant="danger">Supprimer</Button>);
    expect(screen.getByRole("button", { name: "Supprimer" }).className).toContain("bg-red-600");
  });

  it("déclenche onClick quand activé", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Cliquer</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Cliquer" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("est désactivé et n'appelle pas onClick quand disabled", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Cliquer
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Cliquer" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("affiche un spinner et désactive le bouton quand isLoading est vrai", () => {
    render(<Button isLoading>Envoyer</Button>);
    const button = screen.getByRole("button", { name: /Envoyer/ });
    expect(button).toBeDisabled();
    expect(screen.getByRole("status", { name: "Chargement" })).toBeInTheDocument();
  });

  it("fusionne une className custom en résolvant les conflits Tailwind", () => {
    render(<Button className="bg-emerald-500">Custom</Button>);
    const button = screen.getByRole("button", { name: "Custom" });
    expect(button.className).toContain("bg-emerald-500");
    expect(button.className).not.toContain("bg-gold-500");
  });
});
