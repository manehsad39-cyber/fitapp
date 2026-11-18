import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router'
import { db } from '../db/db'
import { startWorkout, useActiveWorkout, useExercisesById } from './data'
import ExercisePicker from './ExercisePicker'

export default function RoutineEditScreen() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const routine = useLiveQuery(async () => (await db.routines.get(id)) ?? null, [id])
  const exercises = useExercisesById()
  const active = useActiveWorkout()
  const [picking, setPicking] = useState(false)
  const back = () => navigate('/g/routines')

  if (routine === null) {
    return (
      <div className="screen">
        <p className="muted">This routine no longer exists.</p>
        <button className="btn" onClick={back}>
          Back to Routines
        </button>
      </div>
    )
  }
  if (!routine || !exercises || active === undefined) return null

  const ids = routine.exerciseIds
  const setIds = (exerciseIds: number[]) => db.routines.update(id, { exerciseIds })
  const move = (i: number, dir: -1 | 1) => {
    const next = [...ids]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    setIds(next)
  }

  async function rename() {
    const name = window.prompt('New name:', routine?.name)?.trim()
    if (name) await db.routines.update(id, { name })
  }

  async function remove() {
    if (!window.confirm(`Delete routine “${routine?.name}”?`)) return
    await db.routines.delete(id)
    back()
  }

  async function start() {
    await startWorkout(ids.filter((x) => exercises?.get(x) && !exercises.get(x)!.archived))
    navigate('/g/workout')
  }

  return (
    <div className="screen">
      <div className="card-head">
        <button className="btn" onClick={back}>
          ‹ Back
        </button>
        <h1>{routine.name}</h1>
      </div>

      <section className="card">
        <h2>Exercises</h2>
        <ol className="item-list">
          {ids.map((exId, i) => {
            const ex = exercises.get(exId)
            return (
              <li key={exId}>
                <span className="item-main">
                  {i + 1}. {ex?.name ?? 'Unknown exercise'}
                  {ex?.archived && <span className="muted small"> (archived, skipped when starting)</span>}
                </span>
                <button className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button className="icon-btn" aria-label="Move down" disabled={i === ids.length - 1} onClick={() => move(i, 1)}>
                  ↓
                </button>
                <button className="icon-btn" aria-label="Remove" onClick={() => setIds(ids.filter((x) => x !== exId))}>
                  ✕
                </button>
              </li>
            )
          })}
          {ids.length === 0 && <li className="muted empty">No exercises yet.</li>}
        </ol>
        <button className="btn block" onClick={() => setPicking(true)}>
          + Add exercise
        </button>
      </section>

      {active ? (
        <p className="muted">A workout is in progress. Finish it to start this routine.</p>
      ) : (
        <button className="btn primary block" onClick={start} disabled={ids.length === 0}>
          Start workout
        </button>
      )}
      <div className="row">
        <button className="btn grow" onClick={rename}>
          Rename
        </button>
        <button className="btn grow" onClick={remove}>
          Delete
        </button>
      </div>

      {picking && (
        <ExercisePicker
          exclude={ids}
          onClose={() => setPicking(false)}
          onPick={(e) => {
            setIds([...ids, e.id])
            setPicking(false)
          }}
        />
      )}
    </div>
  )
}
