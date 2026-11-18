import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Food, type SavedMeal } from '../db/db'
import { parseNum } from '../lib/format'
import { itemsTotals } from '../lib/totals'
import NumInput from '../shell/NumInput'
import { useFoodsById } from './data'
import FoodSearch from './FoodSearch'
import MacroLine from './MacroLine'
import QuantitySheet from './QuantitySheet'
import { savedMealItems } from './SavedMealSheet'

export default function SavedMealEditScreen() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const meal = useLiveQuery(async () => (await db.savedMeals.get(id)) ?? null, [id])
  const foods = useFoodsById()
  const [adding, setAdding] = useState(false)
  const [picked, setPicked] = useState<Food | null>(null)
  const back = () => navigate('/n/foods?tab=meals')

  if (meal === null) {
    return (
      <div className="screen">
        <p className="muted">This saved meal no longer exists.</p>
        <button className="btn" onClick={back}>
          Back to Saved meals
        </button>
      </div>
    )
  }
  if (!meal || !foods) return null

  const setItems = (items: SavedMeal['items']) => db.savedMeals.update(id, { items })

  async function rename() {
    const name = window.prompt('New name:', meal?.name)?.trim()
    if (name) await db.savedMeals.update(id, { name })
  }

  async function remove() {
    if (!window.confirm(`Delete saved meal “${meal?.name}”?`)) return
    await db.savedMeals.delete(id)
    back()
  }

  return (
    <div className="screen">
      <div className="card-head">
        <button className="btn" onClick={back}>
          ‹ Back
        </button>
        <h1>{meal.name}</h1>
      </div>

      <section className="card">
        <h2>Items</h2>
        <p className="muted small">Grams in each food’s base state (raw, dry or as is).</p>
        <ul className="item-list">
          {meal.items.map((it, i) => (
            <li key={`${i}-${it.foodId}-${it.grams}`}>
              <span className="item-main">{foods.get(it.foodId)?.name ?? 'Unknown food'}</span>
              <GramsInput
                grams={it.grams}
                onCommit={(g) => setItems(meal.items.map((x, j) => (j === i ? { ...x, grams: g } : x)))}
              />
              <button className="icon-btn" aria-label="Remove item" onClick={() => setItems(meal.items.filter((_, j) => j !== i))}>
                ✕
              </button>
            </li>
          ))}
          {meal.items.length === 0 && <li className="muted empty">No items yet.</li>}
        </ul>
        <p className="preview">
          Total: <MacroLine t={itemsTotals(savedMealItems(meal, 1), foods)} />
        </p>
        {adding ? (
          <FoodSearch autoFocus onPickFood={setPicked} />
        ) : (
          <button className="btn block" onClick={() => setAdding(true)}>
            + Add item
          </button>
        )}
      </section>

      <div className="row">
        <button className="btn grow" onClick={rename}>
          Rename
        </button>
        <button className="btn grow" onClick={remove}>
          Delete
        </button>
      </div>

      {picked && (
        <QuantitySheet
          food={picked}
          confirmLabel="Add"
          onClose={() => setPicked(null)}
          onConfirm={(item) => {
            setItems([...meal.items, { foodId: item.foodId, grams: item.rawGrams }])
            setPicked(null)
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}

function GramsInput({ grams, onCommit }: { grams: number; onCommit: (g: number) => void }) {
  const [text, setText] = useState(String(Math.round(grams * 10) / 10))
  return (
    <span className="field-input">
      <NumInput
        value={text}
        onChange={setText}
        aria-label="Grams"
        onBlur={() => {
          const n = parseNum(text)
          if (n !== null && n > 0) onCommit(n)
          else setText(String(Math.round(grams * 10) / 10))
        }}
      />
      <span className="unit">g</span>
    </span>
  )
}
