import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App (admin-app)", () => {
  it("se monte et redirige vers la connexion en l'absence de session", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: /Connexion/ })).toBeInTheDocument();
  });
});
