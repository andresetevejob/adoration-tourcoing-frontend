import FullCalendar from "@fullcalendar/react";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import type { PlanningEntryResponse } from "@chapelle/shared/types";
import { Spinner } from "@chapelle/shared/ui";
import { diffJoursInclusif, exceedsMaxDuration } from "@chapelle/shared/utils";
import type { PlanningPeriode } from "../../hooks/planningPeriode";
import { mapPlanningEntriesToEvents } from "./planningEntries";
import { renderPlanningEvent } from "./renderPlanningEvent";

export interface CalendrierReservationsProps {
  periode: PlanningPeriode; // pilote la vue FullCalendar affichée (jour/mois/intervalle)
  entries: PlanningEntryResponse[]; // déjà filtrées ("mes réservations" éventuel) par l'appelant
  isLoading: boolean; // premier chargement (query.isLoading) — pas isFetching
  onSelectSlot?: (info: DateSelectArg) => void; // U3 : absent = lecture seule (comportement U2 inchangé)
  onEventClick?: (info: EventClickArg) => void; // U3 : absent = clic sans effet
}

/** Résout la vue FullCalendar (plugin/`initialView`/`initialDate`) selon le mode de la
 *  période sélectionnée. La vue "intervalle" est calquée sur `dayGrid` avec une durée
 *  dynamique égale au nombre de jours sélectionnés (bornes incluses). */
function resolveCalendarConfig(periode: PlanningPeriode) {
  switch (periode.mode) {
    case "jour":
      return { initialView: "timeGridDay", initialDate: periode.date, views: undefined };
    case "semaine":
      // Vue native FullCalendar (déjà incluse dans `timeGridPlugin`) : pas de durée dynamique
      // custom comme pour "intervalle", `dateDebut` est toujours un lundi (cf. `PlanningPeriode`).
      return { initialView: "timeGridWeek", initialDate: periode.dateDebut, views: undefined };
    case "mois":
      return {
        initialView: "dayGridMonth",
        initialDate: `${String(periode.annee)}-${String(periode.mois).padStart(2, "0")}-01`,
        views: undefined,
      };
    case "intervalle":
      return {
        initialView: "dayGridIntervalle",
        initialDate: periode.dateDebut,
        views: {
          dayGridIntervalle: {
            type: "dayGrid",
            duration: { days: diffJoursInclusif(periode.dateDebut, periode.dateFin) },
          },
        },
      };
  }
}

/**
 * Wrapper FullCalendar : lecture seule par défaut (`onSelectSlot` non fourni, comportement
 * U2 inchangé) — U3 ajoute la sélection/le clic optionnels via `interactionPlugin`
 * (cf. conception U3 §5, U2 §6 "point d'extension").
 *
 * Import statique de FullCalendar réservé à ce seul module : jamais réexporté ni
 * réimporté par `router.tsx`/`PageAgenda.tsx`, qui le chargent via `React.lazy()`
 * (frontière de code-splitting, NFR performance).
 */
export default function CalendrierReservations({
  periode,
  entries,
  isLoading,
  onSelectSlot,
  onEventClick,
}: CalendrierReservationsProps) {
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
      {...resolveCalendarConfig(periode)}
      locale={frLocale}
      headerToolbar={false}
      height="auto"
      nowIndicator
      editable={false}
      selectable={Boolean(onSelectSlot)}
      selectOverlap={false}
      selectAllow={(selectInfo) =>
        selectInfo.start.getTime() >= Date.now() &&
        !exceedsMaxDuration(selectInfo.start.toISOString(), selectInfo.end.toISOString())
      }
      select={onSelectSlot}
      eventClick={onEventClick}
      events={mapPlanningEntriesToEvents(entries)}
      eventContent={renderPlanningEvent}
    />
  );
}
