import path from 'path'
import {GitTools} from '#guoba.framework'
import {_paths, GitRepoMap} from '#guoba.platform'
import {mkdirSync} from './common.js'

const repos = []

export const repoPath = path.join(_paths.pluginRoot, 'data/repo')

export function initRepos() {
  // Disabled in this environment: skip external repository initialization.
  return
}

/**
 *
 * @param key
 * @return {Promise<GitTools>}
 */
export async function get(key) {
  return null
}

export function getPluginsIndex() {
  return get('PluginsIndex')
}