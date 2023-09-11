import { argv } from 'process'
import { readFile } from 'node:fs/promises'
import { resolve } from 'path'
import { isObject, capitalize } from '@cc-heart/utils'

export const shortLine2VariableName = (shortLineArray: string[]) => {
  return shortLineArray.map((_) => capitalize(_)).join('')
}

export function getArgv() {
  return argv.slice(2)
}

export async function getNestCLIPathRoot() {
  try {
    let nestCliJson: Record<string, unknown> | string = await readFile(
      resolve(process.cwd(), 'nest-cli.json'),
      { encoding: 'utf-8' },
    )
    nestCliJson = JSON.parse(nestCliJson)
    if (isObject(nestCliJson)) {
      const sourceRoot = Reflect.get(nestCliJson, 'sourceRoot') as string
      const pathRoot = resolve(process.cwd(), sourceRoot)
      return pathRoot
    }
  } catch (e) { }
  return null
}
