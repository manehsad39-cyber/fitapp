export type Mode = 'nutrition' | 'gym'

export const MODE_HOME: Record<Mode, string> = {
  nutrition: '/n/today',
  gym: '/g/workout',
}

// Background colors, also used for the browser theme-color meta tag.
export const MODE_THEME_COLOR: Record<Mode, string> = {
  nutrition: '#0b1a12',
  gym: '#1a0b0b',
}

const STORAGE_KEY = 'fitapp.mode'

/** Nutrition routes start with /n, gym routes with /g; others (Settings) have no mode. */
export function modeFromPath(path: string): Mode | null {
  if (path === '/n' || path.startsWith('/n/')) return 'nutrition'
  if (path === '/g' || path.startsWith('/g/')) return 'gym'
  return null
}

export function loadMode(): Mode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'gym' ? 'gym' : 'nutrition'
  } catch {
    return 'nutrition'
  }
}

export function saveMode(mode: Mode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Storage unavailable: the mode just will not be remembered.
  }
}

export function applyTheme(mode: Mode): void {
  document.documentElement.dataset.mode = mode
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', MODE_THEME_COLOR[mode])
}
