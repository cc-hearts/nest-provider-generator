import { describe, expect, it, vi } from 'vitest'
import { getArgv, getNestCLIPathRoot } from '../../src/utils/shard'
import { join } from 'node:path'

let hoisted = vi.hoisted(() => {
  return {
    getNestCliJSONFunc: async () => `{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}`,
  }
})

vi.mock('process', () => {
  return {
    argv: ['npx', 'nest-provider', '<providerName>'],
  }
})

vi.mock('node:fs/promises', () => {
  return {
    readFile: async () => hoisted.getNestCliJSONFunc(),
  }
})

describe('utils shard module', () => {
  it('getArgv should return argv when run npx nest-provider <providerName> ', async () => {
    const argv = ['<providerName>']
    const result = getArgv()
    expect(result).toEqual(argv)
  })

  it('get nest cli path root when nest-cli.json exists workspace root', async () => {
    expect(await getNestCLIPathRoot()).toBe(join(process.cwd(), 'src'))
  })

  it('get null when nest-cli.json not exists workspace root', async () => {
    hoisted.getNestCliJSONFunc = async () => {
      throw new Error('not exists nest-cli.json')
    }
    expect(await getNestCLIPathRoot()).toBeNull()
  })
})
