import { DEFAULT_CONFIG_FILES } from './constant.js'
import { join, resolve as _resolve } from 'path'
import { existsSync } from 'fs'
import { isESM, isTS } from '../utils/valid.js'
import * as Rollup from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import { rm, writeFile } from 'fs/promises'
import { findUpPkg } from '../utils/path.js'
const defaultConfig = {
  providerFactoryPath: '',
}

export async function getWorkspacePath() {
  const workspacePkgPath = await findUpPkg(process.cwd(), 'package.json')
  if (!workspacePkgPath) return null
  return _resolve(workspacePkgPath, '..')
}

export async function loadingConfig() {
  let resolvePath: string | undefined
  const workspacePath = await getWorkspacePath()
  if (workspacePath === null) return null
  for (const fileName of DEFAULT_CONFIG_FILES) {
    const configPath = join(workspacePath, fileName)
    if (existsSync(configPath)) {
      resolvePath = configPath
      break
    }
  }
  if (!resolvePath) {
    throw new Error('Not found nestProvider.config file')
  }
  const rollupConfig = {
    input: resolvePath,
    plugins: loadRollupPlugins(resolvePath),
  }

  const outputOptions = {
    file: join(workspacePath, './__config__.mjs'),
    format: 'esm' as const,
  }

  const rmPathList: string[] = []
  const bundlePath = await transformTsToJs(
    // @ts-ignore
    resolvePath,
    rollupConfig,
    outputOptions,
  )
  if (rollupConfig.input !== bundlePath) {
    rmPathList.push(bundlePath)
  }

  rollupConfig.input = bundlePath
  const bundle = await Rollup.rollup(rollupConfig)
  await bundle.write(outputOptions)
  rmPathList.push(outputOptions.file)
  try {
    // @ts-ignore
    const { default: config } = await import(outputOptions.file)
    return {
      ...defaultConfig,
      ...config,
    }
  } catch (e) {
  } finally {
    rmPathList.forEach((path) => rm(path))
  }
  return defaultConfig
}

export async function transformTsToJs(
  filePath: string,
  inputOptions: Rollup.RollupOptions,
  outputOptions: Rollup.OutputOptions,
) {
  const workspacePath = await getWorkspacePath()
  if (workspacePath === null) return filePath
  if (isTS(filePath)) {
    inputOptions.plugins || (inputOptions.plugins = [])
    if (Array.isArray(inputOptions.plugins)) {
      inputOptions.plugins = [...inputOptions.plugins, typescript()]
    }
    const bundle = await compileBundle(inputOptions)
    const { output } = await bundle.generate(outputOptions)
    const { code } = output[0]
    const tsToJsPath = join(workspacePath, './__config.__tsTransformJs.mjs')
    await writeFile(tsToJsPath, code, 'utf8')
    return tsToJsPath
  }
  return filePath
}

async function loadRollupPlugins(path: string) {
  const plugins = [resolve()]
  if (!(await isESM(path))) {
    plugins.push(commonjs())
  }

  return plugins
}

async function compileBundle(inputOptions: Rollup.RollupOptions) {
  return await Rollup.rollup(inputOptions)
}
