import { db, type Exercise } from './db'
import { BUILTIN_FOODS } from './seedFoods'

type SeedExercise = Omit<Exercise, 'id' | 'formula' | 'archived'>

const BUILTIN_EXERCISES: SeedExercise[] = [
  { name: 'Bench press', type: 'barbell', increment: 2.5, repLo: 6, repHi: 10 },
  { name: 'Dumbbell bench press', type: 'dumbbell', increment: 2, repLo: 8, repHi: 12 },
  { name: 'Lat pulldown', type: 'cable', increment: 5, repLo: 8, repHi: 12 },
  { name: 'Leg press', type: 'machine', increment: 5, repLo: 8, repHi: 12 },
  { name: 'Lateral raises', type: 'dumbbell', increment: 2, repLo: 12, repHi: 20 },
  { name: 'Military press', type: 'barbell', increment: 2.5, repLo: 6, repHi: 10 },
  { name: 'Bicep curls', type: 'dumbbell', increment: 2, repLo: 8, repHi: 12 },
  { name: 'Barbell row', type: 'barbell', increment: 2.5, repLo: 8, repHi: 12 },
  { name: 'Triceps pushdown', type: 'cable', increment: 2.5, repLo: 10, repHi: 15 },
  { name: 'Leg curl', type: 'machine', increment: 5, repLo: 10, repHi: 15 },
  { name: 'Treadmill run', type: 'cardio', increment: 0, repLo: 0, repHi: 0 },
]

/** Adds the built-in foods and exercises once each, on first launch. */
export async function seedIfNeeded(): Promise<void> {
  await db.transaction('rw', db.foods, db.exercises, db.kv, async () => {
    if (!(await db.kv.get('foodsSeeded'))) {
      await db.foods.bulkAdd(BUILTIN_FOODS as never)
      await db.kv.put({ key: 'foodsSeeded', value: true })
    }
    if (!(await db.kv.get('exercisesSeeded'))) {
      await db.exercises.bulkAdd(BUILTIN_EXERCISES.map((e) => ({ ...e, formula: 'epley', archived: false })) as never)
      await db.kv.put({ key: 'exercisesSeeded', value: true })
    }
  })
}
