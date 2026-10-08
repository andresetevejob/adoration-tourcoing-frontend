import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdorationLive } from "./AdorationLive";

const { useStatutAdorationDirectMock } = vi.hoisted(() => ({ useStatutAdorationDirectMock: vi.fn() }));

vi.mock("../../hooks/useStatutAdorationDirect", () => ({
  useStatutAdorationDirect: useStatutAdorationDirectMock,
}));

describe("components/vitrine/AdorationLive (user-app)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-27T10:30:00"));
    useStatutAdorationDirectMock.mockReset();
    useStatutAdorationDirectMock.mockReturnValue({ enCours: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("affiche l'heure courante et le compteur de jours depuis 1885", () => {
    render(<AdorationLive />);

    expect(screen.getByRole("timer", { name: "Heure actuelle" })).toHaveTextContent("10:30:00");
  });

  it("met à jour l'horloge chaque seconde", () => {
    render(<AdorationLive />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("timer", { name: "Heure actuelle" })).toHaveTextContent("10:30:01");
  });

  it("enCours: true — affiche le message et le badge 'En ce moment'", () => {
    useStatutAdorationDirectMock.mockReturnValue({ enCours: true });

    render(<AdorationLive />);

    expect(screen.getByRole("heading", { name: "Un veilleur prie en cet instant" })).toBeInTheDocument();
    expect(screen.getByText("En ce moment")).toBeInTheDocument();
  });

  it("enCours: false — affiche le message alternatif, badge neutralisé, horloge/compteur inchangés", () => {
    useStatutAdorationDirectMock.mockReturnValue({ enCours: false });

    render(<AdorationLive />);

    expect(screen.getByRole("heading", { name: "Aucun veilleur n'est présent à l'instant" })).toBeInTheDocument();
    expect(screen.queryByText("En ce moment")).not.toBeInTheDocument();
    expect(screen.getByText("En attente")).toBeInTheDocument();
    expect(screen.getByRole("timer", { name: "Heure actuelle" })).toHaveTextContent("10:30:00");
  });

  it("état de chargement initial (avant première réponse) — traité comme enCours: false, pas de flash du message 'en cours'", () => {
    useStatutAdorationDirectMock.mockReturnValue({ enCours: false });

    render(<AdorationLive />);

    expect(screen.queryByRole("heading", { name: "Un veilleur prie en cet instant" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Aucun veilleur n'est présent à l'instant" })).toBeInTheDocument();
  });
});
