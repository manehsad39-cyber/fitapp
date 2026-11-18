import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { db, type SavedMeal } from '../db/db'
import { fmtInt } from '../lib/format'
import { searchByName } from '../lib/search'
import { itemsTotals } from '../lib/totals'
import { useFoods, useFoodsById, useSavedMeals } from './data'
import { savedMealItems } from './SavedMealSheet'

export default function FoodsScreen() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'meals' ? 'meals' : 'foods'

  return (
    <div className="screen">
      <div className="seg wide">
        <button className={tab === 'foods' ? 'active' : ''} onClick={() => setParams({}, { replace: true })}>
          Foods
        </button>
        <button className={tab === 'meals' ? 'active' : ''} onClick={() => setParams({ tab: 'meals' }, { replace: true })}>
          Saved meals
        </button>
      </div>
      {tab === 'foods' ? <FoodList /> : <SavedMealList />}
    </div>
  )
}

function FoodList() {
  const foods = useFoods()
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  if (!foods) return null

  const visible = foods.filter((f) => f.archived === showArchived)
  const list = query.trim() ? searchByName(visible, query) : [...visible].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <div className="row">
        <input
          type="search"
          className="search-input grow"
          placeholder="Filter foods"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter foods"
        />
        <Link className="btn primary" to="/n/foods/food/new">
          + New
        </Link>
      </div>
      <label className="field">
        <span className="field-label">Show archived foods</span>
        <input type="checkbox" className="toggle" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
      </label>
      <ul className="result-list">
        {list.map((f) => (
          <li key={f.id}>
            <Link to={`/n/foods/food/${f.id}`}>
              <span>
                {f.name}
                {!f.builtin && <span className="tag">custom</span>}
              </span>
              <span className="muted small">{fmtInt(f.per100.kcal)} kcal/100 g</span>
            </Link>
          </li>
        ))}
        {list.length === 0 && <li className="muted empty">No foods.</li>}
      </ul>
    </>
  )
}

function SavedMealList() {
  const meals = useSavedMeals()
  const foods = useFoodsById()
  const navigate = useNavigate()
  if (!meals || !foods) return null

  async function create() {
    const name = window.prompt('Name for the new saved meal:')?.trim()
    if (!name) return
    const id = await db.savedMeals.add({ name, items: [] } as unknown as SavedMeal)
    navigate(`/n/foods/saved/${id}`)
  }

  return (
    <>
      <button className="btn primary block" onClick={create}>
        + New saved meal
      </button>
      <ul className="result-list">
        {meals.map((m) => (
          <li key={m.id}>
            <Link to={`/n/foods/saved/${m.id}`}>
              <span>{m.name}</span>
              <span className="muted small">
                {m.items.length} items · {fmtInt(itemsTotals(savedMealItems(m, 1), foods).kcal)} kcal
              </span>
            </Link>
          </li>
        ))}
        {meals.length === 0 && <li className="muted empty">No saved meals. Build a meal in Add, then tap “Save as meal”.</li>}
      </ul>
    </>
  )
}
