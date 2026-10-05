export function formatMeetingDate(date: Date | string): string {
  const value = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("ar-DZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(value);
}

/** Format "HH:mm" as Arabic 12-hour time, e.g. "10:30 صباحًا". */
export function formatMeetingTime(time: string): string {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time;

  let hours = Number(match[1]);
  const minutes = match[2];
  if (Number.isNaN(hours) || hours > 23) return time;

  const period = hours < 12 ? "صباحًا" : "مساءً";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${period}`;
}

export function formatMeetingTimeRange(startTime: string, endTime: string): string {
  return `${formatMeetingTime(startTime)} — ${formatMeetingTime(endTime)}`;
}

export function toDateInputValue(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
