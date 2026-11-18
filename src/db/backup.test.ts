import { describe, expect, it } from 'vitest'
import { parseBackup } from './backup'

const valid = {
  app: 'fitapp',
  schemaVersion: 1,
  exportedAt: '2026-11-18T10:00:00.000Z',
  tables: { foods: [{ id: 1, name: 'Egg' }], kv: [] },
}

describe('parseBackup', () => {
  it('accepts a valid backup and fills missing tables with []', () => {
    const b = parseBackup(JSON.stringify(valid))
    expect(b.tables.foods).toHaveLength(1)
    expect(b.tables.meals).toEqual([])
    expect(b.tables.sets).toEqual([])
  })

  it('rejects invalid JSON', () => {
    expect(() => parseBackup('{oops')).toThrow('not valid JSON')
  })

  it('rejects other JSON files', () => {
    expect(() => parseBackup('{"hello":1}')).toThrow('not a FitApp backup')
  })

  it('rejects unknown versions', () => {
    expect(() => parseBackup(JSON.stringify({ ...valid, schemaVersion: 2 }))).toThrow('version')
  })

  it('rejects malformed tables', () => {
    const bad = { ...valid, tables: { foods: 'nope' } }
    expect(() => parseBackup(JSON.stringify(bad))).toThrow('malformed')
  })
})
