import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'
import { db } from '../db/db'
import { dayLabel, nutritionDay } from '../lib/nutritionDay'
import { fmtDuration } from '../lib/run'
import { useAllRunBadges, useAllSetBadges, useExercisesById } from './data'
import { SessionExercises, type SessionData } from './WorkoutSessions'

/** Finished workouts, newest first, with their exercises and sets. */
export default function HistoryScreen() {
  const sessions = useLiveQuery(async (): Promise<SessionData[]> => {
    const [workouts, sets, runs] = await Promise.all([db.workouts.toArray(), db.sets.toArray(), db.runs.toArray()])
    return workouts
      .filter((w) => w.finishedAt)
      .sort((a, b) => b.startedAt - a.startedAt)
      .map((workout) => ({
        workout,
        sets: sets.filter((s) => s.workoutId === workout.id).sort((a, b) => a.loggedAt - b.loggedAt),
        runs: runs.filter((r) => r.workoutId === workout.id).sort((a, b) => a.loggedAt - b.loggedAt),
      }))
  })
  const exercises = useExercisesById()
  const setBadges = useAllSetBadges()
  const runBadges = useAllRunBadges()
  if (!sessions || !exercises || !setBadges || !runBadges) return null
  const today = nutritionDay(Date.now())

  return (
    <div className="screen">
      <h1>History</h1>
      {sessions.length === 0 && <p className="muted">No finished workouts yet.</p>}
      {sessions.map((d) => (
        <section key={d.workout.id} className="card">
          <Link to={`/g/history/${d.workout.id}`} className="card-head link-head">
            <h2>{dayLabel(nutritionDay(d.workout.startedAt), today)}</h2>
            <span className="muted small">{fmtDuration((d.workout.finishedAt! - d.workout.startedAt) / 1000)} ›</span>
          </Link>
          <SessionExercises data={d} exercises={exercises} setBadges={setBadges} runBadges={runBadges} />
        </section>
      ))}
    </div>
  )
}
