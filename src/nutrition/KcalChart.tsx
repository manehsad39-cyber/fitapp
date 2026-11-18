import { fmtInt } from '../lib/format'
import { shortDay } from '../lib/nutritionDay'

interface Props {
  data: { day: string; kcal: number }[]
  target: number
}

const W = 340
const H = 160
const PAD_L = 4
const PAD_B = 18
const PAD_T = 14

/** Per-day kcal bars with a dashed target line. Hand-written SVG, no library. */
export default function KcalChart({ data, target }: Props) {
  const max = Math.max(target, ...data.map((d) => d.kcal)) * 1.1 || 1
  const plotH = H - PAD_B - PAD_T
  const y = (v: number) => PAD_T + plotH - (v / max) * plotH
  const slot = (W - PAD_L) / data.length
  const barW = Math.max(2, Math.min(28, slot * 0.7))
  const labelEvery = data.length > 10 ? Math.ceil(data.length / 6) : 1

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Calories per day">
      {data.map((d, i) => {
        const x = PAD_L + i * slot + (slot - barW) / 2
        return (
          <g key={d.day}>
            {d.kcal > 0 && <rect x={x} y={y(d.kcal)} width={barW} height={y(0) - y(d.kcal)} rx={2} className="chart-bar" />}
            {(i % labelEvery === 0 || i === data.length - 1) && (
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" className="chart-label">
                {shortDay(d.day)}
              </text>
            )}
          </g>
        )
      })}
      <line x1={0} x2={W} y1={y(target)} y2={y(target)} className="chart-target" />
      <text x={W - 2} y={y(target) - 4} textAnchor="end" className="chart-label">
        target {fmtInt(target)}
      </text>
    </svg>
  )
}
