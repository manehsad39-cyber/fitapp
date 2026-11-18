import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Food, type SavedMeal } from '../db/db'
import { frequentFoodIds, recentFoodIds, searchByName } from '../lib/search'
import { fmtInt } from '../lib/format'
import { useFoods, useSavedMeals } from './data'

interface Props {
  onPickFood: (food: Food) => void
  /** Omit to search foods only. */
  onPickSaved?: (meal: SavedMeal) => void
  autoFocus?: boolean
}

/** Search box over foods (and saved meals). Empty search shows recent and frequent foods. */
export default function FoodSearch({ onPickFood, onPickSaved, autoFocus }: Props) {
  const [query, setQuery] = useState('')
  const foods = useFoods()
  const saved = useSavedMeals()
  const recentMeals = useLiveQuery(() => db.meals.orderBy('time').reverse().limit(300).toArray())

  const active = useMemo(() => (foods ?? []).filter((f) => !f.archived), [foods])
  const byId = useMemo(() => new Map(active.map((f) => [f.id, f])), [active])

  const pick = (ids: number[]) => ids.map((id) => byId.get(id)).filter((f): f is Food => !!f)
  const recent = pick(recentFoodIds(recentMeals ?? [], 8))
  const frequent = pick(frequentFoodIds(recentMeals ?? [], 8))

  const q = query.trim()
  const foodHits = q ? searchByName(active, q) : []
  const savedHits = q && onPickSaved ? searchByName(saved ?? [], q) : []

  return (
    <div className="food-search">
      <input
        type="search"
        className="search-input"
        placeholder="Search foods and meals"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
        aria-label="Search"
      />
      {q ? (
        <ul className="result-list">
          {savedHits.map((m) => (
            <li key={`m${m.id}`}>
              <button onClick={() => onPickSaved?.(m)}>
                <span>{m.name}</span>
                <span className="tag">saved meal</span>
              </button>
            </li>
          ))}
          {foodHits.map((f) => (
            <FoodRow key={f.id} food={f} onPick={onPickFood} />
          ))}
          {savedHits.length + foodHits.length === 0 && <li className="muted empty">No match for “{q}”.</li>}
        </ul>
      ) : (
        <>
          {recent.length > 0 && (
            <>
              <h3 className="list-title">Recent</h3>
              <ul className="result-list">
                {recent.map((f) => (
                  <FoodRow key={f.id} food={f} onPick={onPickFood} />
                ))}
              </ul>
            </>
          )}
          {frequent.length > 0 && (
            <>
              <h3 className="list-title">Frequent</h3>
              <ul className="result-list">
                {frequent.map((f) => (
                  <FoodRow key={f.id} food={f} onPick={onPickFood} />
                ))}
              </ul>
            </>
          )}
          {recent.length === 0 && <p className="muted">Type to search. Recent and frequent foods appear here once you log meals.</p>}
        </>
      )}
    </div>
  )
}

function FoodRow({ food, onPick }: { food: Food; onPick: (f: Food) => void }) {
  return (
    <li>
      <button onClick={() => onPick(food)}>
        <span>{food.name}</span>
        <span className="muted small">{fmtInt(food.per100.kcal)} kcal/100 g</span>
      </button>
    </li>
  )
}
