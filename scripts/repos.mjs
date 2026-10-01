#!/usr/bin/env node
/**
 * repos.mjs — snapshot the GitHub repositories shown on /projects/.
 *
 *   npm run repos:status    what the API returns vs. what the config lists
 *   npm run repos:sync      fetch and write src/content/repos.json
 *   npm run repos:verify    check the committed snapshot (CI, needs no token)
 *
 * The GitHub API needs a token, so the fetch happens on the author's machine
 * (`gh auth login` is enough) and the result is committed. CI only verifies the
 * snapshot against its manifest, exactly like the content and bot bundles.
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  ACCOUNTS,
  EXCLUDE,
  GROUPS,
  FEATURED,
  OVERRIDES,
  IMPORTED_HERE,
  REPOS_SYNC,
} from '../repos.config.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, REPOS_SYNC.outFile)
const MANIFEST = path.join(ROOT, REPOS_SYNC.manifest)

const c = {
  dim: (s) => wrap('\x1b[2m', s),
  bold: (s) => wrap('\x1b[1m', s),
  red: (s) => wrap('\x1b[31m', s),
  green: (s) => wrap('\x1b[32m', s),
  yellow: (s) => wrap('\x1b[33m', s),
  cyan: (s) => wrap('\x1b[36m', s),
}
function wrap(code, s) {
  return process.stdout.isTTY ? `${code}${s}\x1b[0m` : String(s)
}
function sha256(input) {
  return 'sha256:' + crypto.createHash('sha256').update(input).digest('hex').slice(0, 16)
}
function fail(message) {
  console.error('\n' + c.red('✖ ') + message + '\n')
  process.exit(1)
}

const isExcluded = (fullName) =>
  EXCLUDE.some((rule) => !rule.includes('/') ? fullName.startsWith(`${rule}/`) : rule === fullName)

function gh(args) {
  try {
    return JSON.parse(execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }))
  } catch (error) {
    const detail = (error.stderr || error.message || '').toString().trim()
    fail(`gh ${args.join(' ')} failed.\n${detail}\nIs \`gh auth login\` done?`)
  }
}

/** Normalise the API shape into the small object the site renders. */
function normalise(repo, account) {
  const fullName = repo.full_name
  const override = OVERRIDES[fullName] || {}
  const homepage = (repo.homepage || '').trim()
  return {
    fullName,
    account,
    name: repo.name,
    url: repo.html_url,
    homepage: /^https?:\/\//.test(homepage) ? homepage : homepage ? `https://${homepage}` : '',
    description: repo.description || '',
    language: repo.language || '',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics || [],
    createdAt: (repo.created_at || '').slice(0, 10),
    pushedAt: (repo.pushed_at || '').slice(0, 10),
    isFork: Boolean(repo.fork),
    parent: repo.parent?.full_name || repo.source?.full_name || '',
    license: repo.license?.spdx_id || '',
    archived: Boolean(repo.archived),
    hasPages: Boolean(repo.has_pages),
    ...(override.description ? { descriptionOverride: override.description } : {}),
    ...(override.note ? { note: override.note } : {}),
    ...(IMPORTED_HERE[fullName] ? { importedAt: IMPORTED_HERE[fullName] } : {}),
  }
}

function fetchAll() {
  const repos = []
  const missing = []
  for (const account of ACCOUNTS) {
    // /users/<login>/repos is always the public view, even for your own account.
    const list = gh(['api', `users/${account.login}/repos?per_page=${REPOS_SYNC.perPage}&sort=pushed`])
    for (const repo of list) {
      if (repo.private || isExcluded(repo.full_name)) continue
      if (repo.fork) {
        // the list endpoint omits the parent; one extra call per fork
        const detail = gh(['api', `repos/${repo.full_name}`])
        repo.parent = detail.parent
        repo.source = detail.source
      }
      repos.push(normalise(repo, account.login))
    }
    console.log(`  ${account.login.padEnd(12)} ${list.length} repo(s) seen`)
  }
  repos.sort((a, b) => a.fullName.localeCompare(b.fullName))

  // config sanity: every curated id must still exist
  const known = new Set(repos.map((r) => r.fullName))
  for (const group of GROUPS) {
    for (const id of group.repos) if (!known.has(id)) missing.push(`${group.id}: ${id}`)
  }
  for (const id of FEATURED) if (!known.has(id)) missing.push(`featured: ${id}`)
  return { repos, missing }
}

function groupsWith(repos) {
  const grouped = new Set(GROUPS.flatMap((g) => g.repos))
  const ungrouped = repos.filter((r) => !grouped.has(r.fullName)).map((r) => r.fullName)
  return { grouped, ungrouped }
}

function cmdStatus() {
  const { repos, missing } = fetchAll()
  const { ungrouped } = groupsWith(repos)
  console.log()
  console.log(c.bold(`${repos.length} public repo(s) across ${ACCOUNTS.length} account(s)`))
  console.log(c.dim(`excluded by config: ${EXCLUDE.join(', ')}`))
  for (const group of GROUPS) {
    const n = group.repos.filter((id) => repos.some((r) => r.fullName === id)).length
    console.log(`  ${group.id.padEnd(10)} ${String(n).padStart(3)}  ${group.title.zh}`)
  }
  if (ungrouped.length) {
    console.log('\n' + c.yellow('not in any group (will render as 未分组):'))
    for (const id of ungrouped) console.log('  ' + id)
  }
  if (missing.length) {
    console.log('\n' + c.red('listed in repos.config.mjs but missing on GitHub:'))
    for (const id of missing) console.log('  ' + id)
  }
  console.log()
}

function cmdSync() {
  const { repos, missing } = fetchAll()
  const { ungrouped } = groupsWith(repos)
  const payload = {
    generatedAt: new Date().toISOString(),
    accounts: ACCOUNTS.map((a) => ({ login: a.login, label: a.label, note: a.note })),
    repos,
  }
  const file = JSON.stringify(payload, null, 2) + '\n'
  fs.writeFileSync(OUT, file)
  fs.writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        generatedAt: payload.generatedAt,
        count: repos.length,
        ungrouped,
        missing,
        hash: sha256(file),
      },
      null,
      2
    ) + '\n'
  )
  console.log()
  console.log(c.green(`✔ wrote ${REPOS_SYNC.outFile} (${repos.length} repos)`))
  if (ungrouped.length) console.log(c.yellow(`  ${ungrouped.length} ungrouped — see repos:status`))
  if (missing.length) console.log(c.yellow(`  ${missing.length} configured repo(s) missing on GitHub`))
  console.log(c.dim('  commit the snapshot; CI verifies it with npm run repos:verify\n'))
}

function cmdVerify() {
  if (!fs.existsSync(MANIFEST)) fail(`No manifest at ${REPOS_SYNC.manifest} — run npm run repos:sync.`)
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  const file = fs.readFileSync(OUT, 'utf8')
  const hash = sha256(file)
  console.log()
  console.log(
    c.bold('Repository snapshot: ') +
      `${manifest.count} repo(s), captured ${manifest.generatedAt}`
  )
  if (hash !== manifest.hash) {
    fail(
      `${REPOS_SYNC.outFile} does not match the manifest — it was edited by hand or not re-synced.\n` +
        `Run npm run repos:sync.`
    )
  }
  console.log(c.green('✔ matches the manifest.\n'))
}

const command = process.argv[2] || 'status'
if (command === 'status') cmdStatus()
else if (command === 'sync') cmdSync()
else if (command === 'verify') cmdVerify()
else fail(`Unknown command "${command}". Use status | sync | verify.`)
