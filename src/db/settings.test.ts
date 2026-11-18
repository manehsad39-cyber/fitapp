import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, withDefaults } from './settings'

describe('settings defaults', () => {
  it('has the spec targets', () => {
    expect(DEFAULT_SETTINGS.kcalTarget).toBe(3000)
    expect(DEFAULT_SETTINGS.proteinTarget).toBe(180)
    expect(DEFAULT_SETTINGS.carbsTarget).toBe(390)
    expect(DEFAULT_SETTINGS.fatTarget).toBe(80)
    expect(DEFAULT_SETTINGS.microTargets.vitaminB12).toBe(2.4)
    expect(DEFAULT_SETTINGS.restTimerEnabled).toBe(true)
    expect(DEFAULT_SETTINGS.restTimerSeconds).toBe(90)
  })

  it('merges stored values over defaults', () => {
    const s = withDefaults({ kcalTarget: 2800, microTargets: { zinc: 15 } as never })
    expect(s.kcalTarget).toBe(2800)
    expect(s.microTargets.zinc).toBe(15)
    expect(s.microTargets.iron).toBe(8)
    expect(s.fatTarget).toBe(80)
  })
})
