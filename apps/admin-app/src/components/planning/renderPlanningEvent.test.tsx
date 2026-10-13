import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { EventContentArg } from "@fullcalendar/core";
import { UserRole } from "@chapelle/shared/types";
import { renderPlanningEvent } from "./renderPlanningEvent";

function buildArg(overrides: {
  title: string;
  isMine: boolean;
  roleUtilisateur: UserRole;
  timeText?: string;
  viewType?: string;
  start?: Date | null;
  end?: Date | null;
}): EventContentArg {
  return {
    view: { type: overrides.viewType ?? "dayGridMonth" },
    event: {
      title: overrides.title,
      extendedProps: { isMine: overrides.isMine, roleUtilisateur: overrides.roleUtilisateur },
      start: overrides.start === undefined ? new Date("2026-01-01T10:00:00Z") : overrides.start,
      end: overrides.end === undefined ? new Date("2026-01-01T11:00:00Z") : overrides.end,
    },
    timeText: overrides.timeText ?? "10:00",
  } as unknown as EventContentArg;
}

describe("renderPlanningEvent (admin-app)", () => {
  it("affiche l'heure, le titre et le rôle de l'utilisateur", () => {
    render(
      <>
        {renderPlanningEvent(
          buildArg({
            title: "Jean Dupont",
            isMine: false,
            roleUtilisateur: UserRole.VEILLEUR,
            viewType: "timeGridDay",
          }),
        )}
      </>,
    );

    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText("Veilleur")).toBeInTheDocument();
  });

  it("n'affiche pas le badge « Ma réservation » (toujours isMine=false côté admin)", () => {
    render(
      <>
        {renderPlanningEvent(
          buildArg({ title: "Jean Dupont", isMine: false, roleUtilisateur: UserRole.VEILLEUR }),
        )}
      </>,
    );

    expect(screen.queryByText("Ma réservation")).not.toBeInTheDocument();
  });

  it("affiche la plage horaire début–fin (pas seulement timeText) en vue Mois", () => {
    render(
      <>
        {renderPlanningEvent(
          buildArg({
            title: "Jean Dupont",
            isMine: false,
            roleUtilisateur: UserRole.VEILLEUR,
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
  });

  it("affiche la plage horaire début–fin en vue Intervalle (listWeek)", () => {
    render(
      <>
        {renderPlanningEvent(
          buildArg({
            title: "Jean Dupont",
            isMine: false,
            roleUtilisateur: UserRole.VEILLEUR,
            viewType: "listWeek",
            start: new Date("2026-01-01T10:00:00Z"),
            end: new Date("2026-01-01T11:00:00Z"),
          }),
        )}
      </>,
    );

    expect(screen.getByText("11:00 – 12:00")).toBeInTheDocument();
  });

  it("conserve arg.timeText (sans recalcul) en vue Jour (timeGridDay)", () => {
    render(
      <>
        {renderPlanningEvent(
          buildArg({
            title: "Jean Dupont",
            isMine: false,
            roleUtilisateur: UserRole.VEILLEUR,
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
            roleUtilisateur: UserRole.VEILLEUR,
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
});
