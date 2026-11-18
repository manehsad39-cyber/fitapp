import { useEffect, useState } from 'react'

interface Props {
  label: string
  value: number
  unit?: string
  onCommit: (value: number) => void
}

/** Decimal input that saves on blur. Empty or invalid input reverts to the stored value. */
export default function NumberField({ label, value, unit, onCommit }: Props) {
  const [text, setText] = useState(String(value))

  useEffect(() => setText(String(value)), [value])

  function commit() {
    const n = Number(text.replace(',', '.'))
    if (text.trim() !== '' && Number.isFinite(n) && n >= 0) {
      if (n !== value) onCommit(n)
    } else {
      setText(String(value))
    }
  }

  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="field-input">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        />
        {unit && <span className="unit">{unit}</span>}
      </span>
    </label>
  )
}
