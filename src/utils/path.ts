import { resolve } from 'path'
import { existsSync } from 'fs'
import { isDirectory } from './valid.js'

/**
 * Step up to find the most recent file
 *
 * @param path
 * @returns
 */
export async function findUpPkg(path: string, fileName: string) {
  if (fileName === void 0) {
    throw new Error('fileName is required')
  }
  let curPath: string
  if (await isDirectory(path)) {
    curPath = resolve(path, 'package.json')
  } else {
    curPath = resolve(path, '../package.json')
  }
  if (existsSync(curPath)) {
    return curPath
  }
  if (path === '/') return null
  return findUpPkg(resolve(path, '..'), fileName)
}
