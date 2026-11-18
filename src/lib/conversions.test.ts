import { describe, expect, it } from 'vitest'
import { describeItem, toMealItem, toRawGrams } from './conversions'
import type { Food } from '../db/db'

const rice: Food = {
  id: 1,
  name: 'Rice (white)',
  builtin: true,
  baseState: 'dry',
  per100: { kcal: 365, protein: 7, carbs: 80, fat: 0.7, micros: {} },
  cookedRatio: 2.8,
  archived: false,
}
const egg: Food = { ...rice, id: 2, name: 'Egg (whole)', baseState: 'raw', pieceWeight: 50, cookedRatio: undefined }

describe('cooked -> raw conversion', () => {
  it('converts cooked grams with the cooked ratio', () => {
    expect(toRawGrams({ qty: 280, unit: 'g', state: 'cooked' }, rice)).toBeCloseTo(100)
    expect(toRawGrams({ qty: 250, unit: 'g', state: 'cooked' }, rice)).toBeCloseTo(89.29, 1)
  })

  it('keeps raw grams as is', () => {
    expect(toRawGrams({ qty: 80, unit: 'g', state: 'raw' }, rice)).toBe(80)
  })

  it('converts pieces with the piece weight', () => {
    expect(toRawGrams({ qty: 3, unit: 'pieces', state: 'raw' }, egg)).toBe(150)
  })

  it('ignores cooked for foods without a ratio and pieces for foods without a piece weight', () => {
    expect(toRawGrams({ qty: 100, unit: 'g', state: 'cooked' }, egg)).toBe(100)
    expect(toRawGrams({ qty: 2, unit: 'pieces', state: 'raw' }, rice)).toBe(2)
  })

  it('stores the canonical raw grams plus the input, and describes it', () => {
    const item = toMealItem(rice, { qty: 250, unit: 'g', state: 'cooked' })
    expect(item.inputState).toBe('cooked')
    expect(item.rawGrams).toBeCloseTo(89.29, 1)
    expect(describeItem(item, rice)).toBe('🍚 250 g cooked Rice (white) (= 89 g dry)')
    const eggs = toMealItem(egg, { qty: 2, unit: 'pieces', state: 'raw' })
    expect(describeItem(eggs, egg)).toBe('🥚 2 pieces Egg (whole) (= 100 g)')
  })
})
