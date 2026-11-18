import { useState } from 'react'
import { Link } from 'react-router'
import { searchByName } from '../lib/search'
import { exerciseTypeLabel, useExercises } from './data'

export default function ExercisesScreen() {
  const exercises = useExercises()
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  if (!exercises) return null

  const visible = exercises.filter((e) => e.archived === showArchived)
  const list = query.trim() ? searchByName(visible, query) : [...visible].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="screen">
      <h1>Exercises</h1>
      <div className="row">
        <input
          type="search"
          className="search-input grow"
          placeholder="Filter exercises"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter exercises"
        />
        <Link className="btn primary" to="/g/exercises/edit/new">
          + New
        </Link>
      </div>
      <label className="field">
        <span className="field-label">Show archived exercises</span>
        <input type="checkbox" className="toggle" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
      </label>
      <ul className="result-list">
        {list.map((e) => (
          <li key={e.id}>
            <Link to={`/g/exercises/${e.id}`}>
              <span>{e.name}</span>
              <span className="muted small">{exerciseTypeLabel(e)}</span>
            </Link>
          </li>
        ))}
        {list.length === 0 && <li className="muted empty">No exercises.</li>}
      </ul>
    </div>
  )
}
