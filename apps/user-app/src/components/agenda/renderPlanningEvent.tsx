import type { ReactNode } from "react";
import type { EventContentArg } from "@fullcalendar/core";
import { Badge } from "@chapelle/shared/ui";

/**
 * Présentation uniquement (aucune logique métier) : affiche l'heure + le titre déjà
 * calculé par `mapPlanningEntryToEvent`, avec un badge "Ma réservation" si
 * `extendedProps.isMine`. N'affiche jamais de bouton d'action (aucune annulation en U2,
 * cf. conception U2 §6 — U3 s'accroche via `onEventClick`).
 */
export function renderPlanningEvent(arg: EventContentArg): ReactNode {
  const isMine = Boolean(arg.event.extendedProps.isMine);

  return (
    <div className="flex flex-col gap-1 overflow-hidden px-1 py-0.5 text-xs">
      <div className="flex items-center gap-1">
        <span className="font-medium">{arg.timeText}</span>
        <span className="truncate">{arg.event.title}</span>
      </div>
      {isMine && <Badge variant="info">Ma réservation</Badge>}
    </div>
  );
}
