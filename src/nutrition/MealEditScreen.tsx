import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router'
import { db, type Food, type MealItem, type SavedMeal } from '../db/db'
import { describeItem } from '../lib/conversions'
import { clockTime, nutritionDay, timestampFor } from '../lib/nutritionDay'
import { itemsTotals } from '../lib/totals'
import { updateMeal, useFoodsById, useMealsOfDay } from './data'
import FoodSearch from './FoodSearch'
import MacroLine from './MacroLine'
import QuantitySheet from './QuantitySheet'
import SavedMealSheet from './SavedMealSheet'

type SheetState =
  | { kind: 'edit'; index: number }
  | { kind: 'addFood'; food: Food }
  | { kind: 'addSaved'; meal: SavedMeal }
  | null

export default function MealEditScreen() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const meal = useLiveQuery(async () => (await db.meals.get(id)) ?? null, [id])
  const dayMeals = useMealsOfDay(meal?.day ?? '')
  const foods = useFoodsById()
  const [sheet, setSheet] = useState<SheetState>(null)
  const [adding, setAdding] = useState(false)

  if (meal === null) {
    return (
      <div className="screen">
        <p className="muted">This meal no longer exists.</p>
        <button className="btn" onClick={() => navigate('/n/today')}>
          Back to Today
        </button>
      </div>
    )
  }
  if (meal === undefined || !foods || !dayMeals) return null
  const number = dayMeals.findIndex((m) => m.id === id) + 1
  const back = () => navigate(`/n/today?day=${meal.day}`)

  const setItems = (items: MealItem[]) => updateMeal(id, { items })

  async function removeItem(index: number) {
    if (!meal) return
    if (meal.items.length === 1) {
      if (!window.confirm('This is the last item. Delete the whole meal?')) return
      await db.meals.delete(id)
      back()
      return
    }
    await setItems(meal.items.filter((_, i) => i !== index))
  }

  async function deleteMeal() {
    if (!window.confirm('Delete this meal?')) return
    await db.meals.delete(id)
    back()
  }

  const editing = sheet?.kind === 'edit' ? meal.items[sheet.index] : undefined
  const editingFood = editing ? foods.get(editing.foodId) : undefined

  return (
    <div className="screen">
      <div className="card-head">
        <button className="btn" onClick={back}>
          ‹ Back
        </button>
        <h1>Meal {number}</h1>
      </div>

      <section className="card">
        <label className="field">
          <span className="field-label">Date</span>
          <input
            type="date"
            value={meal.day}
            max={nutritionDay(Date.now())}
            onChange={(e) => e.target.value && updateMeal(id, { time: timestampFor(e.target.value, clockTime(meal.time)) })}
          />
        </label>
        <label className="field">
          <span className="field-label">Time</span>
          <input
            type="time"
            value={clockTime(meal.time)}
            onChange={(e) => e.target.value && updateMeal(id, { time: timestampFor(meal.day, e.target.value) })}
          />
        </label>
      </section>

      <section className="card">
        <h2>Items</h2>
        <ul className="item-list">
          {meal.items.map((it, i) => {
            const f = foods.get(it.foodId)
            return (
              <li key={i}>
                <button className="item-main" onClick={() => setSheet({ kind: 'edit', index: i })}>
                  <span>{f ? describeItem(it, f) : 'Unknown food'}</span>
                  {f && <MacroLine t={itemsTotals([it], foods)} />}
                </button>
                <button className="icon-btn" aria-label="Remove item" onClick={() => removeItem(i)}>
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
        <p className="preview">
          Total: <MacroLine t={itemsTotals(meal.items, foods)} />
        </p>
        {adding ? (
          <FoodSearch
            autoFocus
            onPickFood={(food) => setSheet({ kind: 'addFood', food })}
            onPickSaved={(m) => setSheet({ kind: 'addSaved', meal: m })}
          />
        ) : (
          <button className="btn block" onClick={() => setAdding(true)}>
            + Add item
          </button>
        )}
      </section>

      <button className="btn block" onClick={deleteMeal}>
        Delete meal
      </button>

      {sheet?.kind === 'edit' && editing && editingFood && (
        <QuantitySheet
          food={editingFood}
          initial={editing}
          confirmLabel="Save"
          onClose={() => setSheet(null)}
          onConfirm={(item) => {
            setItems(meal.items.map((it, i) => (i === sheet.index ? item : it)))
            setSheet(null)
          }}
        />
      )}
      {sheet?.kind === 'addFood' && (
        <QuantitySheet
          food={sheet.food}
          confirmLabel="Add to meal"
          onClose={() => setSheet(null)}
          onConfirm={(item) => {
            setItems([...meal.items, item])
            setSheet(null)
            setAdding(false)
          }}
        />
      )}
      {sheet?.kind === 'addSaved' && (
        <SavedMealSheet
          meal={sheet.meal}
          foods={foods}
          onClose={() => setSheet(null)}
          onConfirm={(items) => {
            setItems([...meal.items, ...items])
            setSheet(null)
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}
