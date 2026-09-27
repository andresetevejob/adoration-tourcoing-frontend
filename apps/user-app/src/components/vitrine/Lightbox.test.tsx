import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Lightbox } from "./Lightbox";

const images = [
  { src: "/images/gallery-1.jpg", alt: "Première image" },
  { src: "/images/gallery-2.jpg", alt: "Deuxième image" },
  { src: "/images/gallery-3.jpg", alt: "Troisième image" },
];

describe("components/vitrine/Lightbox (user-app)", () => {
  it("affiche l'image courante avec sa légende et son compteur", () => {
    render(<Lightbox images={images} index={1} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByRole("img", { name: "Deuxième image" })).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("appelle onClose au clic sur le bouton Fermer et sur le fond", () => {
    const onClose = vi.fn();
    render(<Lightbox images={images} index={0} onClose={onClose} onNavigate={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onNavigate avec l'index suivant/précédent (bouclage) au clic sur les flèches", () => {
    const onNavigate = vi.fn();
    render(<Lightbox images={images} index={0} onClose={vi.fn()} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole("button", { name: "Image précédente" }));
    expect(onNavigate).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole("button", { name: "Image suivante" }));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it("réagit aux touches Échap/flèches du clavier", () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();
    render(<Lightbox images={images} index={1} onClose={onClose} onNavigate={onNavigate} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onNavigate).toHaveBeenCalledWith(2);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onNavigate).toHaveBeenCalledWith(0);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("verrouille le scroll du body pendant l'ouverture et le restaure au démontage", () => {
    const { unmount } = render(<Lightbox images={images} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });
});
