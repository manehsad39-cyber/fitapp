import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Exercise, type WorkoutSet } from '../db/db'
import type { Settings } from '../db/settings'
import { e1rm, fmtE1rm } from '../lib/e1rm'
import { fmtNum, parseNum } from '../lib/format'
import { dayLabel, nutritionDay } from '../lib/nutritionDay'
import type { SetBadge } from '../lib/pr'
import { suggestWeight } from '../lib/suggestion'
import NumInput from '../shell/NumInput'
import Sheet from '../shell/Sheet'
import Badge from './Badge'
import { lastSessionSets, weightUnit } from './data'
import { restTimer } from './restTimer'

interface Props {
  workoutId: number
  exercise: Exercise
  sets: WorkoutSet[]
  badges: Map<number, SetBadge>
  settings: Settings
  onRemove?: () => void
}

/** One strength exercise inside the active workout. */
export default function ExerciseCard({ workoutId, exercise, sets, badges, settings, onRemove }: Props) {
  const last = useLiveQuery(() => lastSessionSets(exercise.id, workoutId), [exercise.id, workoutId])
  const suggestion = last ? suggestWeight(last, exercise.repLo, exercise.repHi, exercise.increment, exercise.formula) : null
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [editing, setEditing] = useState<WorkoutSet | null>(null)
  const unit = weightUnit(exercise)

  // Prefill once when history has loaded: last set of this workout, else the suggestion.
  const prefilled = useRef(false)
  useEffect(() => {
    if (prefilled.current || last === undefined) return
    prefilled.current = true
    const prev = sets[sets.length - 1]
    if (prev) {
      setWeight(String(prev.weight))
      setReps(String(prev.reps))
    } else if (suggestion) {
      setWeight(String(suggestion.weight))
    }
  }, [last, sets, suggestion])

  const w = parseNum(weight)
  const r = parseNum(reps)
  const valid = w !== null && w >= 0 && r !== null && r >= 1 && Number.isInteger(r)

  async function logSet() {
    if (!valid) return
    await db.sets.add({ workoutId, exerciseId: exercise.id, weight: w!, reps: r!, loggedAt: Date.now() } as WorkoutSet)
    if (settings.restTimerEnabled) restTimer.start(settings.restTimerSeconds)
  }

  const today = nutritionDay(Date.now())

  return (
    <section className="card exercise-card">
      <div className="card-head">
        <h2>{exercise.name}</h2>
        {onRemove && sets.length === 0 && (
          <button className="icon-btn" aria-label="Remove exercise" onClick={onRemove}>
            ✕
          </button>
        )}
      </div>
      <p className="muted small">
        {exercise.repLo}-{exercise.repHi} reps · +{fmtNum(exercise.increment)} {unit}
      </p>

      {last && last.length > 0 ? (
        <p className="small">
          <span className="muted">Last ({dayLabel(nutritionDay(last[0].loggedAt), today)}):</span>{' '}
          {last.map((s) => `${fmtNum(s.weight)}×${s.reps}`).join(', ')}
        </p>
      ) : (
        <p className="muted small">No previous session.</p>
      )}
      {suggestion && (
        <p className="suggestion">
          Suggested: <strong>{fmtNum(suggestion.weight)} {unit}</strong> · {suggestion.reason}
        </p>
      )}

      {sets.length > 0 && (
        <ol className="set-list">
          {sets.map((s) => {
            const b = badges.get(s.id)
            return (
              <li key={s.id}>
                <button onClick={() => setEditing(s)}>
                  <span>
                    {fmtNum(s.weight)} {unit} × {s.reps}
                  </span>
                  <span className="muted small">e1RM {fmtE1rm(e1rm(s.weight, s.reps, exercise.formula), s.reps)}</span>
                  {b && <Badge kind={b} loggedAt={s.loggedAt} />}
                </button>
              </li>
            )
          })}
        </ol>
      )}

      <form
        className="set-input"
        onSubmit={(e) => {
          e.preventDefault()
          logSet()
        }}
      >
        <label>
          <span className="small muted">{unit}</span>
          <NumInput value={weight} onChange={setWeight} aria-label={`Weight in ${unit}`} />
        </label>
        <label>
          <span className="small muted">reps</span>
          <NumInput value={reps} onChange={setReps} inputMode="numeric" aria-label="Reps" />
        </label>
        <button className="btn primary" type="submit" disabled={!valid}>
          Log set
        </button>
      </form>

      {editing && <SetSheet set={editing} unit={unit} onClose={() => setEditing(null)} />}
    </section>
  )
}

function SetSheet({ set, unit, onClose }: { set: WorkoutSet; unit: string; onClose: () => void }) {
  const [weight, setWeight] = useState(String(set.weight))
  const [reps, setReps] = useState(String(set.reps))
  const w = parseNum(weight)
  const r = parseNum(reps)
  const valid = w !== null && w >= 0 && r !== null && r >= 1 && Number.isInteger(r)

  return (
    <Sheet title="Edit set" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!valid) return
          await db.sets.update(set.id, { weight: w!, reps: r! })
          onClose()
        }}
      >
        <label className="field">
          <span className="field-label">Weight</span>
          <span className="field-input">
            <NumInput value={weight} onChange={setWeight} autoFocus />
            <span className="unit">{unit}</span>
          </span>
        </label>
        <label className="field">
          <span className="field-label">Reps</span>
          <span className="field-input">
            <NumInput value={reps} onChange={setReps} inputMode="numeric" />
          </span>
        </label>
        <button className="btn primary block" type="submit" disabled={!valid}>
          Save
        </button>
        <button
          className="btn block"
          type="button"
          onClick={async () => {
            if (!window.confirm('Delete this set?')) return
            await db.sets.delete(set.id)
            onClose()
          }}
        >
          Delete set
        </button>
      </form>
    </Sheet>
  )
}
