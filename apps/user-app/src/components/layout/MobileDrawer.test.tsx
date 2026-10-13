import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Link } from "react-router";
import { MobileDrawer } from "./MobileDrawer";

function renderDrawer(isOpen: boolean, onClose: () => void, children = <Link to="/agenda">Agenda</Link>) {
  return render(
    <MemoryRouter>
      <MobileDrawer isOpen={isOpen} onClose={onClose} id="drawer-id" label="Menu">
        {children}
      </MobileDrawer>
    </MemoryRouter>,
  );
}

describe("components/layout/MobileDrawer (user-app)", () => {
  it("ne rend rien quand isOpen est faux (montage conditionnel)", () => {
    renderDrawer(false, vi.fn());

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("rend le panneau avec les attributs ARIA attendus quand isOpen est vrai", () => {
    renderDrawer(true, vi.fn());

    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("id", "drawer-id");
    expect(screen.getByRole("link", { name: "Agenda" })).toBeInTheDocument();
  });

  it("appelle onClose au clic sur l'overlay", () => {
    const onClose = vi.fn();
    const { container } = renderDrawer(true, onClose);

    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose à la touche Échap", () => {
    const onClose = vi.fn();
    renderDrawer(true, onClose);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose au clic sur un lien du contenu", () => {
    const onClose = vi.fn();
    renderDrawer(true, onClose);

    fireEvent.click(screen.getByRole("link", { name: "Agenda" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose au clic sur un bouton du contenu (ex. « Déconnexion » d'AuthNav)", () => {
    // Non-régression : AuthNav expose "Déconnexion" comme <button>, pas <a> — sans ce cas,
    // cliquer "Déconnexion" déclenche logout() mais laisse le drawer/overlay ouverts.
    const onClose = vi.fn();
    renderDrawer(true, onClose, <button type="button">Déconnexion</button>);

    fireEvent.click(screen.getByRole("button", { name: "Déconnexion" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("n'appelle pas onClose à la touche Échap quand isOpen est faux", () => {
    const onClose = vi.fn();
    renderDrawer(false, onClose);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });
});
