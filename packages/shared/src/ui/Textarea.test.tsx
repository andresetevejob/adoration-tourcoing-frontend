import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("associe le label au champ via htmlFor/id générés", () => {
    render(<Textarea label="Contenu" />);
    expect(screen.getByLabelText("Contenu")).toBeInTheDocument();
  });

  it("affiche le message d'erreur et aria-invalid quand error est fourni", () => {
    render(<Textarea label="Contenu" error="Contenu requis" />);
    const textarea = screen.getByLabelText("Contenu");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Contenu requis")).toBeInTheDocument();
  });

  it("transmet le ref vers l'élément textarea DOM", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea label="Contenu" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("propage les props natives et gère la saisie multi-ligne", () => {
    render(<Textarea label="Contenu" placeholder="Votre texte" />);
    const textarea = screen.getByPlaceholderText("Votre texte");

    fireEvent.change(textarea, { target: { value: "ligne 1\nligne 2" } });

    expect(textarea).toHaveValue("ligne 1\nligne 2");
  });
});
