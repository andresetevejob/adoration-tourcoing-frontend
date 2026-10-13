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

/** Clé de jour "yyyy-MM-dd" calculée via les accesseurs *locaux* de `Date` (`getFullYear`/
 *  `getMonth`/`getDate`), volontairement PAS via `formatDate`/`toISODateString` (fuseau Europe/Paris
 *  forcé par Intl) : FullCalendar place ses événements dans les cellules de `dayGridMonth` selon le
 *  fuseau LOCAL du navigateur (accesseurs natifs `Date`, pas une conversion explicite vers Paris) —
 *  utiliser une autre base de calcul ferait diverger, en environnement dont le fuseau d'exécution
 *  n'est pas Europe/Paris (ex. CI en UTC), le panneau "jour sélectionné" des puces visuellement
 *  affichées dans la cellule tapée. */
function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${String(year)}-${month}-${day}`;
}

/** Filtre + trie chronologiquement les entrées dont `dateDebut` tombe sur `dateISO` ("yyyy-MM-dd",
 *  même format que `DateClickArg.dateStr`) — panneau "jour sélectionné" du Mode Mois mobile, calculé
 *  côté client depuis les `entries` déjà chargées (US consultation-planning, aucun nouvel appel
 *  réseau). */
export function filterEntriesByDay(
  entries: PlanningEntryResponse[],
  dateISO: string,
): PlanningEntryResponse[] {
  return entries
    .filter((entry) => localDateKey(new Date(entry.dateDebut)) === dateISO)
    .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));
}
