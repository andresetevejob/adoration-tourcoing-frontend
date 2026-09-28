import { createRef, type FormEvent } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

  it("n'affiche pas le bouton oeil quand type n'est pas password", () => {
    render(<Input label="Email" type="email" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("n'affiche pas le bouton oeil sans type (texte par défaut)", () => {
    render(<Input label="Nom" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("affiche le bouton oeil quand type est password", () => {
    render(<Input label="Mot de passe" type="password" />);
    expect(screen.getByRole("button", { name: "Afficher le mot de passe" })).toBeInTheDocument();
  });

  it("masque le mot de passe par défaut", () => {
    render(<Input label="Mot de passe" type="password" />);
    expect(screen.getByLabelText("Mot de passe")).toHaveAttribute("type", "password");
  });

  it("bascule le type de l'input et l'aria-label du bouton au clic", () => {
    render(<Input label="Mot de passe" type="password" />);
    const input = screen.getByLabelText("Mot de passe");
    const toggle = screen.getByRole("button", { name: "Afficher le mot de passe" });

    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Masquer le mot de passe" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Masquer le mot de passe" }));
    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Afficher le mot de passe" })).toBeInTheDocument();
  });

  it("préserve la valeur saisie après la bascule de visibilité", () => {
    render(<Input label="Mot de passe" type="password" />);
    const input = screen.getByLabelText("Mot de passe");

    fireEvent.change(input, { target: { value: "Secr3t!" } });
    fireEvent.click(screen.getByRole("button", { name: "Afficher le mot de passe" }));

    expect(input).toHaveValue("Secr3t!");
    expect(input).toHaveAttribute("type", "text");
  });

  it("le bouton oeil ne déclenche pas la soumission du formulaire englobant", () => {
    const onSubmit = vi.fn((event: FormEvent) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <Input label="Mot de passe" type="password" />
      </form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Afficher le mot de passe" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
