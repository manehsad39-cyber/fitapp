import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router'
import { db, type Exercise, type ExerciseType } from '../db/db'
import { parseNum } from '../lib/format'
import NumInput from '../shell/NumInput'

type Form = { name: string; type: ExerciseType; increment: string; repLo: string; repHi: string }

const TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell (kg per dumbbell)' },
  { value: 'machine', label: 'Machine' },
  { value: 'cable', label: 'Cable' },
  { value: 'cardio', label: 'Cardio (treadmill run)' },
]

export default function ExerciseEditScreen() {
  const param = useParams().id
  const isNew = param === 'new'
  const id = Number(param)
  const navigate = useNavigate()
  const exercise = useLiveQuery(async () => (isNew ? null : ((await db.exercises.get(id)) ?? null)), [id, isNew])
  const [form, setForm] = useState<Form | null>(
    isNew ? { name: '', type: 'barbell', increment: '2.5', repLo: '8', repHi: '12' } : null,
  )
  const [error, setError] = useState('')

  useEffect(() => {
    if (exercise && !form) {
      setForm({
        name: exercise.name,
        type: exercise.type,
        increment: String(exercise.increment),
        repLo: String(exercise.repLo),
        repHi: String(exercise.repHi),
      })
    }
  }, [exercise, form])

  if (!isNew && exercise === null) {
    return (
      <div className="screen">
        <p className="muted">This exercise no longer exists.</p>
        <button className="btn" onClick={() => navigate('/g/exercises')}>
          Back to Exercises
        </button>
      </div>
    )
  }
  if (!form) return null

  const set = (p: Partial<Form>) => setForm({ ...form, ...p })
  const back = () => navigate(isNew ? '/g/exercises' : `/g/exercises/${id}`)
  const cardio = form.type === 'cardio'

  async function save() {
    if (!form) return
    if (!form.name.trim()) return setError('Name is required.')
    const increment = parseNum(form.increment)
    const repLo = parseNum(form.repLo)
    const repHi = parseNum(form.repHi)
    if (!cardio) {
      if (increment === null || increment <= 0) return setError('Increment must be greater than 0.')
      if (repLo === null || repHi === null || !Number.isInteger(repLo) || !Number.isInteger(repHi) || repLo < 1 || repHi < repLo) {
        return setError('Rep range must be whole numbers with low ≤ high.')
      }
    }
    const data = {
      name: form.name.trim(),
      type: form.type,
      increment: cardio ? 0 : increment!,
      repLo: cardio ? 0 : repLo!,
      repHi: cardio ? 0 : repHi!,
    }
    if (isNew) {
      const newId = await db.exercises.add({ ...data, formula: 'epley', archived: false } as Exercise)
      navigate(`/g/exercises/${newId}`, { replace: true })
    } else {
      await db.exercises.update(id, data)
      back()
    }
  }

  async function toggleArchive() {
    await db.exercises.update(id, { archived: !exercise?.archived })
    back()
  }

  return (
    <div className="screen">
      <div className="card-head">
        <button className="btn" onClick={back}>
          ‹ Back
        </button>
        <h1>{isNew ? 'New exercise' : 'Edit exercise'}</h1>
      </div>
      <section className="card">
        <label className="field">
          <span className="field-label">Name</span>
          <input type="text" className="text-input" value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </label>
        <label className="field">
          <span className="field-label">Type</span>
          <select value={form.type} onChange={(e) => set({ type: e.target.value as ExerciseType })}>
            {/* An existing exercise cannot switch between strength and cardio (its history would not fit). */}
            {TYPES.filter((t) => isNew || (t.value === 'cardio') === (exercise?.type === 'cardio')).map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        {!cardio && (
          <>
            <label className="field">
              <span className="field-label">Weight increment</span>
              <span className="field-input">
                <NumInput value={form.increment} onChange={(increment) => set({ increment })} />
                <span className="unit">kg</span>
              </span>
            </label>
            <label className="field">
              <span className="field-label">Rep range low</span>
              <span className="field-input">
                <NumInput value={form.repLo} onChange={(repLo) => set({ repLo })} inputMode="numeric" />
              </span>
            </label>
            <label className="field">
              <span className="field-label">Rep range high</span>
              <span className="field-input">
                <NumInput value={form.repHi} onChange={(repHi) => set({ repHi })} inputMode="numeric" />
              </span>
            </label>
          </>
        )}
      </section>
      {error && <p className="message">{error}</p>}
      <button className="btn primary block" onClick={save}>
        Save
      </button>
      {!isNew && (
        <button className="btn block" onClick={toggleArchive}>
          {exercise?.archived ? 'Unarchive' : 'Archive'}
        </button>
      )}
    </div>
  )
}
