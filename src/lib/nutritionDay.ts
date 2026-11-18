// A nutrition day runs from 04:00 to 04:00 local time.
// Days are represented as 'YYYY-MM-DD' strings.

export const DAY_START_HOUR = 4

const pad = (n: number) => String(n).padStart(2, '0')

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseDay(day: string): [number, number, number] {
  const [y, m, d] = day.split('-').map(Number)
  return [y, m - 1, d]
}

/** Calendar date of (timestamp - 4h). */
export function nutritionDay(ts: number): string {
  return dateKey(new Date(ts - DAY_START_HOUR * 3600_000))
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = parseDay(day)
  return dateKey(new Date(y, m, d + n))
}

/** The n days ending with endDay, oldest first. */
export function lastNDays(endDay: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(endDay, i - (n - 1)))
}

/** Timestamp for a clock time ('HH:MM') within a nutrition day. Times before 04:00 fall on the next calendar date. */
export function timestampFor(day: string, hhmm: string): number {
  const [h, min] = hhmm.split(':').map(Number)
  const [y, m, d] = parseDay(day)
  const extra = h < DAY_START_HOUR ? 1 : 0
  return new Date(y, m, d + extra, h, min).getTime()
}

export function clockTime(ts: number): string {
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** e.g. "Today", "Yesterday", "Mon 16 Nov". */
export function dayLabel(day: string, today: string): string {
  if (day === today) return 'Today'
  if (day === addDays(today, -1)) return 'Yesterday'
  const [y, m, d] = parseDay(day)
  const date = new Date(y, m, d)
  return `${WEEKDAYS[date.getDay()]} ${d} ${MONTHS[m]}`
}

/** Short label for chart axes, e.g. "16/11". */
export function shortDay(day: string): string {
  const [, m, d] = parseDay(day)
  return `${d}/${m + 1}`
}
