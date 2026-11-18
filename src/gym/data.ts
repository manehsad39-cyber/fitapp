import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Exercise, type Run, type Workout, type WorkoutSet } from '../db/db'
import { setBadges, type SetBadge } from '../lib/pr'
import { runBadges, type RunBadge } from '../lib/run'

// Data hooks and writes for Gym mode.

export function useExercises(): Exercise[] | undefined {
  return useLiveQuery(() => db.exercises.toArray())
}

export function useExercisesById(): Map<number, Exercise> | undefined {
  return useLiveQuery(async () => new Map((await db.exercises.toArray()).map((e) => [e.id, e])))
}

/** The workout in progress (not finished), or null. */
export function useActiveWorkout(): Workout | null | undefined {
  return useLiveQuery(async () => (await db.workouts.filter((w) => !w.finishedAt).first()) ?? null)
}

export async function startWorkout(exerciseIds: number[]): Promise<number> {
  return db.workouts.add({ startedAt: Date.now(), exerciseIds } as Workout)
}

/** Finishes the workout. An empty workout (no sets, no runs) is deleted instead. Returns whether it was kept. */
export async function finishWorkout(id: number): Promise<boolean> {
  const sets = await db.sets.where('workoutId').equals(id).count()
  const runs = await db.runs.where('workoutId').equals(id).count()
  if (sets + runs === 0) {
    await db.workouts.delete(id)
    return false
  }
  await db.workouts.update(id, { finishedAt: Date.now() })
  return true
}

/** Badges (baseline / PR) for every set, computed per exercise over all history. */
export function useAllSetBadges(): Map<number, SetBadge> | undefined {
  return useLiveQuery(async () => {
    const [sets, exercises] = await Promise.all([db.sets.toArray(), db.exercises.toArray()])
    const formulas = new Map(exercises.map((e) => [e.id, e.formula]))
    const byExercise = new Map<number, WorkoutSet[]>()
    for (const s of sets) byExercise.set(s.exerciseId, [...(byExercise.get(s.exerciseId) ?? []), s])
    const all = new Map<number, SetBadge>()
    for (const [exId, list] of byExercise) for (const [id, b] of setBadges(list, formulas.get(exId))) all.set(id, b)
    return all
  })
}

export function useAllRunBadges(): Map<number, RunBadge[]> | undefined {
  return useLiveQuery(async () => runBadges(await db.runs.toArray()))
}

/** Sets of the most recent earlier workout that contains this exercise. */
export async function lastSessionSets(exerciseId: number, excludeWorkoutId?: number): Promise<WorkoutSet[]> {
  const sets = await db.sets.where('exerciseId').equals(exerciseId).toArray()
  const earlier = sets.filter((s) => s.workoutId !== excludeWorkoutId)
  if (earlier.length === 0) return []
  const lastWorkout = earlier.reduce((a, b) => (b.loggedAt > a.loggedAt ? b : a)).workoutId
  return earlier.filter((s) => s.workoutId === lastWorkout).sort((a, b) => a.loggedAt - b.loggedAt)
}

export function setsOfWorkout(workoutId: number): Promise<WorkoutSet[]> {
  return db.sets.where('workoutId').equals(workoutId).sortBy('loggedAt')
}

export function runsOfWorkout(workoutId: number): Promise<Run[]> {
  return db.runs.where('workoutId').equals(workoutId).sortBy('loggedAt')
}

export function exerciseTypeLabel(e: Exercise): string {
  switch (e.type) {
    case 'dumbbell':
      return 'Dumbbell (kg per dumbbell)'
    case 'barbell':
      return 'Barbell'
    case 'machine':
      return 'Machine'
    case 'cable':
      return 'Cable'
    case 'cardio':
      return 'Cardio'
  }
}

/** Unit label next to a weight: "kg" or "kg per dumbbell". */
export function weightUnit(e: Exercise): string {
  return e.type === 'dumbbell' ? 'kg per dumbbell' : 'kg'
}
