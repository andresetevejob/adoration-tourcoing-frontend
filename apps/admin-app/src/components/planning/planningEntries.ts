import type { PlanningEntryResponse, UserRole } from "@chapelle/shared/types";

export interface PlanningCalendarEvent {
  id: string;
  start: string; // entry.dateDebut
  end: string; // entry.dateFin
  title: string;
  classNames: string[]; // ex. ["planning-event--mine"]
  extendedProps: {
    roleUtilisateur: UserRole;
    isMine: boolean;
  };
}

/**
 * Portée admin (US-AGENDA-03, `unit-of-work.md` : "affichage de toutes les identités
 * sans anonymisation") : `title` affiche toujours l'identité complète, quelle que soit
 * la valeur d'`entry.estAnonymise` — décision explicite d'ignorer ce signal côté
 * admin-app (cf. conception U2 §4.1.2/§9 point ouvert 5).
 * `isMine` est toujours `false` : pas de mise en évidence "Ma réservation" côté admin.
 */
export function mapPlanningEntryToEvent(entry: PlanningEntryResponse): PlanningCalendarEvent {
  return {
    id: entry.id,
    start: entry.dateDebut,
    end: entry.dateFin,
    title: `${entry.prenomsUtilisateur} ${entry.nomUtilisateur}`,
    classNames: [],
    extendedProps: {
      roleUtilisateur: entry.roleUtilisateur,
      isMine: false,
    },
  };
}

export function mapPlanningEntriesToEvents(entries: PlanningEntryResponse[]): PlanningCalendarEvent[] {
  return entries.map(mapPlanningEntryToEvent);
}
