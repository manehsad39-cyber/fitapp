import { addDays, dayLabel } from '../lib/nutritionDay'

interface Props {
  day: string
  today: string
  onChange: (day: string) => void
}

/** ‹ Today › with a date input to jump to any past day. */
export default function DayPicker({ day, today, onChange }: Props) {
  return (
    <div className="day-picker">
      <button className="icon-btn" aria-label="Previous day" onClick={() => onChange(addDays(day, -1))}>
        ‹
      </button>
      <label className="day-label">
        <span>{dayLabel(day, today)}</span>
        <input
          type="date"
          value={day}
          max={today}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          aria-label="Pick a day"
        />
      </label>
      <button className="icon-btn" aria-label="Next day" disabled={day >= today} onClick={() => onChange(addDays(day, 1))}>
        ›
      </button>
    </div>
  )
}
