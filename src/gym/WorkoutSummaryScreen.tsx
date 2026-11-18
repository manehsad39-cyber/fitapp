import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router'
import { db } from '../db/db'
import { e1rm, fmtE1rm } from '../lib/e1rm'
import { fmtNum } from '../lib/format'
import { dayLabel, nutritionDay } from '../lib/nutritionDay'
import { fmtDuration, fmtPace, paceSecPerKm } from '../lib/run'
import Badge from './Badge'
import { runsOfWorkout, setsOfWorkout, useAllRunBadges, useAllSetBadges, useExercisesById, weightUnit } from './data'
import { sessionExerciseIds, SessionExercises } from './WorkoutSessions'

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** Workout summary: exercises, number of sets, PRs achieved. Shown after Finish and from History. */
export default function WorkoutSummaryScreen() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const data = useLiveQuery(async () => {
    const workout = await db.workouts.get(id)
    if (!workout) return null
    return { workout, sets: await setsOfWorkout(id), runs: await runsOfWorkout(id) }
  }, [id])
  const exercises = useExercisesById()
  const setBadges = useAllSetBadges()
  const runBadges = useAllRunBadges()

  if (data === null) {
    return (
      <div className="screen">
        <p className="muted">This workout no longer exists.</p>
        <button className="btn" onClick={() => navigate('/g/history')}>
          Back to History
        </button>
      </div>
    )
  }
  if (!data || !exercises || !setBadges || !runBadges) return null

  const w = data.workout
  const exCount = sessionExerciseIds(data).filter((i) => {
    const ex = exercises.get(i)
    return ex && (ex.type === 'cardio' ? data.runs.length > 0 : data.sets.some((s) => s.exerciseId === i))
  }).length
  const prSets = data.sets.filter((s) => setBadges.get(s.id) === 'pr')
  const prRuns = data.runs.filter((r) => runBadges.get(r.id)?.some((b) => b !== 'baseline'))

  return (
    <div className="screen">
      <div className="card-head">
        <button className="btn" onClick={() => navigate('/g/history')}>
          ‹ History
        </button>
        <h1>{dayLabel(nutritionDay(w.startedAt), nutritionDay(Date.now()))}</h1>
      </div>

      <section className="card">
        <h2>Summary</h2>
        <p>
          {plural(exCount, 'exercise')} · {plural(data.sets.length, 'set')}
          {data.runs.length > 0 && ` · ${plural(data.runs.length, 'run')}`}
          {w.finishedAt && ` · ${fmtDuration((w.finishedAt - w.startedAt) / 1000)}`}
        </p>
        {prSets.length + prRuns.length === 0 ? (
          <p className="muted">No PRs in this workout.</p>
        ) : (
          <ul className="plain-list">
            {prSets.map((s) => {
              const ex = exercises.get(s.exerciseId)
              if (!ex) return null
              return (
                <li key={s.id} className="badge-line">
                  <Badge kind="pr" loggedAt={s.loggedAt} />
                  <span>
                    {ex.name}: {fmtNum(s.weight)} {weightUnit(ex)} × {s.reps} (e1RM {fmtE1rm(e1rm(s.weight, s.reps, ex.formula), s.reps)})
                  </span>
                </li>
              )
            })}
            {prRuns.map((r) =>
              runBadges
                .get(r.id)!
                .filter((b) => b !== 'baseline')
                .map((b) => (
                  <li key={`${r.id}${b}`} className="badge-line">
                    <Badge kind={b} />
                    <span>
                      {b === 'distance' ? `${fmtNum(r.distanceKm)} km` : `${fmtPace(paceSecPerKm(r.distanceKm, r.durationSec))} /km`}
                    </span>
                  </li>
                )),
            )}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Sets</h2>
        <SessionExercises data={data} exercises={exercises} setBadges={setBadges} runBadges={runBadges} />
      </section>
    </div>
  )
}
