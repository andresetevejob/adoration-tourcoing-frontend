import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("ne rend rien quand isOpen est false", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Contenu
      </Modal>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("rend le dialogue avec titre et enfants quand isOpen est true", () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Confirmation">
        Contenu de la modale
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Confirmation")).toBeInTheDocument();
    expect(screen.getByText("Contenu de la modale")).toBeInTheDocument();
  });

  it("rend le footer quand fourni", () => {
    render(
      <Modal isOpen onClose={vi.fn()} footer={<button type="button">Fermer</button>}>
        Contenu
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument();
  });

  it("appelle onClose au clic sur le fond (backdrop)", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Titre">
        Contenu
      </Modal>,
    );

    const backdrop = document.querySelector('[aria-hidden="true"]');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("n'appelle pas onClose au clic sur le contenu du dialogue", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Titre">
        Contenu cliquable
      </Modal>,
    );

    fireEvent.click(screen.getByText("Contenu cliquable"));

    expect(onClose).not.toHaveBeenCalled();
  });
});
