import type { Settings } from '../db/settings'
import { fmtAmount, fmtInt, pct } from '../lib/format'
import { MICRO_KEYS, MICROS } from '../lib/micros'
import type { Totals } from '../lib/totals'

/** Neutral bar in the theme accent. Width is capped at 100%; the number tells the rest. */
function Bar({ value, target }: { value: number; target: number }) {
  const w = Math.min(100, target > 0 ? (value / target) * 100 : 0)
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${w}%` }} />
    </div>
  )
}

export function MacroRows({ t, s }: { t: Totals; s: Settings }) {
  const rows = [
    { label: 'Protein', value: t.protein, target: s.proteinTarget },
    { label: 'Carbs', value: t.carbs, target: s.carbsTarget },
    { label: 'Fat', value: t.fat, target: s.fatTarget },
  ]
  return (
    <>
      {rows.map((r) => (
        <div key={r.label} className="stat-row">
          <div className="stat-head">
            <span>{r.label}</span>
            <span>
              {fmtInt(r.value)} / {fmtInt(r.target)} g <span className="muted">· {pct(r.value, r.target)}%</span>
            </span>
          </div>
          <Bar value={r.value} target={r.target} />
        </div>
      ))}
    </>
  )
}

export function MicroRows({ t, s }: { t: Totals; s: Settings }) {
  return (
    <>
      {MICRO_KEYS.map((k) => (
        <div key={k} className="stat-row">
          <div className="stat-head">
            <span>{MICROS[k].label}</span>
            <span>
              {fmtAmount(t.micros[k])} {MICROS[k].unit} <span className="muted">· {pct(t.micros[k], s.microTargets[k])}%</span>
            </span>
          </div>
          <Bar value={t.micros[k]} target={s.microTargets[k]} />
        </div>
      ))}
      {t.missingMicros && <p className="note">Some items have no micro data.</p>}
    </>
  )
}

export function KcalBar({ kcal, s }: { kcal: number; s: Settings }) {
  return <Bar value={kcal} target={s.kcalTarget} />
}
