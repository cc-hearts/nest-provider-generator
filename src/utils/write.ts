import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'path'
import { generatorModulesProvider } from '../parse'
import { existsSync } from 'fs'

export const writeProviderFile = async (
  fileDirPath: string,
  filePath: string,
  code: string,
) => {
  await mkdir(fileDirPath, { recursive: true })
  await writeFile(filePath, code, { encoding: 'utf-8' })
}

export const writeModuleProviderFile = async (
  fileDirPath: string,
  variable: string,
  importRelativePath: string,
  exportProviderName: string,
) => {
  const moduleName = `${variable}.module.ts`
  const modulePath = resolve(fileDirPath, '..', moduleName)
  if (existsSync(modulePath)) {
    const sourceCode = await readFile(modulePath, { encoding: 'utf-8' })
    const code = generatorModulesProvider(
      sourceCode,
      `import {${exportProviderName}} from './${importRelativePath}'`,
      exportProviderName,
    )
    if (code) {
      await writeFile(modulePath, code, { encoding: 'utf-8' })
      console.log(`update ${moduleName} file success`)
    }
  }
}