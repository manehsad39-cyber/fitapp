import { describe, expect, it } from 'vitest'
import { BUILTIN_FOODS } from '../db/seedFoods'
import { DEFAULT_FOOD_EMOJI, foodEmoji, foodLabel } from './foodEmoji'

describe('foodEmoji', () => {
  it('gives every built-in food its own illustration', () => {
    const expected: Record<string, string> = {
      'Egg (whole)': '🥚',
      'Egg whites': '🍳',
      'Chicken breast (skinless)': '🍗',
      'Rice (white)': '🍚',
      Pasta: '🍝',
      'Whole grain pasta': '🍝',
      Potatoes: '🥔',
      'Minced beef 5% fat': '🥩',
      'Minced beef 10% fat': '🥩',
      'Minced beef 20% fat': '🥩',
      'Salmon fillet': '🐟',
      'Sardines canned in water (drained)': '🥫',
      Onion: '🧅',
      'Bell pepper': '🫑',
    }
    for (const f of BUILTIN_FOODS) expect(foodEmoji(f.name), f.name).toBe(expected[f.name])
  })

  it('matches custom food names case and accent insensitively', () => {
    expect(foodEmoji('Greek YOGHURT 0%')).toBe('🥛')
    expect(foodEmoji('Pâtes complètes')).toBe(DEFAULT_FOOD_EMOJI) // French name: no keyword
    expect(foodEmoji('Banana')).toBe('🍌')
  })

  it('falls back to a plate for unknown foods', () => {
    expect(foodEmoji('Mystery bar')).toBe(DEFAULT_FOOD_EMOJI)
    expect(foodLabel('Egg (whole)')).toBe('🥚 Egg (whole)')
  })
})
