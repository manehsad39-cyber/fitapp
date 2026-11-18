import { describe, expect, it } from 'vitest'
import { itemTotals, mealsTotals, periodSummary, type FoodsById } from './totals'
import type { Food, Meal } from '../db/db'

const full = Object.fromEntries(
  ['fiber', 'zinc', 'magnesium', 'iron', 'potassium', 'calcium', 'vitaminB12', 'vitaminD', 'omega3', 'selenium', 'sodium'].map(
    (k) => [k, 10],
  ),
)

const egg: Food = {
  id: 1,
  name: 'Egg',
  builtin: true,
  baseState: 'raw',
  per100: { kcal: 140, protein: 12, carbs: 1, fat: 10, micros: full },
  archived: false,
}
const custom: Food = { ...egg, id: 2, name: 'Bar', per100: { kcal: 400, protein: 20, carbs: 50, fat: 10, micros: {} } }
const foods: FoodsById = new Map([
  [1, egg],
  [2, custom],
])

const meal = (id: number, day: string, items: [number, number][]): Meal => ({
  id,
  day,
  time: 0,
  items: items.map(([foodId, rawGrams]) => ({ foodId, rawGrams, inputQty: rawGrams, inputUnit: 'g', inputState: 'raw' })),
})

describe('totals', () => {
  it('scales per-100 g values', () => {
    const t = itemTotals(egg, 50)
    expect(t.kcal).toBe(70)
    expect(t.protein).toBe(6)
    expect(t.micros.zinc).toBe(5)
    expect(t.missingMicros).toBe(false)
  })

  it('flags missing micro data', () => {
    expect(itemTotals(custom, 100).missingMicros).toBe(true)
  })

  it('sums a day of meals', () => {
    const t = mealsTotals([meal(1, 'd', [[1, 100]]), meal(2, 'd', [[1, 100], [2, 50]])], foods)
    expect(t.kcal).toBe(140 + 140 + 200)
    expect(t.fat).toBe(25)
    expect(t.micros.iron).toBe(20)
    expect(t.missingMicros).toBe(true)
  })
})

describe('periodSummary', () => {
  const days = ['2026-11-16', '2026-11-17', '2026-11-18']
  const meals = [meal(1, '2026-11-16', [[1, 1000]]), meal(2, '2026-11-18', [[1, 2000]]), meal(3, '2026-11-18', [[1, 1000]])]

  it('averages only over logged days', () => {
    const s = periodSummary(days, meals, foods)
    expect(s.loggedDays).toBe(2)
    expect(s.totalDays).toBe(3)
    expect(s.perDay.map((d) => d.totals.kcal)).toEqual([1400, 0, 4200])
    expect(s.average.kcal).toBe(2800)
    expect(s.average.micros.zinc).toBe(200)
  })

  it('returns zeros when nothing is logged', () => {
    const s = periodSummary(days, [], foods)
    expect(s.loggedDays).toBe(0)
    expect(s.average.kcal).toBe(0)
  })
})
