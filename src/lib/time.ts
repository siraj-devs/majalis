/** Normalize "HH:mm" or "HH:mm:ss" to "HH:mm". */
export function normalizeTime(value: string): string {
  const match = value.trim().match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (!match) throw new Error("Invalid time");
  return `${match[1]}:${match[2]}`;
}

export function timeToMinutes(value: string): number {
  const [h, m] = normalizeTime(value).split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function isEndAfterStart(startTime: string, endTime: string): boolean {
  return timeToMinutes(endTime) > timeToMinutes(startTime);
}

/** Earliest selectable end time (1 minute after start) for `<input type="time" min>`. */
export function earliestEndTime(startTime: string): string | undefined {
  try {
    const minutes = timeToMinutes(startTime) + 1;
    if (minutes >= 24 * 60) return undefined;
    return minutesToTime(minutes);
  } catch {
    return undefined;
  }
}
