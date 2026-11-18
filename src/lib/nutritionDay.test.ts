import { describe, expect, it } from 'vitest'
import { addDays, dayLabel, lastNDays, nutritionDay, timestampFor } from './nutritionDay'

const at = (y: number, m: number, d: number, h: number, min = 0) => new Date(y, m - 1, d, h, min).getTime()

describe('nutritionDay', () => {
  it('03:59 belongs to the previous day', () => {
    expect(nutritionDay(at(2026, 11, 18, 3, 59))).toBe('2026-11-17')
  })

  it('04:00 starts the new day', () => {
    expect(nutritionDay(at(2026, 11, 18, 4, 0))).toBe('2026-11-18')
  })

  it('late evening and just after midnight stay on the same day', () => {
    expect(nutritionDay(at(2026, 11, 18, 23, 30))).toBe('2026-11-18')
    expect(nutritionDay(at(2026, 11, 19, 0, 30))).toBe('2026-11-18')
  })

  it('crosses month and year boundaries', () => {
    expect(nutritionDay(at(2027, 1, 1, 2, 0))).toBe('2026-12-31')
  })
})

describe('day helpers', () => {
  it('addDays handles month ends', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('lastNDays lists oldest first and ends with the given day', () => {
    expect(lastNDays('2026-11-18', 3)).toEqual(['2026-11-16', '2026-11-17', '2026-11-18'])
  })

  it('timestampFor puts times before 04:00 on the next calendar date', () => {
    expect(timestampFor('2026-11-18', '01:30')).toBe(at(2026, 11, 19, 1, 30))
    expect(timestampFor('2026-11-18', '13:00')).toBe(at(2026, 11, 18, 13, 0))
    expect(nutritionDay(timestampFor('2026-11-18', '03:59'))).toBe('2026-11-18')
    expect(nutritionDay(timestampFor('2026-11-18', '04:00'))).toBe('2026-11-18')
  })

  it('dayLabel', () => {
    expect(dayLabel('2026-11-18', '2026-11-18')).toBe('Today')
    expect(dayLabel('2026-11-17', '2026-11-18')).toBe('Yesterday')
    expect(dayLabel('2026-11-16', '2026-11-18')).toBe('Mon 16 Nov')
  })
})
