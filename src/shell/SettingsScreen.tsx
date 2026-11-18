import { useEffect, useRef, useState } from 'react'
import { updateSettings, useSettings } from '../db/settings'
import { exportToFile, importBackup, parseBackup } from '../db/backup'
import { MICRO_KEYS, MICROS } from '../lib/micros'
import NumberField from './NumberField'

export default function SettingsScreen() {
  const s = useSettings()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [persisted, setPersisted] = useState<boolean | null>(null)

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted)
  }, [])

  if (!s) return null

  async function onExport() {
    try {
      await exportToFile()
      setMessage('Backup file downloaded.')
    } catch (e) {
      setMessage(`Export failed: ${(e as Error).message}`)
    }
  }

  async function onImportFile(file: File) {
    try {
      const backup = parseBackup(await file.text())
      const when = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString() : 'unknown date'
      if (!window.confirm(`Replace ALL data on this phone with the backup from ${when}? This cannot be undone.`)) {
        return
      }
      await importBackup(backup)
      setMessage('Backup imported.')
    } catch (e) {
      setMessage(`Import failed: ${(e as Error).message}`)
    }
  }

  return (
    <div className="screen">
      <h1>Settings</h1>

      <section className="card">
        <h2>Daily targets</h2>
        <NumberField label="Calories" unit="kcal" value={s.kcalTarget} onCommit={(v) => updateSettings({ kcalTarget: v })} />
        <NumberField label="Protein" unit="g" value={s.proteinTarget} onCommit={(v) => updateSettings({ proteinTarget: v })} />
        <NumberField label="Carbs" unit="g" value={s.carbsTarget} onCommit={(v) => updateSettings({ carbsTarget: v })} />
        <NumberField label="Fat" unit="g" value={s.fatTarget} onCommit={(v) => updateSettings({ fatTarget: v })} />
      </section>

      <section className="card">
        <h2>Micro targets</h2>
        {MICRO_KEYS.map((k) => (
          <NumberField
            key={k}
            label={MICROS[k].label}
            unit={MICROS[k].unit}
            value={s.microTargets[k]}
            onCommit={(v) => updateSettings({ microTargets: { ...s.microTargets, [k]: v } })}
          />
        ))}
      </section>

      <section className="card">
        <h2>Rest timer</h2>
        <label className="field">
          <span className="field-label">Enabled</span>
          <input
            type="checkbox"
            className="toggle"
            checked={s.restTimerEnabled}
            onChange={(e) => updateSettings({ restTimerEnabled: e.target.checked })}
          />
        </label>
        <NumberField
          label="Duration"
          unit="s"
          value={s.restTimerSeconds}
          onCommit={(v) => updateSettings({ restTimerSeconds: Math.round(v) })}
        />
      </section>

      <section className="card">
        <h2>Data</h2>
        <p className="muted">
          Last backup: {s.lastBackupAt ? new Date(s.lastBackupAt).toLocaleString() : 'never'}
        </p>
        {persisted !== null && (
          <p className="muted">Persistent storage: {persisted ? 'granted' : 'not granted by the browser'}</p>
        )}
        <div className="row">
          <button className="btn primary" onClick={onExport}>Export JSON</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import JSON</button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) onImportFile(f)
          }}
        />
        {message && <p className="message">{message}</p>}
      </section>
    </div>
  )
}
