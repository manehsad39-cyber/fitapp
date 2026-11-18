import { db, TABLE_NAMES, type TableName } from './db'
import { updateSettings } from './settings'

export interface Backup {
  app: 'fitapp'
  schemaVersion: 1
  exportedAt: string
  tables: Record<TableName, unknown[]>
}

/** Validates a backup file's text. Throws an Error with a readable message. */
export function parseBackup(text: string): Backup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('This file is not valid JSON.')
  }
  const b = data as Partial<Backup>
  if (!b || typeof b !== 'object' || b.app !== 'fitapp') {
    throw new Error('This file is not a FitApp backup.')
  }
  if (b.schemaVersion !== 1) {
    throw new Error(`Unsupported backup version: ${String(b.schemaVersion)}.`)
  }
  if (!b.tables || typeof b.tables !== 'object') {
    throw new Error('Backup has no data.')
  }
  const raw = b.tables as Record<string, unknown>
  for (const name of TABLE_NAMES) {
    if (raw[name] !== undefined && !Array.isArray(raw[name])) {
      throw new Error(`Backup table "${name}" is malformed.`)
    }
  }
  const tables = Object.fromEntries(
    TABLE_NAMES.map((n) => [n, (raw[n] as unknown[] | undefined) ?? []]),
  ) as Record<TableName, unknown[]>
  return { app: 'fitapp', schemaVersion: 1, exportedAt: String(b.exportedAt ?? ''), tables }
}

export async function buildBackup(now = new Date()): Promise<Backup> {
  const tables = {} as Record<TableName, unknown[]>
  for (const name of TABLE_NAMES) tables[name] = await db.table(name).toArray()
  return { app: 'fitapp', schemaVersion: 1, exportedAt: now.toISOString(), tables }
}

/** Downloads a JSON file with all data and records the backup date. */
export async function exportToFile(): Promise<void> {
  const now = new Date()
  await updateSettings({ lastBackupAt: now.getTime() })
  const backup = await buildBackup(now)
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fitapp-backup-${now.toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Replaces all data with the backup contents. */
export async function importBackup(backup: Backup): Promise<void> {
  const tables = TABLE_NAMES.map((n) => db.table(n))
  await db.transaction('rw', tables, async () => {
    for (const name of TABLE_NAMES) {
      const table = db.table(name)
      await table.clear()
      await table.bulkAdd(backup.tables[name])
    }
  })
}
