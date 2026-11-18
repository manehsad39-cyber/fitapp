/** Integer with thousands separators, e.g. 1,000. */
export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/** Up to one decimal, trailing ".0" dropped: 12.5, 12, 0.3. */
export function fmtNum(n: number): string {
  return String(Math.round(n * 10) / 10)
}

/** Micro amounts: two decimals below 1, one below 10, else integer. */
export function fmtAmount(n: number): string {
  if (n < 1) return String(Math.round(n * 100) / 100)
  if (n < 10) return String(Math.round(n * 10) / 10)
  return fmtInt(n)
}

export function pct(value: number, target: number): number {
  return target > 0 ? Math.round((value / target) * 100) : 0
}

/** Plain statement, e.g. "1,000 kcal left" or "200 kcal over target". */
export function caloriesLeftText(eaten: number, target: number): string {
  const diff = Math.round(target - eaten)
  return diff >= 0 ? `${fmtInt(diff)} kcal left` : `${fmtInt(-diff)} kcal over target`
}

/** Parses a user-typed number (comma or dot). Returns null when empty or invalid. */
export function parseNum(text: string): number | null {
  const t = text.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
