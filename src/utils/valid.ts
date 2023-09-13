import { getPackage } from '@cc-heart/utils-service'
import { readFile, stat } from 'fs/promises'

export async function isESM(path?: string) {
  if (path) {
    if (isCommonJsExtension(path)) return false
    const file = await readFile(path, 'utf8')
    return !file.includes('module.exports')
  }
  return (await getPackage()).type === 'module'
}

export function getFileExtension(path: string) {
  return path.split('.').slice(-1)[0]
}

export function isTS(path: string) {
  return ['mts', 'cts', 'ts'].includes(getFileExtension(path))
}

export function isCommonJsExtension(path: string) {
  return ['cts', 'cjs'].includes(getFileExtension(path))
}

export async function isFile(path: string) {
  const file = await stat(path)
  return file.isFile()
}

export async function isDirectory(path: string) {
  const file = await stat(path)
  return file.isDirectory()
}
