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
