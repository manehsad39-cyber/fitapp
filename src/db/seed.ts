import { db } from './db'
import { BUILTIN_FOODS } from './seedFoods'

/** Adds the built-in foods once, on first launch. */
export async function seedIfNeeded(): Promise<void> {
  await db.transaction('rw', db.foods, db.kv, async () => {
    if (await db.kv.get('foodsSeeded')) return
    await db.foods.bulkAdd(BUILTIN_FOODS as never)
    await db.kv.put({ key: 'foodsSeeded', value: true })
  })
}
