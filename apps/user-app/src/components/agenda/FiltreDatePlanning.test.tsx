import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FiltreDatePlanning } from "./FiltreDatePlanning";

describe("FiltreDatePlanning (user-app)", () => {
  it("affiche la date fournie", () => {
    render(<FiltreDatePlanning value="2026-01-01" onChange={vi.fn()} />);

    expect(screen.getByLabelText("Date")).toHaveValue("2026-01-01");
  });

  it("appelle onChange avec la nouvelle valeur saisie", () => {
    const onChange = vi.fn();
    render(<FiltreDatePlanning value="2026-01-01" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-02-15" } });

    expect(onChange).toHaveBeenCalledWith("2026-02-15");
  });

  it("appelle onChange avec la date du jour au clic sur « Aujourd'hui »", () => {
    const onChange = vi.fn();
    render(<FiltreDatePlanning value="2026-01-01" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Aujourd'hui" }));

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });
});
