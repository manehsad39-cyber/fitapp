// Treadmill run calculations.

export interface RunLike {
  id: number
  durationSec: number
  distanceKm: number
  loggedAt: number
}

export type RunBadge = 'baseline' | 'distance' | 'pace'

/** Average speed in km/h. */
export function speedKmh(distanceKm: number, durationSec: number): number {
  return durationSec > 0 ? distanceKm / (durationSec / 3600) : 0
}

/** Pace in seconds per km. */
export function paceSecPerKm(distanceKm: number, durationSec: number): number {
  return distanceKm > 0 ? durationSec / distanceKm : 0
}

/** 330 -> "5:30" */
export function fmtPace(secPerKm: number): string {
  const total = Math.round(secPerKm)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/** 1830 -> "30:30", 3725 -> "1:02:05" */
export function fmtDuration(sec: number): string {
  const s = Math.round(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`
}

export const PACE_PR_MIN_KM = 1

/**
 * Badges for all runs. The first run is the baseline. After that: "distance" when
 * strictly longer than every earlier run, "pace" when strictly faster than every
 * earlier run of 1 km or more (only runs of 1 km or more qualify).
 */
export function runBadges(runs: RunLike[]): Map<number, RunBadge[]> {
  const sorted = [...runs].sort((a, b) => a.loggedAt - b.loggedAt || a.id - b.id)
  const result = new Map<number, RunBadge[]>()
  let longest = -Infinity
  let bestPace = Infinity
  sorted.forEach((r, i) => {
    const pace = paceSecPerKm(r.distanceKm, r.durationSec)
    const qualifies = r.distanceKm >= PACE_PR_MIN_KM && pace > 0
    if (i === 0) {
      result.set(r.id, ['baseline'])
    } else {
      const badges: RunBadge[] = []
      if (r.distanceKm > longest) badges.push('distance')
      if (qualifies && bestPace !== Infinity && pace < bestPace) badges.push('pace')
      if (badges.length) result.set(r.id, badges)
    }
    longest = Math.max(longest, r.distanceKm)
    if (qualifies) bestPace = Math.min(bestPace, pace)
  })
  return result
}
