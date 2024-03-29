import { readFile } from 'node:fs/promises'
import { existsSync } from 'fs'
import { compile } from 'handlebars'
import { getCommand } from './command'
import { relative, resolve } from 'path'
import { getNestCLIPathRoot, shortLine2VariableName } from './utils/shard'
import { writeProviderFile, writeModuleProviderFile } from './utils/write'
import { capitalize } from '@cc-heart/utils'
import { loadingConfig } from './config/loadConfig'
import { fileURLToPath } from 'node:url'

export const start = async () => {
  let dryRun = false,
    isExistsEntity = false
  const config = await loadingConfig()
  if (!config.providerFactoryPath) {
    throw new Error('Not found providerFactoryPath in nestProvider.config file')
  }
  const variable = getCommand()
  const originRoot = await getNestCLIPathRoot()
  if (!originRoot) return
  const variableName = variable
    .split('-')
    .map((val) => capitalize(val))
    .join('_')
  const pathRoot = resolve(originRoot, variable)
  const providerEntityImportName = shortLine2VariableName(variable.split('-'))
  if (existsSync(resolve(pathRoot, `entities/${variable}.entity.ts`))) {
    isExistsEntity = true
  }
  const providerEntityFileName = variable
  const providerName = `${variableName}_provider`.toUpperCase()
  const providerNameUpper = providerName
  const exportName = shortLine2VariableName([
    ...variable.split('-'),
    'provider',
  ])
  const templateCode = await readFile(
    resolve(
      fileURLToPath(import.meta.url),
      '..',
      '..',
      './src/provider.template.js',
    ),
    {
      encoding: 'utf-8',
    },
  )
  const templateFn = compile(templateCode)
  const code = templateFn({
    providerEntityImportName,
    providerEntityFileName,
    providerName,
    providerNameUpper,
    exportName,
    isExistsEntity,
    providerFactoryPath: config.providerFactoryPath,
  })
  const fileDirPath = resolve(pathRoot, 'providers')
  const filePath = resolve(fileDirPath, `${variable}.provider.ts`)
  if (existsSync(filePath)) {
    dryRun = true
  }
  if (dryRun) {
    console.log(`dry run generator file path: ${filePath} success`)
  } else {
    let importRelativePath = relative(resolve(pathRoot), filePath)
    importRelativePath = importRelativePath.substring(
      0,
      importRelativePath.lastIndexOf('.'),
    )
    await Promise.all([
      writeProviderFile(fileDirPath, filePath, code),
      writeModuleProviderFile(
        fileDirPath,
        variable,
        importRelativePath,
        exportName,
      ),
    ])
    console.log(`generator file path: ${filePath} success`)
  }
}
