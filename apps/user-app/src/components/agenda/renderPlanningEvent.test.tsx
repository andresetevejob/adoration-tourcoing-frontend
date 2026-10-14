import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { EventContentArg } from "@fullcalendar/core";
import { renderPlanningEvent } from "./renderPlanningEvent";

function buildArg(overrides: {
  title: string;
  isMine: boolean;
  timeText?: string;
  viewType?: string;
  start?: Date | null;
  end?: Date | null;
}): EventContentArg {
  return {
    view: { type: overrides.viewType ?? "dayGridMonth" },
    event: {
      title: overrides.title,
      extendedProps: { isMine: overrides.isMine },
      start: overrides.start === undefined ? new Date("2026-01-01T10:00:00Z") : overrides.start,
      end: overrides.end === undefined ? new Date("2026-01-01T11:00:00Z") : overrides.end,
    },
    timeText: overrides.timeText ?? "10:00",
  } as unknown as EventContentArg;
}

describe("renderPlanningEvent (user-app)", () => {
  it("affiche la plage horaire début–fin (pas seulement timeText) en vue Mois", () => {
    render(
      <>
        {renderPlanningEvent(
          buildArg({
            title: "Jean Dupont",
            isMine: false,
            viewType: "dayGridMonth",
            start: new Date("2026-01-01T10:00:00Z"),
            end: new Date("2026-01-01T11:00:00Z"),
            timeText: "11:00",
          }),
        )}
      </>,
    );

    expect(screen.getByText("11:00 – 12:00")).toBeInTheDocument();
    expect(screen.queryByText("11:00")).not.toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
  });

  it("n'affiche aucune heure en vue liste (listWeek, Mode Semaine + mobile) — colonne native .fc-list-event-time", () => {
    render(
      <>
        {renderPlanningEvent(
          buildArg({
            title: "Jean Dupont",
            isMine: false,
            viewType: "listWeek",
            start: new Date("2026-01-01T10:00:00Z"),
            end: new Date("2026-01-01T11:00:00Z"),
            timeText: "11:00",
          }),
        )}
      </>,
    );

    expect(screen.queryByText("11:00 – 12:00")).not.toBeInTheDocument();
    expect(screen.queryByText("11:00")).not.toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
  });

  it("conserve arg.timeText (sans recalcul) en vue Jour (timeGridDay)", () => {
    render(
      <>
        {renderPlanningEvent(
          buildArg({
            title: "Jean Dupont",
            isMine: false,
            viewType: "timeGridDay",
            start: new Date("2026-01-01T10:00:00Z"),
            end: new Date("2026-01-01T11:00:00Z"),
            timeText: "10:00",
          }),
        )}
      </>,
    );

    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.queryByText("11:00 – 12:00")).not.toBeInTheDocument();
  });

  it("conserve arg.timeText (sans recalcul) en vue Semaine (timeGridWeek), comme en vue Jour", () => {
    render(
      <>
        {renderPlanningEvent(
          buildArg({
            title: "Jean Dupont",
            isMine: false,
            viewType: "timeGridWeek",
            start: new Date("2026-01-01T10:00:00Z"),
            end: new Date("2026-01-01T11:00:00Z"),
            timeText: "10:00",
          }),
        )}
      </>,
    );

    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.queryByText("11:00 – 12:00")).not.toBeInTheDocument();
  });

  it("affiche l'heure et le titre", () => {
    render(<>{renderPlanningEvent(buildArg({ title: "Jean Dupont", isMine: false, viewType: "timeGridDay" }))}</>);

    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
  });

  it("affiche l'icône « Ma réservation » quand isMine est vrai", () => {
    render(<>{renderPlanningEvent(buildArg({ title: "Jean Dupont", isMine: true }))}</>);

    expect(screen.getByLabelText("Ma réservation")).toBeInTheDocument();
  });

  it("n'affiche pas l'icône quand isMine est faux", () => {
    render(<>{renderPlanningEvent(buildArg({ title: "Créneau réservé", isMine: false }))}</>);

    expect(screen.queryByLabelText("Ma réservation")).not.toBeInTheDocument();
  });

  it("affiche l'icône « Ma réservation » en vue liste (listWeek) malgré l'absence d'heure", () => {
    render(<>{renderPlanningEvent(buildArg({ title: "Jean Dupont", isMine: true, viewType: "listWeek" }))}</>);

    expect(screen.getByLabelText("Ma réservation")).toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
  });
});
