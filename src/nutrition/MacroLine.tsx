import { fmtInt } from '../lib/format'
import type { Totals } from '../lib/totals'

/** "520 kcal · P 32 · C 60 · F 14" */
export default function MacroLine({ t }: { t: Pick<Totals, 'kcal' | 'protein' | 'carbs' | 'fat'> }) {
  return (
    <span className="macro-line">
      {fmtInt(t.kcal)} kcal · P {fmtInt(t.protein)} · C {fmtInt(t.carbs)} · F {fmtInt(t.fat)}
    </span>
  )
}
