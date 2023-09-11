import { describe, it, expect, vi } from 'vitest'
import { getCommand } from '../src/command'

const { argv } = vi.hoisted(() => {
  return { argv: ['npx', 'nest-provider', 'test'] }
})

vi.mock('process', () => {
  return {
    argv,
  }
})
describe('command module', () => {
  it('getCommand should return <providerName> when run npx nest-provider <providerName> ', async () => {
    const providerName = 'test'
    const result = getCommand()
    expect(result).toEqual(providerName)
  })

  it('getCommand should throw error when run npx nest-provider', () => {
    argv.splice(2, 1)
    expect(() => getCommand()).toThrowError(
      'generator provider template have not name',
    )
  })
})
