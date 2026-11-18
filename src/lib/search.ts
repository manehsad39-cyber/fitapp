import type { Meal } from '../db/db'

/** Lowercase, accents removed: "Pâtes" -> "pates". */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/** Case and accent insensitive substring match. Matches starting with the query come first, then A-Z. */
export function searchByName<T extends { name: string }>(items: T[], query: string): T[] {
  const q = normalize(query)
  return items
    .filter((it) => normalize(it.name).includes(q))
    .sort((a, b) => {
      const as = normalize(a.name).startsWith(q) ? 0 : 1
      const bs = normalize(b.name).startsWith(q) ? 0 : 1
      return as - bs || a.name.localeCompare(b.name)
    })
}

/** Food ids from the most recently logged meals, newest first, without duplicates. */
export function recentFoodIds(meals: Meal[], limit: number): number[] {
  const sorted = [...meals].sort((a, b) => b.time - a.time)
  const ids: number[] = []
  for (const m of sorted) {
    for (const it of m.items) {
      if (!ids.includes(it.foodId)) ids.push(it.foodId)
      if (ids.length >= limit) return ids
    }
  }
  return ids
}

/** Food ids by how many meals they appear in, most frequent first. */
export function frequentFoodIds(meals: Meal[], limit: number): number[] {
  const counts = new Map<number, number>()
  for (const m of meals) {
    for (const id of new Set(m.items.map((i) => i.foodId))) counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, limit)
    .map(([id]) => id)
}
