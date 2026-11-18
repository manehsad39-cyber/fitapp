import { describe, expect, it } from 'vitest'
import { frequentFoodIds, recentFoodIds, searchByName } from './search'
import type { Meal } from '../db/db'

describe('searchByName', () => {
  const items = [{ name: 'Egg whites' }, { name: 'Pâtes complètes' }, { name: 'Scrambled EGG' }, { name: 'Egg (whole)' }, { name: 'Rice' }]

  it('is case insensitive substring match, prefix matches first', () => {
    expect(searchByName(items, 'egg').map((i) => i.name)).toEqual(['Egg (whole)', 'Egg whites', 'Scrambled EGG'])
  })

  it('is accent insensitive both ways', () => {
    expect(searchByName(items, 'pates').map((i) => i.name)).toEqual(['Pâtes complètes'])
    expect(searchByName(items, 'complètes')).toHaveLength(1)
  })
})

const meal = (time: number, ids: number[]): Meal => ({
  id: time,
  day: 'd',
  time,
  items: ids.map((foodId) => ({ foodId, rawGrams: 1, inputQty: 1, inputUnit: 'g', inputState: 'raw' })),
})

describe('recent and frequent', () => {
  const meals = [meal(1, [1, 2]), meal(3, [3, 1]), meal(2, [1, 4])]

  it('recent: newest meals first, unique', () => {
    expect(recentFoodIds(meals, 3)).toEqual([3, 1, 4])
  })

  it('frequent: by number of meals', () => {
    expect(frequentFoodIds(meals, 2)).toEqual([1, 2])
  })
})
