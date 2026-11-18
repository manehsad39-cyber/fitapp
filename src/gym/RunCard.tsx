import { useState } from 'react'
import { db, type Exercise, type Run } from '../db/db'
import { fmtNum, parseNum } from '../lib/format'
import { fmtDuration, fmtPace, paceSecPerKm, speedKmh, type RunBadge } from '../lib/run'
import NumInput from '../shell/NumInput'
import Sheet from '../shell/Sheet'
import Badge from './Badge'

interface RunForm {
  min: string
  sec: string
  km: string
  incline: string
}

function parseRun(f: RunForm): { durationSec: number; distanceKm: number; incline: number } | null {
  const min = parseNum(f.min) ?? 0
  const sec = parseNum(f.sec) ?? 0
  const km = parseNum(f.km)
  const incline = parseNum(f.incline) ?? 0
  const durationSec = Math.round(min * 60 + sec)
  if (durationSec <= 0 || km === null || km <= 0 || min < 0 || sec < 0 || incline < 0) return null
  return { durationSec, distanceKm: km, incline }
}

function RunFields({ f, set }: { f: RunForm; set: (p: Partial<RunForm>) => void }) {
  return (
    <div className="run-grid">
      <label>
        <span className="small muted">min</span>
        <NumInput value={f.min} onChange={(min) => set({ min })} inputMode="numeric" aria-label="Minutes" />
      </label>
      <label>
        <span className="small muted">sec</span>
        <NumInput value={f.sec} onChange={(sec) => set({ sec })} inputMode="numeric" aria-label="Seconds" />
      </label>
      <label>
        <span className="small muted">km</span>
        <NumInput value={f.km} onChange={(km) => set({ km })} aria-label="Distance in km" />
      </label>
      <label>
        <span className="small muted">incline %</span>
        <NumInput value={f.incline} onChange={(incline) => set({ incline })} aria-label="Incline in percent" />
      </label>
    </div>
  )
}

export function RunLine({ run, badges }: { run: Run; badges?: RunBadge[] }) {
  return (
    <>
      <span>
        {fmtNum(run.distanceKm)} km in {fmtDuration(run.durationSec)} · {fmtNum(run.incline)}%
      </span>
      <span className="muted small">
        {fmtNum(speedKmh(run.distanceKm, run.durationSec))} km/h · {fmtPace(paceSecPerKm(run.distanceKm, run.durationSec))} /km
      </span>
      {badges?.map((b) => <Badge key={b} kind={b} loggedAt={run.loggedAt} />)}
    </>
  )
}

/** Treadmill run inside the active workout. */
export default function RunCard({
  workoutId,
  exercise,
  runs,
  badges,
  onRemove,
}: {
  workoutId: number
  exercise: Exercise
  runs: Run[]
  badges: Map<number, RunBadge[]>
  onRemove?: () => void
}) {
  const [f, setF] = useState<RunForm>({ min: '', sec: '', km: '', incline: '' })
  const [editing, setEditing] = useState<Run | null>(null)
  const parsed = parseRun(f)

  return (
    <section className="card exercise-card">
      <div className="card-head">
        <h2>{exercise.name}</h2>
        {onRemove && runs.length === 0 && (
          <button className="icon-btn" aria-label="Remove exercise" onClick={onRemove}>
            ✕
          </button>
        )}
      </div>
      {runs.length > 0 && (
        <ol className="set-list">
          {runs.map((r) => (
            <li key={r.id}>
              <button onClick={() => setEditing(r)}>
                <RunLine run={r} badges={badges.get(r.id)} />
              </button>
            </li>
          ))}
        </ol>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!parsed) return
          await db.runs.add({ workoutId, ...parsed, loggedAt: Date.now() } as Run)
          setF({ min: '', sec: '', km: '', incline: '' })
        }}
      >
        <RunFields f={f} set={(p) => setF({ ...f, ...p })} />
        {parsed && (
          <p className="muted small">
            {fmtNum(speedKmh(parsed.distanceKm, parsed.durationSec))} km/h ·{' '}
            {fmtPace(paceSecPerKm(parsed.distanceKm, parsed.durationSec))} /km
          </p>
        )}
        <button className="btn primary block" type="submit" disabled={!parsed}>
          Log run
        </button>
      </form>
      {editing && <RunSheet run={editing} onClose={() => setEditing(null)} />}
    </section>
  )
}

function RunSheet({ run, onClose }: { run: Run; onClose: () => void }) {
  const [f, setF] = useState<RunForm>({
    min: String(Math.floor(run.durationSec / 60)),
    sec: String(run.durationSec % 60),
    km: String(run.distanceKm),
    incline: String(run.incline),
  })
  const parsed = parseRun(f)
  return (
    <Sheet title="Edit run" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!parsed) return
          await db.runs.update(run.id, parsed)
          onClose()
        }}
      >
        <RunFields f={f} set={(p) => setF({ ...f, ...p })} />
        <button className="btn primary block" type="submit" disabled={!parsed}>
          Save
        </button>
        <button
          className="btn block"
          type="button"
          onClick={async () => {
            if (!window.confirm('Delete this run?')) return
            await db.runs.delete(run.id)
            onClose()
          }}
        >
          Delete run
        </button>
      </form>
    </Sheet>
  )
}
