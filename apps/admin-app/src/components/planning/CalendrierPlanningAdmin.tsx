import FullCalendar from "@fullcalendar/react";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import type { PlanningEntryResponse } from "@chapelle/shared/types";
import { Spinner } from "@chapelle/shared/ui";
import { mapPlanningEntriesToEvents } from "./planningEntries";
import { renderPlanningEvent } from "./renderPlanningEvent";

export interface CalendrierPlanningAdminProps {
  date: string; // yyyy-MM-dd, sert d'`initialDate` FullCalendar
  entries: PlanningEntryResponse[]; // toutes identités, non filtrées (pas de "mes réservations" côté admin)
  isLoading: boolean; // premier chargement (query.isLoading) — pas isFetching
  onSelectSlot?: (info: DateSelectArg) => void; // U3 : absent = lecture seule (comportement U2 inchangé)
  onEventClick?: (info: EventClickArg) => void; // U3 : absent = clic sans effet
}

/**
 * Wrapper FullCalendar : lecture seule par défaut (`onSelectSlot` non fourni, comportement
 * U2 inchangé) — U3 ajoute la sélection/le clic optionnels via `interactionPlugin`
 * (cf. conception U3 §5, U2 §6 "point d'extension").
 *
 * Import statique de FullCalendar réservé à ce seul module : jamais réexporté ni
 * réimporté par `router.tsx`/`PagePlanning.tsx`, qui le chargent via `React.lazy()`
 * (frontière de code-splitting, NFR performance).
 */
export default function CalendrierPlanningAdmin({
  date,
  entries,
  isLoading,
  onSelectSlot,
  onEventClick,
}: CalendrierPlanningAdminProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridDay"
      initialDate={date}
      locale={frLocale}
      headerToolbar={false}
      height="auto"
      nowIndicator
      editable={false}
      selectable={Boolean(onSelectSlot)}
      selectOverlap={false}
      selectAllow={(selectInfo) => selectInfo.start.getTime() >= Date.now()}
      select={onSelectSlot}
      eventClick={onEventClick}
      events={mapPlanningEntriesToEvents(entries)}
      eventContent={renderPlanningEvent}
    />
  );
}
