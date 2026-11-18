import { describe, expect, it } from 'vitest'
import { e1rm, fmtE1rm, isRough } from './e1rm'
import { setBadges } from './pr'
import { suggestWeight } from './suggestion'
import { fmtDuration, fmtPace, paceSecPerKm, runBadges, speedKmh } from './run'

describe('e1rm (Epley)', () => {
  it('weight * (1 + reps/30)', () => {
    expect(e1rm(100, 10)).toBeCloseTo(133.33, 2)
    expect(e1rm(60, 3)).toBeCloseTo(66)
  })

  it('1 rep = weight', () => {
    expect(e1rm(120, 1)).toBe(120)
  })

  it('marks more than 12 reps as rough', () => {
    expect(isRough(12)).toBe(false)
    expect(isRough(13)).toBe(true)
    expect(fmtE1rm(e1rm(10, 15), 15)).toBe('~15')
    expect(fmtE1rm(e1rm(100, 10), 10)).toBe('133.3')
  })
})

describe('PR detection', () => {
  const set = (id: number, weight: number, reps: number, loggedAt: number) => ({ id, weight, reps, loggedAt })

  it('first set ever is the baseline, not a PR', () => {
    const b = setBadges([set(1, 60, 8, 1)])
    expect(b.get(1)).toBe('baseline')
  })

  it('PR only when strictly greater than every earlier e1RM, including same session', () => {
    const b = setBadges([
      set(1, 60, 8, 1), // baseline 76
      set(2, 60, 8, 2), // equal: not a PR
      set(3, 62.5, 8, 3), // 79.2: PR
      set(4, 60, 10, 4), // 80: PR
      set(5, 70, 1, 5), // 70: no
      set(6, 80, 1, 6), // 80: equal, no
    ])
    expect([...b.entries()]).toEqual([
      [1, 'baseline'],
      [3, 'pr'],
      [4, 'pr'],
    ])
  })

  it('sorts by time regardless of input order', () => {
    const b = setBadges([set(2, 100, 5, 20), set(1, 50, 5, 10)])
    expect(b.get(1)).toBe('baseline')
    expect(b.get(2)).toBe('pr')
  })
})

describe('suggested weight (double progression)', () => {
  it('required case: 15 reps at 10 kg dumbbell curl, range 8-12, increment 2 -> 12 kg', () => {
    const s = suggestWeight([{ weight: 10, reps: 15 }], 8, 12, 2)
    expect(s?.weight).toBe(12)
    expect(s?.reason).toBe('All sets at 12+ reps, go up.')
  })

  it('all sets at the top of the range -> add increment', () => {
    expect(suggestWeight([{ weight: 80, reps: 10 }, { weight: 80, reps: 10 }], 6, 10, 2.5)?.weight).toBe(82.5)
  })

  it('any set below the range -> e1RM at mid reps, rounded, never above last weight', () => {
    // best e1RM = 100 * (1 + 5/30) = 116.67; mid = 8; 116.67 / (1 + 8/30) = 92.1 -> 92.5
    const s = suggestWeight([{ weight: 100, reps: 5 }, { weight: 100, reps: 4 }], 6, 10, 2.5)
    expect(s?.weight).toBe(92.5)
    expect(s?.reason).toBe('Below 6 reps, go down slightly.')
  })

  it('below range result is capped at last weight', () => {
    // 3 sets: 12, 12, 7 reps at 20 kg, range 8-12 -> best e1RM 28; mid 10 -> 21 -> rounds to 20 (cap 20)
    const s = suggestWeight([{ weight: 20, reps: 12 }, { weight: 20, reps: 12 }, { weight: 20, reps: 7 }], 8, 12, 2)
    expect(s?.weight).toBeLessThanOrEqual(20)
  })

  it('in range -> same weight', () => {
    const s = suggestWeight([{ weight: 50, reps: 9 }, { weight: 50, reps: 12 }], 8, 12, 5)
    expect(s).toEqual({ weight: 50, reason: 'In range, beat last reps.' })
  })

  it('no history -> no suggestion', () => {
    expect(suggestWeight([], 8, 12, 2)).toBeNull()
  })
})

describe('treadmill runs', () => {
  it('speed and pace', () => {
    expect(speedKmh(5, 1800)).toBe(10)
    expect(paceSecPerKm(5, 1800)).toBe(360)
    expect(fmtPace(330)).toBe('5:30')
    expect(fmtDuration(1830)).toBe('30:30')
    expect(fmtDuration(3725)).toBe('1:02:05')
  })

  const run = (id: number, distanceKm: number, durationSec: number) => ({ id, distanceKm, durationSec, loggedAt: id })

  it('first run is baseline; then distance and pace PRs', () => {
    const b = runBadges([run(1, 3, 1200), run(2, 5, 1800), run(3, 2, 600), run(4, 0.5, 100)])
    expect(b.get(1)).toEqual(['baseline'])
    expect(b.get(2)).toEqual(['distance', 'pace']) // 6:00/km < 6:40/km
    expect(b.get(3)).toEqual(['pace']) // 5:00/km
    expect(b.get(4)).toBeUndefined() // 3:20/km but under 1 km: no pace PR
  })
})
