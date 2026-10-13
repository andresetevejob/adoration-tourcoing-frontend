import type { ReactNode } from "react";
import type { PlanningEntryResponse } from "@chapelle/shared/types";
import { Badge } from "@chapelle/shared/ui";
import { formatDate, formatTime } from "@chapelle/shared/utils";
import { mapPlanningEntriesToEvents } from "./planningEntries";

export interface ListeCreneauxJourProps {
  date: string; // "yyyy-MM-dd", jour tapé
  entries: PlanningEntryResponse[]; // déjà filtrées pour ce jour par filterEntriesByDay
}

/**
 * Panneau "jour sélectionné" du Mode Mois mobile (style Google Agenda) — nouveau composant
 * compact, pas une réutilisation de `ReservationCard` (pensé pour une seule réservation dans
 * une modale, trop verbeux pour empiler N créneaux). La dérivation titre/`isMine` est
 * réutilisée via `mapPlanningEntriesToEvents`, pas d'un troisième calcul de la règle
 * d'anonymisation. Lecture seule : aucun `onClick` câblé sur les lignes (cf. conception §3.4,
 * question ouverte n°2) — l'annulation reste accessible via la puce d'événement de la grille.
 */
export function ListeCreneauxJour({ date, entries }: ListeCreneauxJourProps): ReactNode {
  const events = mapPlanningEntriesToEvents(entries);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-pearl bg-white p-4">
      <h3 className="font-serif text-sm font-semibold text-night-900">{formatDate(date)}</h3>
      {events.length === 0 ? (
        <p className="text-sm text-night-500">Aucun créneau ce jour-là.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-pearl">
          {events.map((event) => (
            <li key={event.id} className="flex items-center gap-2 py-2 text-sm">
              <span className="font-medium text-night-800">
                {formatTime(event.start)} – {formatTime(event.end)}
              </span>
              <span className="truncate">{event.title}</span>
              {event.extendedProps.isMine && <Badge variant="info">Ma réservation</Badge>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
