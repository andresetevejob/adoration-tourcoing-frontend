import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App (user-app)", () => {
  it("se monte et affiche la page d'accueil par défaut du routeur", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: /Un cœur qui bat/, level: 1 })).toBeInTheDocument();
  });
});
