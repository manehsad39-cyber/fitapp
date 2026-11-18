import { e1rm, type FormulaId } from './e1rm'

export type SetBadge = 'baseline' | 'pr'

export interface SetLike {
  id: number
  weight: number
  reps: number
  loggedAt: number
}

/**
 * Badges for all sets of ONE exercise.
 * The very first set ever logged is the "baseline". After that, a set is a PR when
 * its e1RM is strictly greater than every earlier e1RM (earlier sessions and
 * earlier sets in the same session).
 */
export function setBadges(sets: SetLike[], formula: FormulaId = 'epley'): Map<number, SetBadge> {
  const sorted = [...sets].sort((a, b) => a.loggedAt - b.loggedAt || a.id - b.id)
  const badges = new Map<number, SetBadge>()
  let best = -Infinity
  sorted.forEach((s, i) => {
    const v = e1rm(s.weight, s.reps, formula)
    if (i === 0) badges.set(s.id, 'baseline')
    else if (v > best) badges.set(s.id, 'pr')
    best = Math.max(best, v)
  })
  return badges
}
