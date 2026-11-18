import type { InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  value: string
  onChange: (text: string) => void
}

/** Text input with the decimal keypad. Parse the value with parseNum. */
export default function NumInput({ value, onChange, ...rest }: Props) {
  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => e.target.select()}
      {...rest}
    />
  )
}
