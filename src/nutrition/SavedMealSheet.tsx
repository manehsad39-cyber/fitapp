import { useState } from 'react'
import { foodLabel } from '../lib/foodEmoji'
import type { MealItem, SavedMeal } from '../db/db'
import { parseNum } from '../lib/format'
import { itemsTotals, type FoodsById } from '../lib/totals'
import Sheet from '../shell/Sheet'
import NumInput from '../shell/NumInput'
import MacroLine from './MacroLine'

const foodLabelOf = (name?: string) => (name ? foodLabel(name) : 'Unknown food')

/** Turns a saved meal into basket items, scaled by a multiplier. */
export function savedMealItems(meal: SavedMeal, multiplier: number): MealItem[] {
  return meal.items.map((it) => ({
    foodId: it.foodId,
    rawGrams: it.grams * multiplier,
    inputQty: Math.round(it.grams * multiplier * 10) / 10,
    inputUnit: 'g',
    inputState: 'raw',
  }))
}

interface Props {
  meal: SavedMeal
  foods: FoodsById
  onConfirm: (items: MealItem[]) => void
  onClose: () => void
}

export default function SavedMealSheet({ meal, foods, onConfirm, onClose }: Props) {
  const [mult, setMult] = useState('1')
  const m = parseNum(mult)
  const items = m !== null && m > 0 ? savedMealItems(meal, m) : null

  return (
    <Sheet title={`🍱 ${meal.name}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (items) onConfirm(items)
        }}
      >
        <div className="qty-row">
          <span className="field-label">Multiplier</span>
          <NumInput value={mult} onChange={setMult} autoFocus aria-label="Multiplier" className="qty-input" />
          <span className="unit">×</span>
        </div>
        <ul className="plain-list small">
          {meal.items.map((it, i) => (
            <li key={i}>
              {foodLabelOf(foods.get(it.foodId)?.name)}: {Math.round(it.grams * (m ?? 0))} g
            </li>
          ))}
        </ul>
        <p className="preview">{items ? <MacroLine t={itemsTotals(items, foods)} /> : <span className="muted">Enter a multiplier</span>}</p>
        <button className="btn primary block" type="submit" disabled={!items}>
          Add to meal
        </button>
      </form>
    </Sheet>
  )
}
