import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Select } from "./Select";

const options = [
  { value: "ADORATEUR", label: "Adorateur" },
  { value: "VEILLEUR", label: "Veilleur" },
];

describe("Select", () => {
  it("rend toutes les options fournies", () => {
    render(<Select label="Rôle" options={options} />);
    expect(screen.getByRole("option", { name: "Adorateur" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Veilleur" })).toBeInTheDocument();
  });

  it("associe le label au select", () => {
    render(<Select label="Rôle" options={options} />);
    expect(screen.getByLabelText("Rôle")).toBeInTheDocument();
  });

  it("affiche l'erreur et aria-invalid quand error est fourni", () => {
    render(<Select label="Rôle" options={options} error="Champ requis" />);
    expect(screen.getByLabelText("Rôle")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Champ requis")).toBeInTheDocument();
  });

  it("transmet le ref vers l'élément select DOM", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<Select label="Rôle" options={options} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("permet de sélectionner une option", () => {
    render(<Select label="Rôle" options={options} />);
    const select = screen.getByLabelText("Rôle");

    fireEvent.change(select, { target: { value: "VEILLEUR" } });

    expect(select).toHaveValue("VEILLEUR");
  });

  it("rend une liste vide sans planter", () => {
    render(<Select label="Rôle" options={[]} />);
    expect(screen.getByLabelText("Rôle")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
