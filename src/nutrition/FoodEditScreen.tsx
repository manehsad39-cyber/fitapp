import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Food } from '../db/db'
import { parseNum } from '../lib/format'
import { MICRO_KEYS, MICROS, type MicroKey } from '../lib/micros'
import NumInput from '../shell/NumInput'
import { isFoodInUse } from './data'

type Form = {
  name: string
  baseState: Food['baseState']
  kcal: string
  protein: string
  carbs: string
  fat: string
  pieceWeight: string
  cookedRatio: string
  micros: Record<MicroKey, string>
}

const str = (n: number | undefined) => (n === undefined || n === null ? '' : String(n))

function toForm(f?: Food): Form {
  return {
    name: f?.name ?? '',
    baseState: f?.baseState ?? 'as is',
    kcal: str(f?.per100.kcal),
    protein: str(f?.per100.protein),
    carbs: str(f?.per100.carbs),
    fat: str(f?.per100.fat),
    pieceWeight: str(f?.pieceWeight),
    cookedRatio: str(f?.cookedRatio),
    micros: Object.fromEntries(MICRO_KEYS.map((k) => [k, str(f?.per100.micros[k])])) as Record<MicroKey, string>,
  }
}

export default function FoodEditScreen() {
  const param = useParams().id
  const isNew = param === 'new'
  const id = Number(param)
  const navigate = useNavigate()
  const food = useLiveQuery(async () => (isNew ? null : ((await db.foods.get(id)) ?? null)), [id, isNew])
  const inUse = useLiveQuery(async () => (isNew ? false : isFoodInUse(id)), [id, isNew])
  const [form, setForm] = useState<Form | null>(isNew ? toForm() : null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (food && !form) setForm(toForm(food))
  }, [food, form])

  if (!isNew && food === null) {
    return (
      <div className="screen">
        <p className="muted">This food no longer exists.</p>
        <button className="btn" onClick={() => navigate('/n/foods')}>
          Back to Foods
        </button>
      </div>
    )
  }
  if (!form || inUse === undefined) return null

  const set = (patch: Partial<Form>) => setForm({ ...form, ...patch })
  const back = () => navigate('/n/foods')

  async function save() {
    if (!form) return
    const kcal = parseNum(form.kcal)
    const protein = parseNum(form.protein)
    const carbs = parseNum(form.carbs)
    const fat = parseNum(form.fat)
    if (!form.name.trim()) return setError('Name is required.')
    if ([kcal, protein, carbs, fat].some((v) => v === null || v < 0)) {
      return setError('Calories, protein, carbs and fat are required (per 100 g).')
    }
    const pieceWeight = parseNum(form.pieceWeight)
    const cookedRatio = parseNum(form.cookedRatio)
    if ((pieceWeight !== null && pieceWeight <= 0) || (cookedRatio !== null && cookedRatio <= 0)) {
      return setError('Piece weight and cooked ratio must be greater than 0 (or empty).')
    }
    const micros: Food['per100']['micros'] = {}
    for (const k of MICRO_KEYS) {
      const v = parseNum(form.micros[k])
      if (v !== null && v >= 0) micros[k] = v
    }
    const data = {
      name: form.name.trim(),
      baseState: form.baseState,
      per100: { kcal: kcal!, protein: protein!, carbs: carbs!, fat: fat!, micros },
      pieceWeight: pieceWeight ?? undefined,
      cookedRatio: cookedRatio ?? undefined,
    }
    if (isNew) {
      await db.foods.add({ ...data, builtin: false, archived: false } as Food)
    } else {
      await db.foods.update(id, data)
    }
    back()
  }

  async function remove() {
    if (!window.confirm(`Delete “${form?.name}”? This cannot be undone.`)) return
    await db.foods.delete(id)
    back()
  }

  async function toggleArchive() {
    await db.foods.update(id, { archived: !food?.archived })
    back()
  }

  return (
    <div className="screen">
      <div className="card-head">
        <button className="btn" onClick={back}>
          ‹ Back
        </button>
        <h1>{isNew ? 'New food' : 'Edit food'}</h1>
      </div>

      <section className="card">
        <label className="field">
          <span className="field-label">Name</span>
          <input type="text" className="text-input" value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </label>
        <label className="field">
          <span className="field-label">Values per 100 g of</span>
          <select value={form.baseState} onChange={(e) => set({ baseState: e.target.value as Food['baseState'] })}>
            <option value="raw">raw</option>
            <option value="dry">dry</option>
            <option value="as is">as is</option>
          </select>
        </label>
      </section>

      <section className="card">
        <h2>Per 100 g (required)</h2>
        <FormNum label="Calories" unit="kcal" value={form.kcal} onChange={(kcal) => set({ kcal })} />
        <FormNum label="Protein" unit="g" value={form.protein} onChange={(protein) => set({ protein })} />
        <FormNum label="Carbs" unit="g" value={form.carbs} onChange={(carbs) => set({ carbs })} />
        <FormNum label="Fat" unit="g" value={form.fat} onChange={(fat) => set({ fat })} />
      </section>

      <section className="card">
        <h2>Optional</h2>
        <FormNum label="Piece weight" unit="g" value={form.pieceWeight} onChange={(pieceWeight) => set({ pieceWeight })} />
        <FormNum
          label="Cooked ratio (cooked g per 1 g raw)"
          unit="×"
          value={form.cookedRatio}
          onChange={(cookedRatio) => set({ cookedRatio })}
        />
      </section>

      <section className="card">
        <h2>Micros per 100 g (optional)</h2>
        {MICRO_KEYS.map((k) => (
          <FormNum
            key={k}
            label={MICROS[k].label}
            unit={MICROS[k].unit}
            value={form.micros[k]}
            onChange={(v) => set({ micros: { ...form.micros, [k]: v } })}
          />
        ))}
      </section>

      {error && <p className="message">{error}</p>}
      <button className="btn primary block" onClick={save}>
        Save
      </button>
      {!isNew &&
        (inUse ? (
          <>
            <button className="btn block" onClick={toggleArchive}>
              {food?.archived ? 'Unarchive' : 'Archive'}
            </button>
            <p className="muted small">This food is used in logged or saved meals, so it can only be archived. Archived foods are hidden from search.</p>
          </>
        ) : (
          <>
            {food?.archived && (
              <button className="btn block" onClick={toggleArchive}>
                Unarchive
              </button>
            )}
            <button className="btn block" onClick={remove}>
              Delete food
            </button>
          </>
        ))}
    </div>
  )
}

function FormNum({ label, unit, value, onChange }: { label: string; unit: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="field-input">
        <NumInput value={value} onChange={onChange} />
        <span className="unit">{unit}</span>
      </span>
    </label>
  )
}
