import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App (user-app)", () => {
  it("se monte et résout les imports @chapelle/shared/ui et @chapelle/shared/utils", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /Chapelle du Vœux — socle prêt/ })).toBeInTheDocument();
  });
});
