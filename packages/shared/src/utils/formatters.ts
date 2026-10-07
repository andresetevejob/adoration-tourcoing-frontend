const TIME_ZONE = "Europe/Paris";

function toDate(date: string | Date): Date {
  return typeof date === "string" ? new Date(date) : date;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: string | Date): string {
  return dateFormatter.format(toDate(date));
}

export function formatDateTime(date: string | Date): string {
  return dateTimeFormatter.format(toDate(date)).replace(",", "");
}

export function formatTime(date: string | Date): string {
  return timeFormatter.format(toDate(date));
}

const isoDatePartFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Date au format ISO `yyyy-MM-dd` (fuseau Europe/Paris), pour les paramètres de requête
 *  d'API attendant un `LocalDate` (`GET /planning?date=`) — distinct de `formatDate`
 *  (`dd/MM/yyyy`, affichage FR uniquement, non réinjectable dans une requête). */
export function toISODateString(date: Date): string {
  return isoDatePartFormatter.format(date);
}

/** Nombre de jours entre deux dates `yyyy-MM-dd`, bornes incluses (ex. même date → 1,
 *  deux jours consécutifs → 2) — utilisé pour valider/dimensionner la vue "intervalle"
 *  du planning (`GET /planning/intervalle`, plafond `MAX_INTERVALLE_JOURS`). */
export function diffJoursInclusif(dateDebut: string, dateFin: string): number {
  const debut = new Date(`${dateDebut}T00:00:00Z`);
  const fin = new Date(`${dateFin}T00:00:00Z`);
  const MS_PAR_JOUR = 24 * 60 * 60 * 1000;
  return Math.round((fin.getTime() - debut.getTime()) / MS_PAR_JOUR) + 1;
}

/** `true` si la durée entre `dateDebut` et `dateFin` excède strictement `maxHeures`
 *  (borne incluse : une durée de exactement `maxHeures` retourne `false`) — utilisé pour
 *  rejeter les créneaux d'adoration de plus de 24h (sélection calendrier + filet de
 *  sécurité à la confirmation). */
export function exceedsMaxDuration(dateDebut: string, dateFin: string, maxHeures = 24): boolean {
  const dureeMs = new Date(dateFin).getTime() - new Date(dateDebut).getTime();
  return dureeMs > maxHeures * 3_600_000;
}

const parisDateTimePartFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  // `hourCycle: "h23"` est requis explicitement : sans lui, certains moteurs ICU restituent
  // minuit en "24:00" (jour précédent) plutôt qu'en "00:00" (jour courant) avec `hour12: false`.
  hourCycle: "h23",
});

const parisOffsetFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  timeZoneName: "shortOffset",
});

/** Dérive l'offset UTC réel de l'heure Europe/Paris (`+01:00` CET / `+02:00` CEST) pour
 *  l'instant représenté par `date`, calculé dynamiquement (jamais codé en dur) : les bascules
 *  DST ne tombent pas à date fixe d'une année sur l'autre. */
function getParisOffset(date: Date): string {
  const timeZoneNamePart = parisOffsetFormatter
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = timeZoneNamePart?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) {
    throw new Error(
      `getParisOffset: impossible d'extraire l'offset UTC depuis timeZoneNamePart=${JSON.stringify(timeZoneNamePart)} ; ` +
        "le format retourné par Intl.DateTimeFormat({ timeZoneName: \"shortOffset\" }) diverge de celui attendu " +
        '("GMT±H" ou "GMT±HH:MM") sur ce moteur ICU — un fallback silencieux enverrait un offset erroné au backend.',
    );
  }
  const sign = match[1];
  const hours = match[2].padStart(2, "0");
  const minutes = (match[3] ?? "00").padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

/** Date-heure au format ISO 8601 complet (`yyyy-MM-ddTHH:mm:ss±HH:mm`) exprimée en heure
 *  locale Europe/Paris, avec l'offset UTC réel (`+01:00` CET en hiver, `+02:00` CEST en été)
 *  calculé dynamiquement pour l'instant représenté par `date` — utilisé pour les DTO de
 *  création de réservation (`CreateBookingRequest.dateDebut`/`dateFin`). */
export function toParisISOString(date: Date): string {
  const parts = parisDateTimePartFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  const datePart = `${get("year")}-${get("month")}-${get("day")}`;
  const timePart = `${get("hour")}:${get("minute")}:${get("second")}`;
  return `${datePart}T${timePart}${getParisOffset(date)}`;
}
