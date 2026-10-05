const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATESTR = /^\d{4}-\d{2}-\d{2}$/;

export function isValidTimeStr(value: string): boolean {
  return HHMM.test(value);
}

export function isValidDateStr(value: string): boolean {
  return DATESTR.test(value) && !Number.isNaN(dateStrToDate(value).getTime());
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Dates are "YYYY-MM-DD" strings in server-local time. All slot math assumes
// the server runs in the club's timezone (set TZ=Europe/Bucharest if not).
export function todayDateStr(): string {
  return dateToDateStr(new Date());
}

export function dateToDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateStrToDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, days: number): string {
  const date = dateStrToDate(dateStr);
  date.setDate(date.getDate() + days);
  return dateToDateStr(date);
}

export function nowMinutesOfDay(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export const DAY_NAMES_RO = [
  "Duminică",
  "Luni",
  "Marți",
  "Miercuri",
  "Joi",
  "Vineri",
  "Sâmbătă",
];

export function formatDateRo(dateStr: string): string {
  return dateStrToDate(dateStr).toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
