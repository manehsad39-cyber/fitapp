// Tracked micronutrients, their units and default daily targets
// (adult male reference values, all editable in Settings).

export const MICRO_KEYS = [
  'fiber',
  'zinc',
  'magnesium',
  'iron',
  'potassium',
  'calcium',
  'vitaminB12',
  'vitaminD',
  'omega3',
  'selenium',
  'sodium',
] as const

export type MicroKey = (typeof MICRO_KEYS)[number]

export interface MicroInfo {
  label: string
  unit: 'g' | 'mg' | 'µg'
  defaultTarget: number
}

export const MICROS: Record<MicroKey, MicroInfo> = {
  fiber: { label: 'Fiber', unit: 'g', defaultTarget: 38 },
  zinc: { label: 'Zinc', unit: 'mg', defaultTarget: 11 },
  magnesium: { label: 'Magnesium', unit: 'mg', defaultTarget: 400 },
  iron: { label: 'Iron', unit: 'mg', defaultTarget: 8 },
  potassium: { label: 'Potassium', unit: 'mg', defaultTarget: 3400 },
  calcium: { label: 'Calcium', unit: 'mg', defaultTarget: 1000 },
  vitaminB12: { label: 'Vitamin B12', unit: 'µg', defaultTarget: 2.4 },
  vitaminD: { label: 'Vitamin D', unit: 'µg', defaultTarget: 15 },
  omega3: { label: 'Omega-3', unit: 'g', defaultTarget: 1.6 },
  selenium: { label: 'Selenium', unit: 'µg', defaultTarget: 55 },
  sodium: { label: 'Sodium', unit: 'mg', defaultTarget: 2300 },
}
