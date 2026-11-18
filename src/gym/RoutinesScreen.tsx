import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate } from 'react-router'
import { db, type Routine } from '../db/db'
import { useExercisesById } from './data'

export default function RoutinesScreen() {
  const routines = useLiveQuery(() => db.routines.orderBy('name').toArray())
  const exercises = useExercisesById()
  const navigate = useNavigate()
  if (!routines || !exercises) return null

  async function create() {
    const name = window.prompt('Routine name (e.g. Push day):')?.trim()
    if (!name) return
    const id = await db.routines.add({ name, exerciseIds: [] } as unknown as Routine)
    navigate(`/g/routines/${id}`)
  }

  return (
    <div className="screen">
      <h1>Routines</h1>
      <button className="btn primary block" onClick={create}>
        + New routine
      </button>
      <ul className="result-list">
        {routines.map((r) => (
          <li key={r.id}>
            <Link to={`/g/routines/${r.id}`}>
              <span>{r.name}</span>
              <span className="muted small">
                {r.exerciseIds
                  .map((id) => exercises.get(id)?.name)
                  .filter(Boolean)
                  .join(', ') || 'no exercises'}
              </span>
            </Link>
          </li>
        ))}
        {routines.length === 0 && <li className="muted empty">No routines yet.</li>}
      </ul>
    </div>
  )
}
