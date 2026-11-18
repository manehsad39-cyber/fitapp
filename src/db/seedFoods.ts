import type { Food } from './db'

// Built-in foods, values per 100 g in the base state.
// Sources and uncertain values are listed in SEED_NOTES.md.
// Micro order: fiber g, zinc mg, magnesium mg, iron mg, potassium mg, calcium mg,
// vitamin B12 µg, vitamin D µg, omega-3 g, selenium µg, sodium mg.

type Seed = Omit<Food, 'id' | 'builtin' | 'archived' | 'per100'> & {
  macros: [kcal: number, protein: number, carbs: number, fat: number]
  micros: [number, number, number, number, number, number, number, number, number, number, number]
}

const SEEDS: Seed[] = [
  { name: 'Egg (whole)', baseState: 'raw', pieceWeight: 50, macros: [143, 12.6, 0.72, 9.51], micros: [0, 1.29, 12, 1.75, 138, 56, 0.89, 2.0, 0.1, 30.7, 142] },
  { name: 'Egg whites', baseState: 'raw', pieceWeight: 33, macros: [52, 10.9, 0.73, 0.17], micros: [0, 0.03, 11, 0.08, 163, 7, 0.09, 0, 0, 20, 166] },
  { name: 'Chicken breast (skinless)', baseState: 'raw', cookedRatio: 0.75, macros: [120, 22.5, 0, 2.62], micros: [0, 0.68, 28, 0.37, 334, 5, 0.21, 0.1, 0.03, 22.8, 45] },
  { name: 'Rice (white)', baseState: 'dry', cookedRatio: 2.8, macros: [365, 7.13, 80, 0.66], micros: [1.3, 1.09, 25, 0.8, 115, 28, 0, 0, 0.03, 15.1, 5] },
  { name: 'Pasta', baseState: 'dry', cookedRatio: 2.3, macros: [371, 13, 74.7, 1.51], micros: [3.2, 1.41, 53, 3.3, 223, 21, 0, 0, 0.02, 63.2, 6] },
  { name: 'Whole grain pasta', baseState: 'dry', cookedRatio: 2.3, macros: [362, 13.5, 73.1, 2.68], micros: [10.1, 2.4, 104, 3.33, 366, 27, 0, 0, 0.06, 69.4, 11] },
  { name: 'Potatoes', baseState: 'raw', cookedRatio: 1.0, macros: [77, 2.05, 17.5, 0.09], micros: [2.1, 0.3, 23, 0.81, 425, 12, 0, 0, 0.01, 0.4, 6] },
  { name: 'Minced beef 5% fat', baseState: 'raw', cookedRatio: 0.72, macros: [137, 21.4, 0, 5], micros: [0, 5.09, 22, 2.38, 346, 9, 2.24, 0.1, 0.03, 17.4, 66] },
  { name: 'Minced beef 10% fat', baseState: 'raw', cookedRatio: 0.72, macros: [176, 20, 0, 10], micros: [0, 4.79, 20, 2.3, 321, 12, 2.14, 0.1, 0.04, 15.8, 66] },
  { name: 'Minced beef 20% fat', baseState: 'raw', cookedRatio: 0.72, macros: [254, 17.2, 0, 20], micros: [0, 4.18, 17, 1.94, 270, 18, 2.14, 0.1, 0.07, 14.9, 66] },
  { name: 'Salmon fillet', baseState: 'raw', cookedRatio: 0.8, macros: [208, 20.4, 0, 13.4], micros: [0, 0.36, 27, 0.34, 363, 9, 3.23, 11, 2.5, 24, 59] },
  { name: 'Sardines canned in water (drained)', baseState: 'as is', pieceWeight: 90, macros: [165, 24.5, 0, 7.5], micros: [0, 1.3, 35, 2.5, 380, 350, 8.9, 4.8, 1.4, 52, 350] },
  { name: 'Onion', baseState: 'raw', pieceWeight: 110, macros: [40, 1.1, 9.34, 0.1], micros: [1.7, 0.17, 10, 0.21, 146, 23, 0, 0, 0.004, 0.5, 4] },
  { name: 'Bell pepper', baseState: 'raw', pieceWeight: 150, macros: [26, 0.99, 6.03, 0.3], micros: [2.1, 0.25, 12, 0.43, 211, 7, 0, 0, 0.056, 0.1, 4] },
]

const KEYS = ['fiber', 'zinc', 'magnesium', 'iron', 'potassium', 'calcium', 'vitaminB12', 'vitaminD', 'omega3', 'selenium', 'sodium'] as const

export const BUILTIN_FOODS: Omit<Food, 'id'>[] = SEEDS.map(({ macros, micros, ...rest }) => ({
  ...rest,
  builtin: true,
  archived: false,
  per100: {
    kcal: macros[0],
    protein: macros[1],
    carbs: macros[2],
    fat: macros[3],
    micros: Object.fromEntries(KEYS.map((k, i) => [k, micros[i]])),
  },
}))
