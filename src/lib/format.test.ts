import { describe, expect, it } from 'vitest'
import { caloriesLeftText, fmtAmount, parseNum, pct } from './format'

describe('format', () => {
  it('states calories left or over as facts', () => {
    expect(caloriesLeftText(2000, 3000)).toBe('1,000 kcal left')
    expect(caloriesLeftText(3200, 3000)).toBe('200 kcal over target')
    expect(caloriesLeftText(3000, 3000)).toBe('0 kcal left')
  })

  it('percent of target', () => {
    expect(pct(90, 180)).toBe(50)
    expect(pct(5, 0)).toBe(0)
  })

  it('amounts', () => {
    expect(fmtAmount(0.456)).toBe('0.46')
    expect(fmtAmount(2.44)).toBe('2.4')
    expect(fmtAmount(3400.4)).toBe('3,400')
  })

  it('parses comma decimals', () => {
    expect(parseNum('1,5')).toBe(1.5)
    expect(parseNum(' ')).toBeNull()
    expect(parseNum('abc')).toBeNull()
  })
})
