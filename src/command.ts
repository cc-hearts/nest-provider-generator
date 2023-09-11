import { getArgv } from './utils/shard.js'

export function getCommand() {
  let [providerName] = getArgv()
  if (!providerName) {
    throw new Error('generator provider template have not name')
  }
  return providerName.trim()
}
