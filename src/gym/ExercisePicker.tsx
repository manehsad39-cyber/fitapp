import { useState } from 'react'
import type { Exercise } from '../db/db'
import { searchByName } from '../lib/search'
import Sheet from '../shell/Sheet'
import { exerciseTypeLabel, useExercises } from './data'

/** Sheet with a search over non-archived exercises. */
export default function ExercisePicker({
  exclude,
  onPick,
  onClose,
}: {
  exclude: number[]
  onPick: (e: Exercise) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const exercises = useExercises()
  const list = (exercises ?? []).filter((e) => !e.archived && !exclude.includes(e.id))
  const shown = query.trim() ? searchByName(list, query) : [...list].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Sheet title="Add exercise" onClose={onClose}>
      <input
        type="search"
        className="search-input"
        placeholder="Search exercises"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        aria-label="Search exercises"
      />
      <ul className="result-list">
        {shown.map((e) => (
          <li key={e.id}>
            <button onClick={() => onPick(e)}>
              <span>{e.name}</span>
              <span className="muted small">{exerciseTypeLabel(e)}</span>
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="muted empty">No exercise found. Create one in Exercises.</li>}
      </ul>
    </Sheet>
  )
}
