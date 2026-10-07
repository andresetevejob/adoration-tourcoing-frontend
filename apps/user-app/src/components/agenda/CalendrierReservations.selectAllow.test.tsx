import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DateSelectArg } from "@fullcalendar/core";

// Mock dédié à ce fichier (capture `selectAllow` au lieu de rendre le vrai calendrier) :
// `selectAllow` n'est consulté par FullCalendar que lors d'une interaction de glisser-déposer
// réelle (mousedown/mousemove/mouseup sur la grille), non simulable de façon fiable en jsdom
// (positions/tailles de cellules non calculées). On capture ici la fonction exacte configurée
// par `CalendrierReservations` et on l'invoque directement avec un `DateSelectArg` minimal.
let capturedSelectAllow: ((selectInfo: Pick<DateSelectArg, "start" | "end">) => boolean) | undefined;

vi.mock("@fullcalendar/react", () => ({
  default: (props: { selectAllow?: (selectInfo: Pick<DateSelectArg, "start" | "end">) => boolean }) => {
    capturedSelectAllow = props.selectAllow;
    return null;
  },
}));

import CalendrierReservations from "./CalendrierReservations";

function renderAndGetSelectAllow() {
  render(
    <CalendrierReservations
      periode={{ mode: "jour", date: "2026-01-01" }}
      entries={[]}
      isLoading={false}
      onSelectSlot={vi.fn()}
    />,
  );
  expect(capturedSelectAllow).toBeDefined();
  return capturedSelectAllow!;
}

describe("CalendrierReservations - selectAllow (user-app)", () => {
  afterEach(() => {
    vi.useRealTimers();
    capturedSelectAllow = undefined;
  });

  it("rejette une sélection dont la durée dépasse 24h", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const selectAllow = renderAndGetSelectAllow();

    const start = new Date("2026-01-02T10:00:00Z");
    const end = new Date("2026-01-03T10:00:01Z"); // 24h + 1s

    expect(selectAllow({ start, end })).toBe(false);
  });

  it("accepte une sélection d'exactement 24h (borne incluse)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const selectAllow = renderAndGetSelectAllow();

    const start = new Date("2026-01-02T10:00:00Z");
    const end = new Date("2026-01-03T10:00:00Z"); // exactement 24h

    expect(selectAllow({ start, end })).toBe(true);
  });

  it("rejette toujours une sélection dans le passé (comportement inchangé)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-05T00:00:00Z"));
    const selectAllow = renderAndGetSelectAllow();

    const start = new Date("2026-01-01T10:00:00Z");
    const end = new Date("2026-01-01T11:00:00Z");

    expect(selectAllow({ start, end })).toBe(false);
  });
});
