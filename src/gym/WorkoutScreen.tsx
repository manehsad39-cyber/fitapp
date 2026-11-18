import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate } from 'react-router'
import { db, type Workout } from '../db/db'
import { useSettings } from '../db/settings'
import { clockTime } from '../lib/nutritionDay'
import {
  finishWorkout,
  runsOfWorkout,
  setsOfWorkout,
  startWorkout,
  useActiveWorkout,
  useAllRunBadges,
  useAllSetBadges,
  useExercisesById,
} from './data'
import ExerciseCard from './ExerciseCard'
import ExercisePicker from './ExercisePicker'
import RunCard from './RunCard'
import { restTimer } from './restTimer'

export default function WorkoutScreen() {
  const active = useActiveWorkout()
  if (active === undefined) return null
  return active ? <ActiveWorkout workout={active} /> : <StartWorkout />
}

function StartWorkout() {
  const routines = useLiveQuery(() => db.routines.orderBy('name').toArray())
  const exercises = useExercisesById()
  if (!routines || !exercises) return null

  return (
    <div className="screen">
      <h1>Workout</h1>
      <button className="btn primary block" onClick={() => startWorkout([])}>
        Start empty workout
      </button>
      <h3 className="list-title">From a routine</h3>
      <ul className="result-list">
        {routines.map((r) => (
          <li key={r.id}>
            <button onClick={() => startWorkout(r.exerciseIds.filter((id) => exercises.get(id) && !exercises.get(id)!.archived))}>
              <span>{r.name}</span>
              <span className="muted small">{r.exerciseIds.length} exercises · Start</span>
            </button>
          </li>
        ))}
        {routines.length === 0 && (
          <li className="muted empty">
            No routines yet. <Link to="/g/routines">Create one in Routines</Link>.
          </li>
        )}
      </ul>
    </div>
  )
}

function ActiveWorkout({ workout }: { workout: Workout }) {
  const navigate = useNavigate()
  const exercises = useExercisesById()
  const sets = useLiveQuery(() => setsOfWorkout(workout.id), [workout.id])
  const runs = useLiveQuery(() => runsOfWorkout(workout.id), [workout.id])
  const setBadges = useAllSetBadges()
  const runBadges = useAllRunBadges()
  const settings = useSettings()
  const [picking, setPicking] = useState(false)

  if (!exercises || !sets || !runs || !setBadges || !runBadges || !settings) return null

  const setExerciseIds = (exerciseIds: number[]) => db.workouts.update(workout.id, { exerciseIds })

  async function finish() {
    if (!window.confirm('Finish this workout?')) return
    restTimer.skip()
    const kept = await finishWorkout(workout.id)
    if (kept) navigate(`/g/history/${workout.id}`)
  }

  return (
    <div className="screen">
      <div className="card-head">
        <h1>Workout</h1>
        <span className="muted">started {clockTime(workout.startedAt)}</span>
      </div>

      {workout.exerciseIds.map((id) => {
        const ex = exercises.get(id)
        if (!ex) return null
        const remove = () => setExerciseIds(workout.exerciseIds.filter((x) => x !== id))
        return ex.type === 'cardio' ? (
          <RunCard key={id} workoutId={workout.id} exercise={ex} runs={runs} badges={runBadges} onRemove={remove} />
        ) : (
          <ExerciseCard
            key={id}
            workoutId={workout.id}
            exercise={ex}
            sets={sets.filter((s) => s.exerciseId === id)}
            badges={setBadges}
            settings={settings}
            onRemove={remove}
          />
        )
      })}

      {workout.exerciseIds.length === 0 && <p className="muted">Add your first exercise.</p>}

      <button className="btn block" onClick={() => setPicking(true)}>
        + Add exercise
      </button>
      <button className="btn primary block" onClick={finish}>
        Finish workout
      </button>

      {picking && (
        <ExercisePicker
          exclude={workout.exerciseIds}
          onClose={() => setPicking(false)}
          onPick={(e) => {
            setExerciseIds([...workout.exerciseIds, e.id])
            setPicking(false)
          }}
        />
      )}
    </div>
  )
}
