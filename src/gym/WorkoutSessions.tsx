import type { Exercise, Run, Workout, WorkoutSet } from '../db/db'
import { e1rm, fmtE1rm } from '../lib/e1rm'
import { fmtNum } from '../lib/format'
import type { SetBadge } from '../lib/pr'
import type { RunBadge } from '../lib/run'
import Badge from './Badge'
import { RunLine } from './RunCard'
import { weightUnit } from './data'

export interface SessionData {
  workout: Workout
  sets: WorkoutSet[]
  runs: Run[]
}

/** Exercise ids of a session in order: the workout's list, then any others that have sets. */
export function sessionExerciseIds(d: SessionData): number[] {
  const ids = [...d.workout.exerciseIds]
  for (const s of d.sets) if (!ids.includes(s.exerciseId)) ids.push(s.exerciseId)
  return ids
}

/** Exercises with their sets (and runs), PR badges included. */
export function SessionExercises({
  data,
  exercises,
  setBadges,
  runBadges,
}: {
  data: SessionData
  exercises: Map<number, Exercise>
  setBadges: Map<number, SetBadge>
  runBadges: Map<number, RunBadge[]>
}) {
  return (
    <>
      {sessionExerciseIds(data).map((id) => {
        const ex = exercises.get(id)
        if (!ex) return null
        if (ex.type === 'cardio') {
          if (data.runs.length === 0) return null
          return (
            <div key={id} className="session-ex">
              <strong>{ex.name}</strong>
              <ul className="plain-list small">
                {data.runs.map((r) => (
                  <li key={r.id} className="badge-line">
                    <RunLine run={r} badges={runBadges.get(r.id)?.filter((b) => b !== 'baseline')} />
                  </li>
                ))}
              </ul>
            </div>
          )
        }
        const sets = data.sets.filter((s) => s.exerciseId === id)
        if (sets.length === 0) return null
        return (
          <div key={id} className="session-ex">
            <strong>{ex.name}</strong> <span className="muted small">· {sets.length} {sets.length === 1 ? 'set' : 'sets'}</span>
            <ul className="plain-list small">
              {sets.map((s) => {
                const b = setBadges.get(s.id)
                return (
                  <li key={s.id} className="badge-line">
                    <span>
                      {fmtNum(s.weight)} {weightUnit(ex)} × {s.reps}
                    </span>
                    <span className="muted">e1RM {fmtE1rm(e1rm(s.weight, s.reps, ex.formula), s.reps)}</span>
                    {b && <Badge kind={b} />}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </>
  )
}
