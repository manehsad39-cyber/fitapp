import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate, useParams } from 'react-router'
import { db, type Exercise, type WorkoutSet } from '../db/db'
import { e1rm, fmtE1rm } from '../lib/e1rm'
import { fmtNum } from '../lib/format'
import { dayLabel, nutritionDay } from '../lib/nutritionDay'
import { fmtDuration, fmtPace, paceSecPerKm, PACE_PR_MIN_KM, speedKmh } from '../lib/run'
import { exerciseTypeLabel, weightUnit } from './data'
import LineChart from './LineChart'

export default function ExerciseProgressScreen() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const exercise = useLiveQuery(async () => (await db.exercises.get(id)) ?? null, [id])

  if (exercise === null) {
    return (
      <div className="screen">
        <p className="muted">This exercise no longer exists.</p>
        <button className="btn" onClick={() => navigate('/g/exercises')}>
          Back to Exercises
        </button>
      </div>
    )
  }
  if (!exercise) return null

  return (
    <div className="screen">
      <div className="card-head">
        <button className="btn" onClick={() => navigate('/g/exercises')}>
          ‹ Back
        </button>
        <h1>{exercise.name}</h1>
        <Link className="btn" to={`/g/exercises/edit/${id}`}>
          Edit
        </Link>
      </div>
      <p className="muted small">
        {exerciseTypeLabel(exercise)}
        {exercise.type !== 'cardio' && ` · ${exercise.repLo}-${exercise.repHi} reps · +${fmtNum(exercise.increment)} ${weightUnit(exercise)}`}
        {exercise.archived && ' · archived'}
      </p>
      {exercise.type === 'cardio' ? <RunProgress /> : <StrengthProgress exercise={exercise} />}
    </div>
  )
}

function StrengthProgress({ exercise }: { exercise: Exercise }) {
  const sets = useLiveQuery(() => db.sets.where('exerciseId').equals(exercise.id).sortBy('loggedAt'), [exercise.id])
  if (!sets) return null
  if (sets.length === 0) return <p className="muted">No sets logged yet.</p>

  const today = nutritionDay(Date.now())
  const value = (s: WorkoutSet) => e1rm(s.weight, s.reps, exercise.formula)

  // One entry per session (workout), in time order.
  const sessions: { workoutId: number; day: string; sets: WorkoutSet[]; best: WorkoutSet }[] = []
  for (const s of sets) {
    let session = sessions.find((x) => x.workoutId === s.workoutId)
    if (!session) {
      session = { workoutId: s.workoutId, day: nutritionDay(s.loggedAt), sets: [], best: s }
      sessions.push(session)
    }
    session.sets.push(s)
    if (value(s) > value(session.best)) session.best = s
  }
  // Best e1RM ever; its first occurrence is the PR date.
  const best = sets.reduce((a, b) => (value(b) > value(a) ? b : a))
  const unit = weightUnit(exercise)

  return (
    <>
      <section className="card">
        <h2>Best e1RM</h2>
        <p className="big-number">
          {fmtE1rm(value(best), best.reps)} <span className="muted small">{unit}</span>
        </p>
        <p className="muted small">
          {fmtNum(best.weight)} {unit} × {best.reps} · {dayLabel(nutritionDay(best.loggedAt), today)}
        </p>
      </section>

      <section className="card">
        <h2>Best e1RM per session</h2>
        <LineChart
          label="Best e1RM per session"
          points={sessions.map((s) => ({ day: s.day, value: value(s.best) }))}
          format={(v) => fmtNum(v)}
        />
      </section>

      <section className="card">
        <h2>Recent sessions</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sets</th>
              <th>e1RM</th>
            </tr>
          </thead>
          <tbody>
            {[...sessions]
              .reverse()
              .slice(0, 10)
              .map((s) => (
                <tr key={s.workoutId}>
                  <td>{dayLabel(s.day, today)}</td>
                  <td>{s.sets.map((x) => `${fmtNum(x.weight)}×${x.reps}`).join(', ')}</td>
                  <td>{fmtE1rm(value(s.best), s.best.reps)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

function RunProgress() {
  const runs = useLiveQuery(() => db.runs.orderBy('loggedAt').toArray())
  if (!runs) return null
  if (runs.length === 0) return <p className="muted">No runs logged yet.</p>

  const today = nutritionDay(Date.now())
  const pace = (r: (typeof runs)[number]) => paceSecPerKm(r.distanceKm, r.durationSec)
  const longest = runs.reduce((a, b) => (b.distanceKm > a.distanceKm ? b : a))
  const qualifying = runs.filter((r) => r.distanceKm >= PACE_PR_MIN_KM)
  const fastest = qualifying.length ? qualifying.reduce((a, b) => (pace(b) < pace(a) ? b : a)) : null

  return (
    <>
      <section className="card">
        <h2>Bests</h2>
        <p>
          Longest: <strong>{fmtNum(longest.distanceKm)} km</strong>{' '}
          <span className="muted small">· {dayLabel(nutritionDay(longest.loggedAt), today)}</span>
        </p>
        <p>
          Best pace (runs of {PACE_PR_MIN_KM} km+):{' '}
          {fastest ? (
            <>
              <strong>{fmtPace(pace(fastest))} /km</strong>{' '}
              <span className="muted small">· {dayLabel(nutritionDay(fastest.loggedAt), today)}</span>
            </>
          ) : (
            <span className="muted">none yet</span>
          )}
        </p>
      </section>

      <section className="card">
        <h2>Distance (km)</h2>
        <LineChart
          label="Distance per run"
          points={runs.map((r) => ({ day: nutritionDay(r.loggedAt), value: r.distanceKm }))}
          format={(v) => fmtNum(v)}
        />
      </section>

      <section className="card">
        <h2>Pace (min/km)</h2>
        <LineChart
          label="Pace per run"
          points={runs.filter((r) => r.distanceKm > 0).map((r) => ({ day: nutritionDay(r.loggedAt), value: pace(r) }))}
          format={fmtPace}
        />
      </section>

      <section className="card">
        <h2>Recent runs</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Run</th>
              <th>Pace</th>
            </tr>
          </thead>
          <tbody>
            {[...runs]
              .reverse()
              .slice(0, 10)
              .map((r) => (
                <tr key={r.id}>
                  <td>{dayLabel(nutritionDay(r.loggedAt), today)}</td>
                  <td>
                    {fmtNum(r.distanceKm)} km · {fmtDuration(r.durationSec)} · {fmtNum(r.incline)}% ·{' '}
                    {fmtNum(speedKmh(r.distanceKm, r.durationSec))} km/h
                  </td>
                  <td>{fmtPace(pace(r))}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
