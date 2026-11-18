import type { Food, Meal, MealItem } from '../db/db'
import { MICRO_KEYS, type MicroKey } from './micros'

export interface Totals {
  kcal: number
  protein: number
  carbs: number
  fat: number
  micros: Record<MicroKey, number>
  /** true when at least one item's food has no value for some micro */
  missingMicros: boolean
}

export type FoodsById = Map<number, Food>

export function emptyTotals(): Totals {
  return {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    micros: Object.fromEntries(MICRO_KEYS.map((k) => [k, 0])) as Record<MicroKey, number>,
    missingMicros: false,
  }
}

export function itemTotals(food: Food, rawGrams: number): Totals {
  const f = rawGrams / 100
  const t = emptyTotals()
  t.kcal = food.per100.kcal * f
  t.protein = food.per100.protein * f
  t.carbs = food.per100.carbs * f
  t.fat = food.per100.fat * f
  for (const k of MICRO_KEYS) {
    const v = food.per100.micros[k]
    if (v === undefined || v === null) t.missingMicros = true
    else t.micros[k] = v * f
  }
  return t
}

export function addTotals(a: Totals, b: Totals): Totals {
  const t = emptyTotals()
  t.kcal = a.kcal + b.kcal
  t.protein = a.protein + b.protein
  t.carbs = a.carbs + b.carbs
  t.fat = a.fat + b.fat
  for (const k of MICRO_KEYS) t.micros[k] = a.micros[k] + b.micros[k]
  t.missingMicros = a.missingMicros || b.missingMicros
  return t
}

export function scaleTotals(a: Totals, factor: number): Totals {
  const t = emptyTotals()
  t.kcal = a.kcal * factor
  t.protein = a.protein * factor
  t.carbs = a.carbs * factor
  t.fat = a.fat * factor
  for (const k of MICRO_KEYS) t.micros[k] = a.micros[k] * factor
  t.missingMicros = a.missingMicros
  return t
}

export function itemsTotals(items: Pick<MealItem, 'foodId' | 'rawGrams'>[], foods: FoodsById): Totals {
  let t = emptyTotals()
  for (const item of items) {
    const food = foods.get(item.foodId)
    if (food) t = addTotals(t, itemTotals(food, item.rawGrams))
  }
  return t
}

export function mealsTotals(meals: Meal[], foods: FoodsById): Totals {
  return meals.reduce((t, m) => addTotals(t, itemsTotals(m.items, foods)), emptyTotals())
}

export interface PeriodSummary {
  perDay: { day: string; totals: Totals; logged: boolean }[]
  loggedDays: number
  totalDays: number
  /** Average per logged day (days without any meal are not counted). */
  average: Totals
}

export function periodSummary(days: string[], meals: Meal[], foods: FoodsById): PeriodSummary {
  const perDay = days.map((day) => {
    const dayMeals = meals.filter((m) => m.day === day)
    return { day, totals: mealsTotals(dayMeals, foods), logged: dayMeals.length > 0 }
  })
  const logged = perDay.filter((d) => d.logged)
  const sum = logged.reduce((t, d) => addTotals(t, d.totals), emptyTotals())
  const average = logged.length > 0 ? scaleTotals(sum, 1 / logged.length) : emptyTotals()
  return { perDay, loggedDays: logged.length, totalDays: days.length, average }
}
