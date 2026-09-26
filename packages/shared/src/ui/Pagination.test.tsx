import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("ne rend rien quand totalPages <= 1", () => {
    const { container } = render(<Pagination page={0} totalPages={1} onPageChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("affiche la page courante en 1-indexé sur un total en 0-indexé", () => {
    render(<Pagination page={2} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText("Page 3 / 5")).toBeInTheDocument();
  });

  it("désactive Précédent sur la première page", () => {
    render(<Pagination page={0} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Précédent" })).toBeDisabled();
  });

  it("désactive Suivant sur la dernière page", () => {
    render(<Pagination page={4} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Suivant" })).toBeDisabled();
  });

  it("appelle onPageChange avec page-1 au clic sur Précédent", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Précédent" }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("appelle onPageChange avec page+1 au clic sur Suivant", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
