import { useSyncExternalStore } from 'react'

// Rest timer state: the timestamp when the rest ends, or null.
// Kept in localStorage so it survives switching screens or reopening the app.

const KEY = 'fitapp.restEndsAt'
const listeners = new Set<() => void>()
let endsAt: number | null = read()

function read(): number | null {
  try {
    const v = Number(localStorage.getItem(KEY))
    return v > 0 ? v : null
  } catch {
    return null
  }
}

function write(v: number | null) {
  endsAt = v
  try {
    if (v) localStorage.setItem(KEY, String(v))
    else localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  listeners.forEach((l) => l())
}

export function useRestEndsAt(): number | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => endsAt,
  )
}

export const restTimer = {
  start: (seconds: number) => write(Date.now() + seconds * 1000),
  add: (seconds: number) => write((endsAt ?? Date.now()) + seconds * 1000),
  skip: () => write(null),
}
