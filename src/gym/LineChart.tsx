import { shortDay } from '../lib/nutritionDay'

interface Props {
  points: { day: string; value: number }[]
  format: (v: number) => string
  label: string
}

const W = 340
const H = 170
const PAD_L = 44
const PAD_R = 10
const PAD_T = 12
const PAD_B = 20

/** Simple SVG line chart over time (one point per session). */
export default function LineChart({ points, format, label }: Props) {
  if (points.length === 0) return <p className="muted">No data yet.</p>
  const values = points.map((p) => p.value)
  let min = Math.min(...values)
  let max = Math.max(...values)
  if (min === max) {
    min -= 1
    max += 1
  }
  const pad = (max - min) * 0.1
  min -= pad
  max += pad
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B
  const x = (i: number) => PAD_L + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW)
  const y = (v: number) => PAD_T + plotH - ((v - min) / (max - min)) * plotH
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const labelEvery = Math.max(1, Math.ceil(points.length / 5))

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {[max - pad, (max + min) / 2, min + pad].map((v) => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} className="chart-grid" />
          <text x={PAD_L - 6} y={y(v) + 3} textAnchor="end" className="chart-label">
            {format(v)}
          </text>
        </g>
      ))}
      <path d={path} className="chart-line" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r={3} className="chart-dot" />
          {(i % labelEvery === 0 || i === points.length - 1) && (
            <text x={x(i)} y={H - 5} textAnchor="middle" className="chart-label">
              {shortDay(p.day)}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
