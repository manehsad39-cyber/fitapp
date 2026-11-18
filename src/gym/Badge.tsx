import type { SetBadge } from '../lib/pr'
import type { RunBadge } from '../lib/run'

const LABEL: Record<SetBadge | RunBadge, string> = {
  pr: '★ PR',
  baseline: 'Baseline',
  distance: '★ Distance PR',
  pace: '★ Pace PR',
}

/** PR / Baseline badge. Plays a short highlight animation when the set was just logged. */
export default function Badge({ kind, loggedAt }: { kind: SetBadge | RunBadge; loggedAt?: number }) {
  const fresh = kind !== 'baseline' && loggedAt !== undefined && Date.now() - loggedAt < 4000
  return <span className={`badge ${kind === 'baseline' ? 'baseline' : 'pr'} ${fresh ? 'fresh' : ''}`}>{LABEL[kind]}</span>
}
