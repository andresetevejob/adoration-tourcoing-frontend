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
 * `title` : `estAnonymise ? "Créneau réservé" : "<prénoms> <nom>"` (US-AGENDA-01/02).
 * `isMine` = `!estAnonymise` : dérivé du même signal backend, pas d'un second calcul
 * client comparant `idUtilisateur` à l'utilisateur connecté — le composant n'applique
 * jamais de logique d'anonymisation, il ne fait que réutiliser le résultat déjà fourni
 * par le backend pour piloter une seconde intention visuelle (surlignage).
 */
export function mapPlanningEntryToEvent(entry: PlanningEntryResponse): PlanningCalendarEvent {
  const isMine = !entry.estAnonymise;
  return {
    id: entry.id,
    start: entry.dateDebut,
    end: entry.dateFin,
    title: entry.estAnonymise
      ? "Créneau réservé"
      : `${entry.prenomsUtilisateur} ${entry.nomUtilisateur}`,
    classNames: isMine ? ["planning-event--mine"] : [],
    extendedProps: {
      roleUtilisateur: entry.roleUtilisateur,
      isMine,
    },
  };
}

export function mapPlanningEntriesToEvents(entries: PlanningEntryResponse[]): PlanningCalendarEvent[] {
  return entries.map(mapPlanningEntryToEvent);
}

/**
 * Filtre "mes réservations" (US-AGENDA-05), distinct de l'anonymisation : compare
 * explicitement `entry.idUtilisateur` à l'utilisateur connecté. Appliqué en amont du
 * mapping par `PageAgenda`, jamais par le composant calendrier lui-même.
 */
export function filterOwnEntries(entries: PlanningEntryResponse[], userId: string): PlanningEntryResponse[] {
  return entries.filter((entry) => entry.idUtilisateur === userId);
}
