// Estimated one-rep max. The formula id is stored per exercise so another
// formula can be added here later without touching callers.

export type FormulaId = 'epley'

/** Epley: weight * (1 + reps / 30); 1 rep = weight. For dumbbells, weight is per single dumbbell. */
export function e1rm(weight: number, reps: number, formula: FormulaId = 'epley'): number {
  if (reps <= 0) return 0
  switch (formula) {
    case 'epley':
      return reps === 1 ? weight : weight * (1 + reps / 30)
  }
}

/** Weight that the formula predicts for a given number of reps (inverse of e1rm). */
export function weightForReps(oneRm: number, reps: number, formula: FormulaId = 'epley'): number {
  switch (formula) {
    case 'epley':
      return reps === 1 ? oneRm : oneRm / (1 + reps / 30)
  }
}

/** Estimates from more than 12 reps are rough. */
export function isRough(reps: number): boolean {
  return reps > 12
}

/** e.g. "105.3" or "~68.3" for rough values. */
export function fmtE1rm(value: number, reps: number): string {
  return `${isRough(reps) ? '~' : ''}${Math.round(value * 10) / 10}`
}
