import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("associe le label au champ via htmlFor/id générés", () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
  });

  it("utilise l'id fourni explicitement plutôt qu'un id généré", () => {
    render(<Input label="Email" id="email-field" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "email-field");
  });

  it("génère des id distincts pour deux champs sans id explicite", () => {
    render(
      <>
        <Input label="Nom" />
        <Input label="Prénoms" />
      </>,
    );
    const nom = screen.getByLabelText("Nom");
    const prenoms = screen.getByLabelText("Prénoms");
    expect(nom.id).not.toBe(prenoms.id);
  });

  it("affiche le message d'erreur et aria-invalid quand error est fourni", () => {
    render(<Input label="Email" error="Email invalide" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Email invalide")).toBeInTheDocument();
  });

  it("aria-invalid est false sans erreur", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "false");
  });

  it("transmet le ref vers l'élément input DOM", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("propage les props natives et gère la saisie utilisateur", () => {
    render(<Input label="Email" placeholder="vous@exemple.com" />);
    const input = screen.getByPlaceholderText("vous@exemple.com");

    fireEvent.change(input, { target: { value: "test@example.com" } });

    expect(input).toHaveValue("test@example.com");
  });

  it("ne rend pas de label quand non fourni", () => {
    render(<Input placeholder="sans label" />);
    expect(screen.queryByText("", { selector: "label" })).not.toBeInTheDocument();
  });
});
