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
}): EventContentArg {
  return {
    event: {
      title: overrides.title,
      extendedProps: { isMine: overrides.isMine, roleUtilisateur: overrides.roleUtilisateur },
    },
    timeText: overrides.timeText ?? "10:00",
  } as unknown as EventContentArg;
}

describe("renderPlanningEvent (admin-app)", () => {
  it("affiche l'heure, le titre et le rôle de l'utilisateur", () => {
    render(
      <>
        {renderPlanningEvent(
          buildArg({ title: "Jean Dupont", isMine: false, roleUtilisateur: UserRole.VEILLEUR }),
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
});
