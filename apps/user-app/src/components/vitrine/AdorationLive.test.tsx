import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdorationLive } from "./AdorationLive";

describe("components/vitrine/AdorationLive (user-app)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-27T10:30:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("affiche l'heure courante et le compteur de jours depuis 1885", () => {
    render(<AdorationLive />);

    expect(screen.getByRole("timer", { name: "Heure actuelle" })).toHaveTextContent("10:30:00");
    expect(screen.getByRole("heading", { name: "Un veilleur prie en cet instant" })).toBeInTheDocument();
  });

  it("met à jour l'horloge chaque seconde", () => {
    render(<AdorationLive />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("timer", { name: "Heure actuelle" })).toHaveTextContent("10:30:01");
  });
});
