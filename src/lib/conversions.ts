import type { Food, MealItem } from '../db/db'
import { fmtNum } from './format'
import { foodEmoji } from './foodEmoji'

export interface QtyInput {
  qty: number
  unit: 'g' | 'pieces'
  state: 'raw' | 'cooked'
}

type FoodShape = Pick<Food, 'pieceWeight' | 'cookedRatio'>

/** Canonical grams in the food's base state. Cooked grams are converted with rawGrams = cookedGrams / cookedRatio. */
export function toRawGrams(input: QtyInput, food: FoodShape): number {
  const grams = input.unit === 'pieces' && food.pieceWeight ? input.qty * food.pieceWeight : input.qty
  if (input.state === 'cooked' && food.cookedRatio) return grams / food.cookedRatio
  return grams
}

export function toMealItem(food: Food, input: QtyInput): MealItem {
  return {
    foodId: food.id,
    rawGrams: toRawGrams(input, food),
    inputQty: input.qty,
    inputUnit: input.unit === 'pieces' && food.pieceWeight ? 'pieces' : 'g',
    inputState: input.state === 'cooked' && food.cookedRatio ? 'cooked' : 'raw',
  }
}

/** What I typed, e.g. "🍚 250 g cooked Rice (white) (= 89 g dry)" or "🥚 2 pieces Egg (whole) (= 100 g)". */
export function describeItem(item: MealItem, food: Pick<Food, 'name' | 'baseState'>): string {
  const unit = item.inputUnit === 'pieces' ? (item.inputQty === 1 ? 'piece' : 'pieces') : 'g'
  const state = item.inputState === 'cooked' ? ' cooked' : ''
  let text = `${foodEmoji(food.name)} ${fmtNum(item.inputQty)} ${unit}${state} ${food.name}`
  if (item.inputState === 'cooked') {
    text += ` (= ${Math.round(item.rawGrams)} g ${food.baseState === 'dry' ? 'dry' : 'raw'})`
  } else if (item.inputUnit === 'pieces') {
    text += ` (= ${Math.round(item.rawGrams)} g)`
  }
  return text
}
