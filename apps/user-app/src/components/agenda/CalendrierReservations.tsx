import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import type { PlanningEntryResponse } from "@chapelle/shared/types";
import { Spinner } from "@chapelle/shared/ui";
import { diffJoursInclusif, exceedsMaxDuration } from "@chapelle/shared/utils";
import type { PlanningPeriode } from "../../hooks/planningPeriode";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { filterEntriesByDay, mapPlanningEntriesToEvents } from "./planningEntries";
import { renderPlanningEvent } from "./renderPlanningEvent";
import { ListeCreneauxJour } from "./ListeCreneauxJour";

export interface CalendrierReservationsProps {
  periode: PlanningPeriode; // pilote la vue FullCalendar affichée (jour/mois/intervalle)
  entries: PlanningEntryResponse[]; // déjà filtrées ("mes réservations" éventuel) par l'appelant
  isLoading: boolean; // premier chargement (query.isLoading) — pas isFetching
  onSelectSlot?: (info: DateSelectArg) => void; // U3 : absent = lecture seule (comportement U2 inchangé)
  onEventClick?: (info: EventClickArg) => void; // U3 : absent = clic sans effet
}

/** Résout la vue FullCalendar (plugin/`initialView`/`initialDate`) selon le mode de la
 *  période sélectionnée et le viewport (`isMobile`, cf. `useIsMobileViewport`). La vue
 *  "intervalle" est calquée sur `dayGrid` avec une durée dynamique égale au nombre de jours
 *  sélectionnés (bornes incluses). Mode "Semaine" + mobile : bascule vers `listWeek` (vue
 *  liste chronologique, cf. proposition "Agenda mobile" — style Google Agenda) ; le mode
 *  "Mois" n'est pas affecté par `isMobile` ici (la grille `dayGridMonth` reste affichée dans
 *  tous les cas, seule son interactivité change, cf. `isMoisMobileTactile` plus bas). */
function resolveCalendarConfig(periode: PlanningPeriode, isMobile: boolean) {
  switch (periode.mode) {
    case "jour":
      return { initialView: "timeGridDay", initialDate: periode.date, views: undefined };
    case "semaine":
      // Vue native FullCalendar (déjà incluse dans `timeGridPlugin`) : pas de durée dynamique
      // custom comme pour "intervalle", `dateDebut` est toujours un lundi (cf. `PlanningPeriode`).
      return isMobile
        ? { initialView: "listWeek", initialDate: periode.dateDebut, views: undefined }
        : { initialView: "timeGridWeek", initialDate: periode.dateDebut, views: undefined };
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
  const isMobile = useIsMobileViewport();
  // "yyyy-MM-dd" (FullCalendar `DateClickArg.dateStr`) — remis à `null` automatiquement à
  // chaque changement de période grâce au `key={periodeCacheKey(periode)}` posé par
  // `PageAgenda` (démonte/remonte tout ce composant, y compris ses hooks internes).
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  // Mode "Mois" + mobile : la grille reste affichée mais devient tactile (`dateClick`
  // affiche la liste des créneaux du jour tapé sous la grille) — cf. proposition "Agenda
  // mobile" (style Google Agenda). Désactive aussi le drag-select (cf. `selectable`
  // ci-dessous) pour éviter un déclenchement simultané de `select`/`dateClick` sur un tap.
  const isMoisMobileTactile = isMobile && periode.mode === "mois";
  const dayEntries = selectedDay ? filterEntriesByDay(entries, selectedDay) : [];

  return (
    <div className="flex flex-col gap-4 user-agenda-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        {...resolveCalendarConfig(periode, isMobile)}
        locale={frLocale}
        headerToolbar={false}
        height="auto"
        nowIndicator
        editable={false}
        selectable={Boolean(onSelectSlot) && !isMoisMobileTactile}
        selectOverlap={false}
        selectAllow={(selectInfo) =>
          selectInfo.start.getTime() >= Date.now() &&
          !exceedsMaxDuration(selectInfo.start.toISOString(), selectInfo.end.toISOString())
        }
        select={onSelectSlot}
        dateClick={
          isMoisMobileTactile
            ? (info: DateClickArg) => {
                setSelectedDay((previous) => (previous === info.dateStr ? null : info.dateStr));
              }
            : undefined
        }
        eventClick={onEventClick}
        events={mapPlanningEntriesToEvents(entries)}
        eventContent={renderPlanningEvent}
      />
      {isMoisMobileTactile && selectedDay !== null && (
        <ListeCreneauxJour date={selectedDay} entries={dayEntries} />
      )}
    </div>
  );
}
