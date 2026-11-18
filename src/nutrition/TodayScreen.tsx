import { Link, useNavigate, useSearchParams } from 'react-router'
import { useSettings } from '../db/settings'
import { describeItem } from '../lib/conversions'
import { caloriesLeftText, fmtInt } from '../lib/format'
import { clockTime, nutritionDay } from '../lib/nutritionDay'
import { itemsTotals, mealsTotals } from '../lib/totals'
import { useFoodsById, useMealsOfDay } from './data'
import DayPicker from './DayPicker'
import MacroLine from './MacroLine'
import { KcalBar, MacroRows, MicroRows } from './TotalsView'

export default function TodayScreen() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const today = nutritionDay(Date.now())
  const day = params.get('day') ?? today
  const meals = useMealsOfDay(day)
  const foods = useFoodsById()
  const s = useSettings()

  if (!meals || !foods || !s) return null
  const t = mealsTotals(meals, foods)

  return (
    <div className="screen">
      <DayPicker day={day} today={today} onChange={(d) => setParams(d === today ? {} : { day: d }, { replace: true })} />

      <section className="card">
        <div className="stat-head big">
          <span>Calories</span>
          <span>
            {fmtInt(t.kcal)} / {fmtInt(s.kcalTarget)} kcal
          </span>
        </div>
        <KcalBar kcal={t.kcal} s={s} />
        <p className="statement">{caloriesLeftText(t.kcal, s.kcalTarget)}</p>
        <MacroRows t={t} s={s} />
      </section>

      <details className="card">
        <summary>Micros</summary>
        <MicroRows t={t} s={s} />
      </details>

      <section className="card">
        <div className="card-head">
          <h2>Journal</h2>
          <Link className="btn primary" to={`/n/add?day=${day}`}>
            Add
          </Link>
        </div>
        {meals.length === 0 && <p className="muted">No meals logged.</p>}
        <ul className="journal">
          {meals.map((m, i) => (
            <li key={m.id}>
              <button onClick={() => navigate(`/n/today/meal/${m.id}`)}>
                <div className="journal-head">
                  <strong>Meal {i + 1}</strong>
                  <span className="muted">{clockTime(m.time)}</span>
                </div>
                <ul className="plain-list small">
                  {m.items.map((it, j) => {
                    const f = foods.get(it.foodId)
                    return <li key={j}>{f ? describeItem(it, f) : 'Unknown food'}</li>
                  })}
                </ul>
                <MacroLine t={itemsTotals(m.items, foods)} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
