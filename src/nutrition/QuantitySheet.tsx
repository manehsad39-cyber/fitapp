import { useState } from 'react'
import type { Food, MealItem } from '../db/db'
import { toMealItem } from '../lib/conversions'
import { parseNum } from '../lib/format'
import { itemTotals } from '../lib/totals'
import Sheet from '../shell/Sheet'
import NumInput from '../shell/NumInput'
import MacroLine from './MacroLine'

interface Props {
  food: Food
  /** Existing item when editing. */
  initial?: MealItem
  confirmLabel: string
  onConfirm: (item: MealItem) => void
  onClose: () => void
}

/** Quantity input with g/pieces and raw/cooked toggles and a live preview. */
export default function QuantitySheet({ food, initial, confirmLabel, onConfirm, onClose }: Props) {
  const [qty, setQty] = useState(initial ? String(initial.inputQty) : '')
  const [unit, setUnit] = useState<'g' | 'pieces'>(initial?.inputUnit ?? (food.pieceWeight ? 'pieces' : 'g'))
  const [state, setState] = useState<'raw' | 'cooked'>(initial?.inputState ?? 'raw')

  const n = parseNum(qty)
  const item = n !== null && n > 0 ? toMealItem(food, { qty: n, unit, state }) : null
  const rawLabel = food.baseState === 'dry' ? 'dry' : 'raw'

  return (
    <Sheet title={food.name} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (item) onConfirm(item)
        }}
      >
        <div className="qty-row">
          <NumInput value={qty} onChange={setQty} autoFocus placeholder="0" aria-label="Quantity" className="qty-input" />
          {food.pieceWeight ? (
            <div className="seg">
              <button type="button" className={unit === 'pieces' ? 'active' : ''} onClick={() => setUnit('pieces')}>
                pieces
              </button>
              <button type="button" className={unit === 'g' ? 'active' : ''} onClick={() => setUnit('g')}>
                g
              </button>
            </div>
          ) : (
            <span className="unit">g</span>
          )}
        </div>
        {food.cookedRatio ? (
          <div className="seg wide">
            <button type="button" className={state === 'raw' ? 'active' : ''} onClick={() => setState('raw')}>
              {rawLabel}
            </button>
            <button type="button" className={state === 'cooked' ? 'active' : ''} onClick={() => setState('cooked')}>
              cooked
            </button>
          </div>
        ) : null}
        <p className="preview">
          {item ? (
            <>
              <MacroLine t={itemTotals(food, item.rawGrams)} />
              <br />
              <span className="muted">= {Math.round(item.rawGrams)} g {food.baseState === 'as is' ? '' : rawLabel}</span>
            </>
          ) : (
            <span className="muted">Enter a quantity</span>
          )}
        </p>
        <button className="btn primary block" type="submit" disabled={!item}>
          {confirmLabel}
        </button>
      </form>
    </Sheet>
  )
}
