#!/usr/bin/env node
/**
 * bot.mjs — the bridge between the private-chatbot compiler and this site.
 *
 *   npm run bot:status              show what the committed bundle is
 *   npm run bot:sync                compile in the source repo, copy into public/bot
 *   npm run bot:sync -- --dry-run   show what sync would do, write nothing
 *   npm run bot:verify              check public/bot still matches the manifest (CI)
 *
 * The bot itself lives in `personal-chatbots`, where its knowledge base is
 * compiled: `pc export --bundle` writes the rows as JSON plus the browser
 * engine that reads them. This script runs that compiler and copies the
 * result, the same way `content.mjs` copies articles.
 *
 * The compiler runs in the source repository and writes exactly what it is
 * designed to write: its own gitignored `web/data.json` snapshot, plus the
 * bundle copied into `public/bot/` here. Nothing else there is touched.
 *
 * The bundle is committed on purpose: CI builds this repo without access to
 * the source repository, so the compiled artifacts have to be in the tree.
 * `bot:verify` is what keeps that honest. Convention reference: docs/CHATBOT.md
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { BOT_SYNC } from '../src/site.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = path.resolve(expandHome(BOT_SYNC.source))
const OUT = path.join(ROOT, BOT_SYNC.outDir)
const MANIFEST_PATH = path.join(ROOT, BOT_SYNC.manifest)

// ---------------------------------------------------------------- tiny helpers

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
function rel(p) {
  const r = path.relative(process.cwd(), p)
  return !r || r.startsWith('..') ? p : r
}
function expandHome(p) {
  return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p
}
function sha256(content) {
  return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex')
}
function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}
function writeJSON(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
}
function fail(message) {
  console.error('\n' + c.red('✖ ') + message + '\n')
  process.exit(1)
}
function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`
}

function parseArgs(argv) {
  const args = { _: [], flags: {} }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const [name, inline] = a.slice(2).split('=')
      if (inline !== undefined) args.flags[name] = inline
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args.flags[name] = argv[++i]
      else args.flags[name] = true
    } else {
      args._.push(a)
    }
  }
  return args
}

/** Every regular file in public/bot, so a stray hand-written file is visible. */
function bundleFiles() {
  if (!fs.existsSync(OUT)) return []
  return fs
    .readdirSync(OUT)
    .filter((name) => !name.startsWith('.') && fs.statSync(path.join(OUT, name)).isFile())
    .sort()
}

function describeManifest(manifest) {
  const bundle = manifest?.bundle || {}
  const parts = [
    `${bundle.knowledge ?? '?'} knowledge rows`,
    `${bundle.entities ?? '?'} entities`,
    `${bundle.links ?? '?'} links`,
    `${bundle.documents ?? '?'} documents`,
    `${bundle.tests ?? '?'} test cases`,
  ]
  return parts.join(' · ')
}

// ------------------------------------------------------------------- commands

function cmdStatus() {
  const manifest = readJSON(MANIFEST_PATH, null)
  console.log()
  console.log(c.bold('Chatbot bundle: ') + rel(OUT))
  console.log(c.dim(`compiler source: ${SOURCE}`))
  console.log()

  if (!bundleFiles().length) {
    console.log(c.yellow('! ') + 'no bundle committed yet — run ' + c.bold('npm run bot:sync'))
    console.log()
    return
  }
  if (!manifest) {
    console.log(c.yellow('! ') + 'bundle files exist but there is no manifest — run npm run bot:sync')
  } else {
    console.log(
      c.dim(`last sync ${manifest.generatedAt}  ·  `) + describeManifest(manifest)
    )
  }
  console.log()

  const recorded = manifest?.files || {}
  for (const name of bundleFiles()) {
    const file = path.join(OUT, name)
    const size = fs.statSync(file).size
    const hash = sha256(fs.readFileSync(file))
    const mark = !recorded[name]
      ? c.yellow('unrecorded')
      : recorded[name].sha256 === hash
        ? c.green('ok        ')
        : c.red('changed   ')
    console.log(`  ${mark}  ${name.padEnd(14)} ${kb(size).padStart(8)}`)
  }
  console.log()

  const missing = Object.keys(recorded).filter((name) => !bundleFiles().includes(name))
  if (missing.length) console.log(c.red('✖ missing: ') + missing.join(', '))
  console.log(
    c.dim(
      'Refresh with npm run bot:sync — the compiler runs in the source repo.\n' +
        'Never edit these files by hand: npm run bot:verify (CI) fails on drift.\n'
    )
  )
}

function pythonFor() {
  if (BOT_SYNC.python) return BOT_SYNC.python
  const venv = path.join(SOURCE, '.venv', 'bin', 'python')
  return fs.existsSync(venv) ? venv : 'python3'
}

function cmdSync(args) {
  const dryRun = Boolean(args.flags['dry-run'])
  if (!fs.existsSync(SOURCE)) {
    fail(
      `Chatbot compiler repository not found: ${SOURCE}\n` +
        `Set it with BOT_SOURCE=/path/to/personal-chatbots, or edit BOT_SYNC.source in src/site.mjs.`
    )
  }

  const python = pythonFor()
  // This is the compiler's documented invocation. It also refreshes the
  // source repo's own web/data.json — a build artifact, gitignored there.
  const argv = ['-m', 'personal_chatbots', 'export', '--bundle', OUT]

  console.log()
  console.log(c.bold(dryRun ? 'Bot sync (dry run)' : 'Bot sync') + c.dim(`  ← ${SOURCE}`))
  console.log(c.dim(`  ${python} ${argv.join(' ')}`))
  console.log()

  if (dryRun) {
    const manifest = readJSON(MANIFEST_PATH, null)
    console.log(
      c.dim(
        manifest
          ? `  would refresh ${bundleFiles().length} file(s); last sync ${manifest.generatedAt}`
          : `  would write ${BOT_SYNC.files.length} file(s) into ${rel(OUT)}`
      )
    )
    console.log(c.cyan('\nDry run — nothing was written.\n'))
    return
  }

  const before = readJSON(MANIFEST_PATH, null)?.files || {}
  try {
    execFileSync(python, argv, { cwd: SOURCE, stdio: 'inherit' })
  } catch (error) {
    fail(
      `The compiler failed in ${SOURCE}.\n` +
        `Check that it is installed there (python3 -m venv .venv && pip install -e ".[test]") ` +
        `and that data/bot.db exists.\n${error.message}`
    )
  }

  const files = {}
  for (const name of BOT_SYNC.files) {
    const file = path.join(OUT, name)
    if (!fs.existsSync(file)) fail(`The compiler did not write ${rel(file)}`)
    const content = fs.readFileSync(file)
    files[name] = { size: content.length, sha256: sha256(content) }
  }

  const data = readJSON(path.join(OUT, 'data.json'), {})
  const manifest = {
    generatedAt: new Date().toISOString(),
    source: SOURCE,
    compiler: `${path.basename(python)} ${argv.join(' ')}`,
    files,
    bundle: {
      generatedAt: data.generated_at || null,
      knowledge: (data.knowledge || []).length,
      entities: (data.entities || []).length,
      links: (data.links || []).length,
      documents: (data.documents || []).length,
      tests: (data.tests || []).length,
      name: data.bot?.name || null,
      level: data.bot?.level ?? null,
    },
  }
  writeJSON(MANIFEST_PATH, manifest)

  for (const name of BOT_SYNC.files) {
    const tag = !before[name]
      ? c.green('new    ')
      : before[name].sha256 === files[name].sha256
        ? c.dim('same   ')
        : c.yellow('updated')
    console.log(`  ${tag}  ${name.padEnd(13)} ${kb(files[name].size).padStart(8)}`)
  }
  console.log()
  console.log(c.dim(`  ${describeManifest(manifest)}`))
  console.log(c.dim(`  manifest → ${rel(MANIFEST_PATH)}`))
  console.log(
    c.green(`\n✔ Bundle refreshed in ${rel(OUT)}`) +
      c.dim('\n  Commit it with the site: the deploy build has no access to the compiler repo.\n')
  )
}

function cmdVerify() {
  const manifest = readJSON(MANIFEST_PATH, null)
  const onDisk = bundleFiles()

  if (!manifest) {
    console.log()
    if (!onDisk.length) {
      console.log(c.green('✔ No chatbot bundle committed — nothing to verify.\n'))
      return
    }
    fail(
      `${onDisk.length} file(s) in ${rel(OUT)} but no manifest at ${rel(MANIFEST_PATH)}.\n` +
        `Run npm run bot:sync to regenerate both.`
    )
  }

  const recorded = manifest.files || {}
  const drift = []
  for (const [name, entry] of Object.entries(recorded)) {
    const file = path.join(OUT, name)
    if (!fs.existsSync(file)) {
      drift.push(`${BOT_SYNC.outDir}/${name}: missing`)
      continue
    }
    const hash = sha256(fs.readFileSync(file))
    if (hash !== entry.sha256) drift.push(`${BOT_SYNC.outDir}/${name}: edited by hand`)
    else if (fs.statSync(file).size !== entry.size) {
      drift.push(`${BOT_SYNC.outDir}/${name}: size changed`)
    }
  }
  for (const name of onDisk) {
    if (!recorded[name]) drift.push(`${BOT_SYNC.outDir}/${name}: not produced by sync`)
  }

  console.log()
  console.log(
    c.bold('Chatbot integrity: ') +
      `${Object.keys(recorded).length} file(s) recorded ${c.dim(`(last sync ${manifest.generatedAt})`)}`
  )
  console.log(c.dim('  ' + describeManifest(manifest)))
  if (!drift.length) {
    console.log(c.green('✔ public/bot matches the manifest.\n'))
    return
  }
  console.log()
  for (const d of drift) console.log('  ' + c.red('✖ ') + d)
  console.log(
    '\n' +
      c.yellow(
        'public/bot is generated by the compiler in the chatbot repository.\n' +
          'Change the content there, then run npm run bot:sync.\n'
      )
  )
  process.exit(1)
}

// ----------------------------------------------------------------------- main

const COMMANDS = {
  status: cmdStatus,
  sync: cmdSync,
  verify: cmdVerify,
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const command = args._.shift() || 'status'
  const run = COMMANDS[command]
  if (!run) fail(`Unknown command "${command}". Use one of: ${Object.keys(COMMANDS).join(', ')}`)
  run(args)
}

main()
