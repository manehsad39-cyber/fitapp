import { useSearchParams } from 'react-router'
import { useSettings } from '../db/settings'
import { fmtInt, pct } from '../lib/format'
import { lastNDays, nutritionDay } from '../lib/nutritionDay'
import { periodSummary } from '../lib/totals'
import { useFoodsById, useMealsBetween } from './data'
import KcalChart from './KcalChart'
import { KcalBar, MacroRows, MicroRows } from './TotalsView'

const PERIODS = [
  { key: '1', label: 'Day', days: 1 },
  { key: '7', label: '7 days', days: 7 },
  { key: '30', label: '30 days', days: 30 },
]

export default function StatsScreen() {
  const [params, setParams] = useSearchParams()
  const period = PERIODS.find((p) => p.key === params.get('p')) ?? PERIODS[0]
  const days = lastNDays(nutritionDay(Date.now()), period.days)
  const meals = useMealsBetween(days[0], days[days.length - 1])
  const foods = useFoodsById()
  const s = useSettings()

  const tabs = (
    <div className="seg wide">
      {PERIODS.map((p) => (
        <button key={p.key} className={p === period ? 'active' : ''} onClick={() => setParams({ p: p.key }, { replace: true })}>
          {p.label}
        </button>
      ))}
    </div>
  )

  if (!meals || !foods || !s) return <div className="screen">{tabs}</div>
  const sum = periodSummary(days, meals, foods)
  const a = sum.average

  return (
    <div className="screen">
      {tabs}
      <p className="statement">
        {sum.loggedDays} of {sum.totalDays} {sum.totalDays === 1 ? 'day' : 'days'} logged
        {period.days > 1 && <span className="muted"> · averages per logged day</span>}
      </p>

      <section className="card">
        <div className="stat-head big">
          <span>Calories</span>
          <span>
            {fmtInt(a.kcal)} / {fmtInt(s.kcalTarget)} kcal <span className="muted">· {pct(a.kcal, s.kcalTarget)}%</span>
          </span>
        </div>
        <KcalBar kcal={a.kcal} s={s} />
        <MacroRows t={a} s={s} />
      </section>

      <section className="card">
        <h2>Calories per day</h2>
        <KcalChart data={sum.perDay.map((d) => ({ day: d.day, kcal: d.totals.kcal }))} target={s.kcalTarget} />
      </section>

      <section className="card">
        <h2>Micros</h2>
        <MicroRows t={a} s={s} />
      </section>
    </div>
  )
}
