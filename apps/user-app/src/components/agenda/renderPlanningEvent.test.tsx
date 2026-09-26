import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { EventContentArg } from "@fullcalendar/core";
import { renderPlanningEvent } from "./renderPlanningEvent";

function buildArg(overrides: { title: string; isMine: boolean; timeText?: string }): EventContentArg {
  return {
    event: {
      title: overrides.title,
      extendedProps: { isMine: overrides.isMine },
    },
    timeText: overrides.timeText ?? "10:00",
  } as unknown as EventContentArg;
}

describe("renderPlanningEvent (user-app)", () => {
  it("affiche l'heure et le titre", () => {
    render(<>{renderPlanningEvent(buildArg({ title: "Jean Dupont", isMine: false }))}</>);

    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
  });

  it("affiche le badge « Ma réservation » quand isMine est vrai", () => {
    render(<>{renderPlanningEvent(buildArg({ title: "Jean Dupont", isMine: true }))}</>);

    expect(screen.getByText("Ma réservation")).toBeInTheDocument();
  });

  it("n'affiche pas le badge quand isMine est faux", () => {
    render(<>{renderPlanningEvent(buildArg({ title: "Créneau réservé", isMine: false }))}</>);

    expect(screen.queryByText("Ma réservation")).not.toBeInTheDocument();
  });
});
