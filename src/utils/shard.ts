import { argv } from 'process'
import { readFile } from 'node:fs/promises'
import { resolve } from 'path'
import { isObject, capitalize } from '@cc-heart/utils'
import { getWorkspacePath } from '../config/loadConfig.js'

export const shortLine2VariableName = (shortLineArray: string[]) => {
  return shortLineArray.map((_) => capitalize(_)).join('')
}

export function getArgv() {
  return argv.slice(2)
}

export async function getNestCLIPathRoot() {
  try {
    const workspace = await getWorkspacePath()
    if (!workspace) return null
    let nestCliJson: Record<string, unknown> | string = await readFile(
      resolve(workspace, 'nest-cli.json'),
      { encoding: 'utf-8' },
    )
    nestCliJson = JSON.parse(nestCliJson)
    if (isObject(nestCliJson)) {
      if (Reflect.get(nestCliJson, 'monorepo') === true) {
        return process.cwd()
      }
      const sourceRoot = Reflect.get(nestCliJson, 'sourceRoot') as string
      const pathRoot = resolve(process.cwd(), sourceRoot)
      return pathRoot
    }
  } catch (e) {}
  return null
}
