import { e1rm, weightForReps, type FormulaId } from './e1rm'

export interface Suggestion {
  weight: number
  reason: string
}

export function roundToIncrement(weight: number, increment: number): number {
  if (increment <= 0) return weight
  return Math.round(Math.round(weight / increment) * increment * 100) / 100
}

/**
 * Double progression for hypertrophy, based on the most recent session's sets.
 * lastWeight = the heaviest weight used in that session.
 */
export function suggestWeight(
  lastSession: { weight: number; reps: number }[],
  repLo: number,
  repHi: number,
  increment: number,
  formula: FormulaId = 'epley',
): Suggestion | null {
  if (lastSession.length === 0) return null
  const lastWeight = Math.max(...lastSession.map((s) => s.weight))

  if (lastSession.every((s) => s.reps >= repHi)) {
    return { weight: roundToIncrement(lastWeight + increment, increment), reason: `All sets at ${repHi}+ reps, go up.` }
  }

  if (lastSession.some((s) => s.reps < repLo)) {
    const best = Math.max(...lastSession.map((s) => e1rm(s.weight, s.reps, formula)))
    const midReps = Math.round((repLo + repHi) / 2)
    const target = roundToIncrement(weightForReps(best, midReps, formula), increment)
    return { weight: Math.max(0, Math.min(target, lastWeight)), reason: `Below ${repLo} reps, go down slightly.` }
  }

  return { weight: lastWeight, reason: 'In range, beat last reps.' }
}
