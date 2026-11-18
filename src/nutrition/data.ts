import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Food, type Meal, type MealItem, type SavedMeal } from '../db/db'
import { nutritionDay } from '../lib/nutritionDay'
import type { FoodsById } from '../lib/totals'

// Data hooks and writes for Nutrition mode.

export function useFoods(): Food[] | undefined {
  return useLiveQuery(() => db.foods.toArray())
}

export function useFoodsById(): FoodsById | undefined {
  return useLiveQuery(async () => new Map((await db.foods.toArray()).map((f) => [f.id, f])))
}

export function useSavedMeals(): SavedMeal[] | undefined {
  return useLiveQuery(() => db.savedMeals.orderBy('name').toArray())
}

/** Meals of one nutrition day, sorted by time. */
export function useMealsOfDay(day: string): Meal[] | undefined {
  return useLiveQuery(() => db.meals.where('day').equals(day).sortBy('time'), [day])
}

export function useMealsBetween(firstDay: string, lastDay: string): Meal[] | undefined {
  return useLiveQuery(() => db.meals.where('day').between(firstDay, lastDay, true, true).toArray(), [firstDay, lastDay])
}

export async function logMeal(time: number, items: MealItem[]): Promise<number> {
  return db.meals.add({ day: nutritionDay(time), time, items } as Meal)
}

export async function updateMeal(id: number, patch: Partial<Pick<Meal, 'time' | 'items'>>): Promise<void> {
  const changes: Partial<Meal> = { ...patch }
  if (patch.time !== undefined) changes.day = nutritionDay(patch.time)
  await db.meals.update(id, changes)
}

/** A food is in use when a logged meal or a saved meal contains it. */
export async function isFoodInUse(foodId: number): Promise<boolean> {
  const inMeal = await db.meals.filter((m) => m.items.some((i) => i.foodId === foodId)).count()
  if (inMeal > 0) return true
  const inSaved = await db.savedMeals.filter((m) => m.items.some((i) => i.foodId === foodId)).count()
  return inSaved > 0
}
