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
