import { normalize } from './search'

// Emoji shown next to a food's name, picked from keywords in the name.
// Works for built-in and custom foods alike; nothing is stored.
// The first matching rule wins, so more specific keywords come first.

const RULES: [keywords: string[], emoji: string][] = [
  [['egg white'], '🍳'],
  [['egg'], '🥚'],
  [['chicken', 'turkey'], '🍗'],
  [['rice'], '🍚'],
  [['pasta', 'spaghetti', 'noodle', 'macaroni', 'penne'], '🍝'],
  [['potato'], '🥔'],
  [['beef', 'steak', 'mince', 'pork', 'lamb'], '🥩'],
  [['sardine', 'tuna can', 'canned'], '🥫'],
  [['salmon', 'fish', 'tuna', 'cod', 'trout', 'shrimp'], '🐟'],
  [['onion'], '🧅'],
  [['pepper'], '🫑'],
  [['banana'], '🍌'],
  [['apple'], '🍎'],
  [['orange'], '🍊'],
  [['berry', 'berries'], '🫐'],
  [['avocado'], '🥑'],
  [['tomato'], '🍅'],
  [['carrot'], '🥕'],
  [['broccoli'], '🥦'],
  [['salad', 'lettuce', 'spinach'], '🥬'],
  [['bean', 'lentil', 'chickpea'], '🫘'],
  [['nut', 'almond', 'peanut', 'cashew'], '🥜'],
  [['cheese'], '🧀'],
  [['oat', 'cereal', 'muesli', 'granola'], '🥣'],
  [['bread', 'toast', 'bagel'], '🍞'],
  [['yogurt', 'yoghurt', 'skyr'], '🥛'],
  [['milk'], '🥛'],
  [['butter'], '🧈'],
  [['oil', 'olive'], '🫒'],
  [['honey'], '🍯'],
  [['chocolate'], '🍫'],
  [['whey', 'protein', 'shake'], '🥤'],
]

export const DEFAULT_FOOD_EMOJI = '🍽️'

export function foodEmoji(name: string): string {
  const n = normalize(name)
  for (const [keywords, emoji] of RULES) {
    if (keywords.some((k) => n.includes(k))) return emoji
  }
  return DEFAULT_FOOD_EMOJI
}

/** "🥚 Egg (whole)" */
export function foodLabel(name: string): string {
  return `${foodEmoji(name)} ${name}`
}
