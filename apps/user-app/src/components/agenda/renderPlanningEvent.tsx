import type { ReactNode } from "react";
import type { EventContentArg } from "@fullcalendar/core";
import { Badge } from "@chapelle/shared/ui";
import { formatTime } from "@chapelle/shared/utils";

/**
 * Présentation uniquement (aucune logique métier) : affiche l'heure + le titre déjà
 * calculé par `mapPlanningEntryToEvent`, avec un badge "Ma réservation" si
 * `extendedProps.isMine`. N'affiche jamais de bouton d'action (aucune annulation en U2,
 * cf. conception U2 §6 — U3 s'accroche via `onEventClick`).
 *
 * En vue "Mois"/"Intervalle", affiche la plage `HH:mm – HH:mm` (début ET fin), construite
 * depuis `arg.event.start`/`arg.event.end` plutôt que le seul `arg.timeText` (début) fourni
 * par FullCalendar — un créneau reste toujours sur un seul jour calendaire (garanti côté
 * backend), donc pas de variante `dd/MM` à gérer. En vues "Jour" (`timeGridDay`) et "Semaine"
 * (`timeGridWeek`), grilles horaires où la hauteur du bloc rend déjà visuellement la durée :
 * on garde `arg.timeText` (début seul) pour éviter la redondance.
 *
 * En vue `listWeek` (Mode Semaine + mobile, cf. `CalendrierReservations`), le plugin
 * `@fullcalendar/list` affiche nativement une colonne heure séparée (`.fc-list-event-time`,
 * en dehors du contrôle d'`eventContent`) : aucune heure n'est rendue ici (ni `arg.timeText`,
 * ni la plage calculée) pour éviter une duplication visuelle.
 */
export function renderPlanningEvent(arg: EventContentArg): ReactNode {
  const isMine = Boolean(arg.event.extendedProps.isMine);
  const viewType = arg.view.type;
  const estGrilleHoraire = viewType === "timeGridDay" || viewType === "timeGridWeek";
  const estVueListe = viewType === "listWeek";
  const timeText =
    !estGrilleHoraire && !estVueListe && arg.event.start && arg.event.end
      ? `${formatTime(arg.event.start)} – ${formatTime(arg.event.end)}`
      : arg.timeText;

  return (
    <div className="flex flex-col gap-1 overflow-hidden px-1 py-0.5 text-xs">
      <div className="flex items-center gap-1">
        {!estVueListe && <span className="font-medium">{timeText}</span>}
        <span className="truncate">{arg.event.title}</span>
      </div>
      {isMine && <Badge variant="info">Ma réservation</Badge>}
    </div>
  );
}
