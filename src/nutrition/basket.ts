import { useSyncExternalStore } from 'react'
import type { MealItem } from '../db/db'

// The current meal basket. Kept in localStorage so it survives the app
// being closed in the middle of building a meal.

const KEY = 'fitapp.basket'
const listeners = new Set<() => void>()
let cache: MealItem[] = read()

function read(): MealItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as MealItem[]) : []
  } catch {
    return []
  }
}

function write(items: MealItem[]) {
  cache = items
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // Not persisted; the basket still works for this session.
  }
  listeners.forEach((l) => l())
}

export function useBasket(): MealItem[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => cache,
  )
}

export const basket = {
  add: (items: MealItem[]) => write([...cache, ...items]),
  replace: (index: number, item: MealItem) => write(cache.map((it, i) => (i === index ? item : it))),
  remove: (index: number) => write(cache.filter((_, i) => i !== index)),
  clear: () => write([]),
}
