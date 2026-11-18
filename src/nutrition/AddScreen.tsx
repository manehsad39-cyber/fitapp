import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { db, type Food, type SavedMeal } from '../db/db'
import { describeItem } from '../lib/conversions'
import { clockTime, nutritionDay, timestampFor } from '../lib/nutritionDay'
import { itemsTotals } from '../lib/totals'
import { basket, useBasket } from './basket'
import { logMeal, useFoodsById } from './data'
import FoodSearch from './FoodSearch'
import MacroLine from './MacroLine'
import QuantitySheet from './QuantitySheet'
import SavedMealSheet from './SavedMealSheet'

type SheetState = { kind: 'food'; food: Food } | { kind: 'saved'; meal: SavedMeal } | { kind: 'edit'; index: number } | null

export default function AddScreen() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const today = nutritionDay(Date.now())
  const [day, setDay] = useState(params.get('day') ?? today)
  const [time, setTime] = useState(clockTime(Date.now()))
  const [sheet, setSheet] = useState<SheetState>(null)
  const [message, setMessage] = useState('')
  const items = useBasket()
  const foods = useFoodsById()

  if (!foods) return null

  async function onLog() {
    await logMeal(timestampFor(day, time), items)
    basket.clear()
    navigate(day === today ? '/n/today' : `/n/today?day=${day}`)
  }

  async function onSaveAsMeal() {
    const name = window.prompt('Name for this saved meal (e.g. lunch_1):')?.trim()
    if (!name) return
    await db.savedMeals.add({ name, items: items.map((i) => ({ foodId: i.foodId, grams: i.rawGrams })) } as SavedMeal)
    setMessage(`Saved as “${name}”.`)
  }

  const editing = sheet?.kind === 'edit' ? items[sheet.index] : undefined
  const editingFood = editing ? foods.get(editing.foodId) : undefined

  return (
    <div className="screen">
      {items.length > 0 && (
        <section className="card basket">
          <h2>Current meal</h2>
          <ul className="item-list">
            {items.map((it, i) => {
              const f = foods.get(it.foodId)
              return (
                <li key={i}>
                  <button className="item-main" onClick={() => setSheet({ kind: 'edit', index: i })}>
                    <span>{f ? describeItem(it, f) : 'Unknown food'}</span>
                    <MacroLine t={itemsTotals([it], foods)} />
                  </button>
                  <button className="icon-btn" aria-label="Remove item" onClick={() => basket.remove(i)}>
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="preview">
            Total: <MacroLine t={itemsTotals(items, foods)} />
          </p>
          <div className="row">
            <input type="date" value={day} max={today} onChange={(e) => e.target.value && setDay(e.target.value)} aria-label="Date" />
            <input type="time" value={time} onChange={(e) => e.target.value && setTime(e.target.value)} aria-label="Time" />
          </div>
          <div className="row">
            <button className="btn primary grow" onClick={onLog}>
              Log meal
            </button>
            <button className="btn" onClick={onSaveAsMeal}>
              Save as meal
            </button>
            <button
              className="btn"
              onClick={() => window.confirm('Remove all items from the current meal?') && basket.clear()}
            >
              Clear
            </button>
          </div>
          {message && <p className="message">{message}</p>}
        </section>
      )}

      <FoodSearch
        autoFocus
        onPickFood={(food) => setSheet({ kind: 'food', food })}
        onPickSaved={(meal) => setSheet({ kind: 'saved', meal })}
      />

      {sheet?.kind === 'food' && (
        <QuantitySheet
          food={sheet.food}
          confirmLabel="Add to meal"
          onClose={() => setSheet(null)}
          onConfirm={(item) => {
            basket.add([item])
            setSheet(null)
            setMessage('')
          }}
        />
      )}
      {sheet?.kind === 'saved' && (
        <SavedMealSheet
          meal={sheet.meal}
          foods={foods}
          onClose={() => setSheet(null)}
          onConfirm={(newItems) => {
            basket.add(newItems)
            setSheet(null)
            setMessage('')
          }}
        />
      )}
      {sheet?.kind === 'edit' && editing && editingFood && (
        <QuantitySheet
          food={editingFood}
          initial={editing}
          confirmLabel="Save"
          onClose={() => setSheet(null)}
          onConfirm={(item) => {
            basket.replace(sheet.index, item)
            setSheet(null)
          }}
        />
      )}
    </div>
  )
}
