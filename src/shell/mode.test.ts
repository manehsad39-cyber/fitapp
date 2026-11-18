import { describe, expect, it } from 'vitest'
import { modeFromPath } from './mode'

describe('modeFromPath', () => {
  it('maps nutrition and gym routes', () => {
    expect(modeFromPath('/n/today')).toBe('nutrition')
    expect(modeFromPath('/n')).toBe('nutrition')
    expect(modeFromPath('/g/workout')).toBe('gym')
    expect(modeFromPath('/g')).toBe('gym')
  })

  it('returns null for shared routes', () => {
    expect(modeFromPath('/settings')).toBeNull()
    expect(modeFromPath('/')).toBeNull()
    expect(modeFromPath('/nope')).toBeNull()
  })
})
