import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "./ContactForm";

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Jean Dupont" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean@test.fr" } });
  fireEvent.change(screen.getByLabelText("Sujet"), { target: { value: "info" } });
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Un message suffisamment long." } });
}

describe("components/contact/ContactForm (user-app)", () => {
  it("affiche nom, email, sujet et message", () => {
    render(<ContactForm isSubmitting={false} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Sujet")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("appelle onSubmit avec le ContactMessageDto trimé quand tous les champs sont valides", async () => {
    const onSubmit = vi.fn();
    render(<ContactForm isSubmitting={false} onSubmit={onSubmit} />);

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le message" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        nom: "Jean Dupont",
        email: "jean@test.fr",
        sujet: "info",
        message: "Un message suffisamment long.",
      });
    });
  });

  it("n'appelle pas onSubmit et affiche une erreur quand le nom est vide", async () => {
    const onSubmit = vi.fn();
    render(<ContactForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean@test.fr" } });
    fireEvent.change(screen.getByLabelText("Sujet"), { target: { value: "info" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Un message suffisamment long." } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le message" }));

    await waitFor(() => {
      expect(screen.getByText("Le nom est requis.")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("n'appelle pas onSubmit et affiche une erreur quand l'email est malformé", async () => {
    const onSubmit = vi.fn();
    render(<ContactForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Jean" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pas-un-email" } });
    fireEvent.change(screen.getByLabelText("Sujet"), { target: { value: "info" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Un message suffisamment long." } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le message" }));

    await waitFor(() => {
      expect(screen.getByText("Email invalide.")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("n'appelle pas onSubmit et affiche une erreur quand aucun sujet n'est choisi", async () => {
    const onSubmit = vi.fn();
    render(<ContactForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Jean" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean@test.fr" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Un message suffisamment long." } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le message" }));

    await waitFor(() => {
      expect(screen.getByText("Veuillez choisir un sujet.")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("n'appelle pas onSubmit et affiche une erreur quand le message fait moins de 10 caractères", async () => {
    const onSubmit = vi.fn();
    render(<ContactForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Jean" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean@test.fr" } });
    fireEvent.change(screen.getByLabelText("Sujet"), { target: { value: "info" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Court" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le message" }));

    await waitFor(() => {
      expect(screen.getByText("Minimum 10 caractères.")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
