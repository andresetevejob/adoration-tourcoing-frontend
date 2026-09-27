import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { ScrollToTop } from "./ScrollToTop";

describe("components/layout/ScrollToTop (user-app)", () => {
  let scrollToMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;
  });

  afterEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("remonte en haut au montage (changement de route)", () => {
    render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>,
    );

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
  });

  it("le bouton est masqué tant que le scroll est inférieur à 600px puis visible au-delà", () => {
    render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>,
    );

    const button = screen.getByRole("button", { name: "Retour en haut" });
    expect(button.className).toContain("opacity-0");

    Object.defineProperty(window, "scrollY", { value: 700, configurable: true });
    act(() => {
      fireEvent.scroll(window);
    });

    expect(button.className).toContain("opacity-100");
  });

  it("appelle scrollTo({top:0, behavior: 'smooth'}) au clic", () => {
    render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Retour en haut" }));

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
