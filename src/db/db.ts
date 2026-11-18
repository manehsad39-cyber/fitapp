import Dexie, { type EntityTable } from 'dexie'
import type { MicroKey } from '../lib/micros'

// All app data lives in this IndexedDB database on the phone.

export interface Nutrients {
  kcal: number
  protein: number
  carbs: number
  fat: number
  micros: Partial<Record<MicroKey, number>>
}

export interface Food {
  id: number
  name: string
  builtin: boolean
  baseState: 'raw' | 'dry' | 'as is'
  per100: Nutrients // per 100 g in the base state
  pieceWeight?: number // grams per piece
  cookedRatio?: number // cooked grams per 1 g raw
  archived: boolean
}

export interface MealItem {
  foodId: number
  rawGrams: number // canonical amount in the base state
  inputQty: number
  inputUnit: 'g' | 'pieces'
  inputState: 'raw' | 'cooked'
}

export interface Meal {
  id: number
  day: string // nutrition day, YYYY-MM-DD
  time: number // timestamp
  items: MealItem[]
}

export interface SavedMeal {
  id: number
  name: string
  items: { foodId: number; grams: number }[]
}

export type ExerciseType = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'cardio'

export interface Exercise {
  id: number
  name: string
  type: ExerciseType
  increment: number
  repLo: number
  repHi: number
  formula: 'epley'
  archived: boolean
}

export interface Routine {
  id: number
  name: string
  exerciseIds: number[]
}

export interface Workout {
  id: number
  startedAt: number
  finishedAt?: number
  /** Exercises in this workout, in display order. */
  exerciseIds: number[]
}

export interface WorkoutSet {
  id: number
  workoutId: number
  exerciseId: number
  weight: number // kg (per single dumbbell for dumbbell exercises)
  reps: number
  loggedAt: number
}

export interface Run {
  id: number
  workoutId: number
  durationSec: number
  distanceKm: number
  incline: number
  loggedAt: number
}

export interface KeyValue {
  key: string
  value: unknown
}

export const db = new Dexie('fitapp') as Dexie & {
  foods: EntityTable<Food, 'id'>
  meals: EntityTable<Meal, 'id'>
  savedMeals: EntityTable<SavedMeal, 'id'>
  exercises: EntityTable<Exercise, 'id'>
  routines: EntityTable<Routine, 'id'>
  workouts: EntityTable<Workout, 'id'>
  sets: EntityTable<WorkoutSet, 'id'>
  runs: EntityTable<Run, 'id'>
  kv: EntityTable<KeyValue, 'key'>
}

db.version(1).stores({
  foods: '++id, name',
  meals: '++id, day, time',
  savedMeals: '++id, name',
  exercises: '++id, name',
  routines: '++id, name',
  workouts: '++id, startedAt',
  sets: '++id, workoutId, exerciseId, loggedAt',
  runs: '++id, workoutId, loggedAt',
  kv: 'key',
})

export const TABLE_NAMES = [
  'foods',
  'meals',
  'savedMeals',
  'exercises',
  'routines',
  'workouts',
  'sets',
  'runs',
  'kv',
] as const

export type TableName = (typeof TABLE_NAMES)[number]
