import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { MICRO_KEYS, MICROS, type MicroKey } from '../lib/micros'

export interface Settings {
  kcalTarget: number
  proteinTarget: number
  carbsTarget: number
  fatTarget: number
  microTargets: Record<MicroKey, number>
  restTimerEnabled: boolean
  restTimerSeconds: number
  lastBackupAt: number | null
}

export const DEFAULT_SETTINGS: Settings = {
  kcalTarget: 3000,
  proteinTarget: 180,
  carbsTarget: 390,
  fatTarget: 80,
  microTargets: Object.fromEntries(
    MICRO_KEYS.map((k) => [k, MICROS[k].defaultTarget]),
  ) as Record<MicroKey, number>,
  restTimerEnabled: true,
  restTimerSeconds: 90,
  lastBackupAt: null,
}

const KEY = 'settings'

// Missing fields (e.g. after an app update) fall back to defaults.
export function withDefaults(stored: Partial<Settings> | undefined): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    microTargets: { ...DEFAULT_SETTINGS.microTargets, ...stored?.microTargets },
  }
}

export async function getSettings(): Promise<Settings> {
  const row = await db.kv.get(KEY)
  return withDefaults(row?.value as Partial<Settings> | undefined)
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  await db.transaction('rw', db.kv, async () => {
    const current = await getSettings()
    await db.kv.put({ key: KEY, value: { ...current, ...patch } })
  })
}

/** Live settings; undefined while loading. */
export function useSettings(): Settings | undefined {
  return useLiveQuery(getSettings)
}
