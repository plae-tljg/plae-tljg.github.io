#!/usr/bin/env node
/**
 * content.mjs — the bridge between the private writing workspace and this site.
 *
 *   npm run content:status              show every article in the writing workspace
 *   npm run content:sync                copy `ready` articles into src/content/posts
 *   npm run content:sync -- --preview   also copy in-progress drafts (marked as preview)
 *   npm run content:sync -- --dry-run   show what would change, write nothing
 *   npm run content:new -- --key foo    scaffold a new article following the convention
 *   npm run content:verify              check the repo still matches the last sync (CI)
 *
 * The writing workspace is never modified by `sync` — this script only reads it.
 * Convention reference: docs/CONTENT_CONVENTION.md
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { CONTENT_SYNC, SERIES, TRACKS, DEFAULT_LOCALE, LOCALES } from '../src/site.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LOCALE_CODES = LOCALES.map((l) => l.code)

// ---------------------------------------------------------------- tiny helpers

const c = {
  dim: (s) => wrap('\x1b[2m', s),
  bold: (s) => wrap('\x1b[1m', s),
  red: (s) => wrap('\x1b[31m', s),
  green: (s) => wrap('\x1b[32m', s),
  yellow: (s) => wrap('\x1b[33m', s),
  blue: (s) => wrap('\x1b[34m', s),
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
function sha256(input) {
  return 'sha256:' + crypto.createHash('sha256').update(input).digest('hex').slice(0, 16)
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
function toDateString(value) {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const s = String(value).trim()
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? m[0] : s
}
function pad(n, width = 2) {
  return String(n).padStart(width, '0')
}

// ------------------------------------------------------------ argument parsing

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

// --------------------------------------------------------------- source scan

const SOURCE_ROOT = path.resolve(expandHome(CONTENT_SYNC.source))
const MANIFEST_PATH = path.join(ROOT, CONTENT_SYNC.manifest)

function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')
  return new RegExp(`^${escaped}$`)
}
const IGNORE_RES = CONTENT_SYNC.ignoreFiles.map(globToRegExp)

function isIgnoredFile(name) {
  if (name.startsWith(CONTENT_SYNC.ignorePrefix)) return true
  return IGNORE_RES.some((re) => re.test(name))
}

function walk(dir, out = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (CONTENT_SYNC.excludeDirs.includes(entry.name)) continue
      if (entry.name.startsWith('.')) continue
      walk(full, out)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (!isIgnoredFile(entry.name)) out.push(full)
    }
  }
  return out
}

function seriesById(id) {
  return SERIES.find((s) => s.id === id)
}

function resolveSeriesId(raw) {
  if (!raw) return undefined
  const value = String(raw).trim()
  const direct = seriesById(value)
  if (direct) return direct.id
  const byAlias = SERIES.find((s) => (s.aliases || []).some((a) => a.toLowerCase() === value.toLowerCase()))
  return byAlias ? byAlias.id : undefined
}

/** Read one source file into the normalized shape the site uses. */
function readArticle(absPath) {
  const raw = fs.readFileSync(absPath, 'utf8')
  let data, content
  try {
    ;({ data, content } = matter(raw))
  } catch (error) {
    // One stray character in the frontmatter used to abort the whole run with a
    // YAML stack trace and no file name. Say which file, and why.
    const reason = error.reason || error.message
    const line = error.mark ? ` (line ${error.mark.line + 1}, column ${error.mark.column + 1})` : ''
    fail(
      `${path.relative(SOURCE_ROOT, absPath)}: frontmatter does not parse${line}\n` +
        `  ${reason}\n` +
        `  Fix the YAML in the writing workspace — until then this file cannot be published.`
    )
  }
  const base = path.basename(absPath)
  const relPath = path.relative(SOURCE_ROOT, absPath)

  // language from the file suffix: <key>.zh.md / <key>.en.md
  const langMatch = base.match(/\.([a-z]{2})\.md$/)
  const lang = langMatch && LOCALE_CODES.includes(langMatch[1]) ? langMatch[1] : CONTENT_SYNC.defaultLang
  const stem = langMatch ? base.slice(0, -langMatch[0].length) : base.replace(/\.md$/, '')

  // order from a leading number in the file name: 03-why-ai-takes-over
  const orderMatch = stem.match(/^(\d+)[-_.\s]/)
  const seriesOrder = data.seriesOrder ?? data.order ?? (orderMatch ? Number(orderMatch[1]) : undefined)
  const key = data.translationKey || stem.replace(/^\d+[-_.\s]+/, '')

  const title = data[`title${lang === 'zh' ? 'Zh' : 'En'}`] || data.title
  const summary = data[`summary${lang === 'zh' ? 'Zh' : 'En'}`] || data.summary || ''

  return {
    absPath,
    relPath,
    lang,
    key,
    stem,
    seriesId: resolveSeriesId(data.series),
    seriesRaw: data.series,
    seriesOrder,
    partLabel: data.part,
    order: typeof data.order === 'number' ? data.order : seriesOrder,
    title,
    summary,
    date: toDateString(data.date),
    updated: toDateString(data.updated),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    status: String(data.status || 'idea').trim(),
    canonical: data.canonical || undefined,
    confidentialityChecked: data.confidentialityChecked,
    body: content.trim(),
    rawHash: sha256(raw),
    dir: path.dirname(relPath),
  }
}

function trackById(id) {
  return TRACKS.find((t) => t.id === id)
}

function stageRank(trackId, stageId) {
  const track = trackById(trackId)
  if (!track) return 99
  const index = (track.stages || []).findIndex((s) => s.id === stageId)
  return index === -1 ? 99 : index
}

function scanSource() {
  if (!fs.existsSync(SOURCE_ROOT)) {
    fail(
      `Writing workspace not found: ${SOURCE_ROOT}\n` +
        `Set it with CONTENT_SOURCE=/path/to/workspace, or edit CONTENT_SYNC.source in src/site.mjs.`
    )
  }
  const files = []
  for (const dir of CONTENT_SYNC.include) {
    const abs = path.join(SOURCE_ROOT, dir)
    if (fs.existsSync(abs)) walk(abs, files)
  }
  const articles = files.map(readArticle).filter((a) => a.title)
  const untitled = files.length - articles.length
  articles.sort((a, b) => {
    // series first, then tracks; inside each, registry order then page order
    const group = (x) => (x.track ? 1 : 0)
    if (group(a) !== group(b)) return group(a) - group(b)
    if (a.track && b.track) {
      const byTrack =
        TRACKS.findIndex((t) => t.id === a.track) - TRACKS.findIndex((t) => t.id === b.track)
      if (byTrack) return byTrack
      const byStage = stageRank(a.track, a.stage) - stageRank(b.track, b.stage)
      if (byStage) return byStage
    } else {
      const bySeries =
        (seriesById(a.seriesId)?.order ?? 99) - (seriesById(b.seriesId)?.order ?? 99)
      if (bySeries) return bySeries
    }
    return (
      (a.order ?? a.seriesOrder ?? 999) - (b.order ?? b.seriesOrder ?? 999) ||
      a.key.localeCompare(b.key) ||
      a.lang.localeCompare(b.lang)
    )
  })
  return { articles, untitled, fileCount: files.length }
}

function fail(message) {
  console.error('\n' + c.red('✖ ') + message + '\n')
  process.exit(1)
}

// ------------------------------------------------------------ body transforms

const IMAGE_RE = /(!?\[[^\]]*\]\()([^)\s]+)(\s+"[^"]*")?(\))/g
const HTML_IMAGE_RE = /(<img[^>]+src=["'])([^"']+)(["'])/g

function copyAsset(srcFile, ref, key, copies) {
  const abs = path.resolve(path.dirname(srcFile), decodeURIComponent(ref))
  if (!fs.existsSync(abs)) return { missing: true, ref }
  const ext = path.extname(abs)
  const stem = path.basename(abs, ext).replace(/[^\w.-]+/g, '-')
  const content = fs.readFileSync(abs)
  const hash = sha256(content).slice(7, 13)
  const name = `${stem}-${hash}${ext}`
  const outAbs = path.join(ROOT, CONTENT_SYNC.assetDir, key, name)
  copies.push({ outAbs, content })
  return { url: `${CONTENT_SYNC.assetUrlBase}/${key}/${name}` }
}

/** Rewrite relative image links to copied assets; strip a leading H1. */
function normalizeBody(article, copies, warnings) {
  let body = article.body

  // The layout renders the title, so drop the article's own top-level H1.
  body = body.replace(/^#\s+.*\r?\n+/, '')

  const rewrite = (match, pre, ref, title, post) => {
    if (/^(https?:)?\/\//.test(ref) || ref.startsWith('/') || ref.startsWith('data:')) return match
    const result = copyAsset(article.absPath, ref, article.key, copies)
    if (result.missing) {
      warnings.push(`${article.relPath}: image not found → ${ref}`)
      return match
    }
    return `${pre}${result.url}${title || ''}${post}`
  }

  body = body.replace(IMAGE_RE, rewrite)
  body = body.replace(HTML_IMAGE_RE, (m, pre, ref, post) => {
    const r = rewrite(m, pre, ref, '', post)
    return r
  })

  return body.replace(/\s+$/, '') + '\n'
}

// ------------------------------------------------------------- output writing

/**
 * Where an article's synced copy lives. Guide pages under src/content/docs are
 * hand-written and are deliberately *not* produced here — one directory, one
 * owner.
 */
function outputPathFor(article) {
  // One folder per series, so the directory listing reads like the site does.
  // Standalone articles stay at the top level.
  const dir = article.seriesId
    ? path.join(CONTENT_SYNC.outputDir, article.lang, article.seriesId)
    : path.join(CONTENT_SYNC.outputDir, article.lang)
  return path.join(dir, `${article.key}.md`)
}

/**
 * "03 Why AI Takes Over Mathematics"
 *
 * A series part carries its position in its title. The series page can show an
 * order column, but a title travels further than a page does: into the archive,
 * the RSS feed, a search result, a browser tab, someone's notes. The number is
 * the only part of "where am I in this series" that survives all of them.
 */
function numberedTitle(title, order) {
  const number = String(order).padStart(2, '0')
  return String(title).startsWith(number) ? String(title) : `${number} ${title}`
}

function buildOutput(article, options, previousEntry, warnings) {
  const copies = []
  const body = normalizeBody(article, copies, warnings)
  const syncedAt =
    previousEntry && previousEntry.sourceHash === article.rawHash
      ? previousEntry.syncedAt
      : new Date().toISOString()

  const titled =
    article.seriesId && article.seriesOrder !== undefined && article.seriesOrder !== null
      ? numberedTitle(article.title, article.seriesOrder)
      : article.title

  const frontmatter = {
    title: titled,
    summary: article.summary || '',
    lang: article.lang,
    translationKey: article.key,
    slug: article.key,
    date: article.date || new Date().toISOString().slice(0, 10),
  }
  if (article.updated) frontmatter.updated = article.updated
  if (article.seriesId) frontmatter.series = article.seriesId
  if (article.seriesOrder !== undefined && article.seriesOrder !== null) {
    frontmatter.seriesOrder = article.seriesOrder
  }
  if (article.partLabel) frontmatter.partLabel = article.partLabel
  frontmatter.tags = article.tags
  frontmatter.status = options.preview ? 'preview' : 'ready'
  if (article.canonical) frontmatter.canonical = article.canonical
  frontmatter.source = article.relPath
  frontmatter.syncedAt = syncedAt

  const file = matter.stringify(body, frontmatter)
  const outputPath = outputPathFor(article)
  return {
    file,
    outputPath,
    copies,
    entry: {
      key: article.key,
      lang: article.lang,
      title: titled,
      series: article.seriesId || null,
      status: frontmatter.status,
      sourcePath: article.relPath,
      sourceHash: article.rawHash,
      outputPath,
      outputHash: sha256(file),
      syncedAt,
    },
  }
}

// ------------------------------------------------------------------- commands

function selectArticles(articles, options) {
  const allowed = options.preview
    ? [...CONTENT_SYNC.publishStatuses, ...CONTENT_SYNC.previewStatuses]
    : [...CONTENT_SYNC.publishStatuses]
  const selected = []
  const skipped = []
  for (const a of articles) {
    if (options.only && a.key !== options.only) {
      skipped.push([a, 'not selected (--only)'])
      continue
    }
    if (!allowed.includes(a.status)) {
      skipped.push([a, `status: ${a.status}`])
      continue
    }
    if (!options.force && a.confidentialityChecked === false) {
      skipped.push([a, 'confidentialityChecked is false'])
      continue
    }
    if (!a.summary) skipped.push([a, 'missing summary (published anyway)'])
    selected.push(a)
  }
  return { selected, skipped }
}

function cmdStatus(args) {
  const { articles, fileCount } = scanSource()
  const manifest = readJSON(MANIFEST_PATH, { entries: [] })
  const published = new Set((manifest.entries || []).map((e) => `${e.lang}:${e.key}`))

  console.log()
  console.log(c.bold('Writing workspace: ') + SOURCE_ROOT)
  console.log(
    c.dim(
      `${fileCount} markdown files scanned · ${articles.length} articles · ` +
        `publishing statuses: ${CONTENT_SYNC.publishStatuses.join(', ')}`
    )
  )
  console.log()

  const groups = new Map()
  for (const a of articles) {
    const id = a.track
      ? `${a.track}/${a.stage || '-'}`
      : a.seriesId || '(no series)'
    if (!groups.has(id)) groups.set(id, [])
    groups.get(id).push(a)
  }

  const groupOrder = (key) => {
    const [trackId] = key.split('/')
    const track = trackById(trackId)
    if (track) return track.order ?? TRACKS.findIndex((t) => t.id === trackId)
    return 50 + (seriesById(key)?.order ?? 99)
  }

  for (const [groupId, list] of [...groups.entries()].sort(
    (a, b) => groupOrder(a[0]) - groupOrder(b[0])
  )) {
    const [trackId, stageId] = groupId.split('/')
    const track = trackById(trackId)
    const series = seriesById(groupId)
    let heading
    if (track) {
      const stage = (track.stages || []).find((s) => s.id === stageId)
      heading =
        `${track.title.zh}` +
        (stage ? ` · ${stage.title.zh}` : '') +
        `  ${c.dim(`[${groupId}]`)}`
    } else {
      heading = series ? `${series.title.zh}  ${c.dim(`[${series.id}]`)}` : c.dim(groupId)
    }
    console.log(c.bold(heading))
    for (const a of list) {
      const mark = published.has(`${a.lang}:${a.key}`) ? c.green('●') : c.dim('○')
      const order = a.order ?? a.seriesOrder
      const orderLabel = order === undefined ? '  ' : pad(order) + ''
      const status = statusColor(a.status)(a.status.padEnd(10))
      const lang = c.cyan(a.lang)
      console.log(`  ${mark} ${orderLabel}  ${lang}  ${status}  ${truncate(a.title, 46)}`)
    }
    console.log()
  }

  const counts = {}
  for (const a of articles) counts[a.status] = (counts[a.status] || 0) + 1
  console.log(
    c.dim('By status: ') +
      Object.entries(counts)
        .map(([s, n]) => `${s} ${c.bold(n)}`)
        .join(c.dim(' · '))
  )
  console.log(c.dim('● = currently published on the site   ○ = not published'))
  console.log()
}

function statusColor(status) {
  if (status === 'ready') return c.green
  if (CONTENT_SYNC.previewStatuses.includes(status)) return c.yellow
  return c.dim
}

/** Every .md under a directory, recursively. */
function walkMarkdown(dir) {
  const out = []
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name)
    if (item.isDirectory()) out.push(...walkMarkdown(full))
    else if (item.name.endsWith('.md')) out.push(full)
  }
  return out
}

function truncate(s, n) {
  const chars = [...String(s)]
  return chars.length <= n ? s : chars.slice(0, n - 1).join('') + '…'
}

function cmdSync(args) {
  const options = {
    preview: Boolean(args.flags.preview),
    dryRun: Boolean(args.flags['dry-run']),
    force: Boolean(args.flags.force),
    only: typeof args.flags.only === 'string' ? args.flags.only : undefined,
  }
  const { articles } = scanSource()
  const manifest = readJSON(MANIFEST_PATH, { entries: [] })
  const previous = new Map((manifest.entries || []).map((e) => [e.outputPath, e]))

  const { selected, skipped } = selectArticles(articles, options)
  const warnings = []
  const outputs = []
  const seen = new Set()

  for (const article of selected) {
    const prev = previous.get(outputPathFor(article))
    const built = buildOutput(article, options, prev, warnings)
    if (seen.has(built.outputPath)) {
      fail(`Two source files map to the same output: ${built.outputPath}`)
    }
    seen.add(built.outputPath)

    const exists = fs.existsSync(path.join(ROOT, built.outputPath))
    if (exists && !prev && !options.force) {
      fail(
        `Refusing to overwrite ${built.outputPath}: the file exists but is not managed by sync.\n` +
          `Move it out of ${path.dirname(built.outputPath)}, or re-run with --force.`
      )
    }
    const current = exists ? fs.readFileSync(path.join(ROOT, built.outputPath), 'utf8') : null
    built.changed = current !== built.file
    built.isNew = !exists
    outputs.push(built)
  }

  const stale = (manifest.entries || []).filter(
    (e) => !outputs.some((o) => o.outputPath === e.outputPath)
  )

  // Safety valve: pointing sync at a different workspace would otherwise look
  // like "every article was unpublished" and delete the whole site content.
  if (
    stale.length > 0 &&
    manifest.source &&
    path.resolve(manifest.source) !== SOURCE_ROOT &&
    !options.force &&
    !options.dryRun
  ) {
    fail(
      `The last sync came from ${manifest.source}, but this run reads ${SOURCE_ROOT}.\n` +
        `That would remove ${stale.length} published article(s). Re-run with --force if this is intended.`
    )
  }

  // Second valve: a source *directory* that disappears (moved, renamed, or
  // wiped because it was never committed) looks exactly like "all of it was
  // unpublished". Losing a third of the site in one run is not a status change.
  const publishedCount = (manifest.entries || []).length
  if (
    !options.force &&
    !options.dryRun &&
    publishedCount >= 4 &&
    stale.length > Math.floor(publishedCount / 3)
  ) {
    fail(
      `${stale.length} of ${publishedCount} published file(s) would be removed.\n` +
        `That usually means a source directory moved or was deleted, not that you unpublished them.\n` +
        `Check the writing workspace (CONTENT_SOURCE=${SOURCE_ROOT}), or re-run with --force.`
    )
  }

  // ---- report
  const changed = outputs.filter((o) => o.changed)
  console.log()
  console.log(
    c.bold(options.preview ? 'Sync (preview mode)' : 'Sync') +
      c.dim(`  ← ${SOURCE_ROOT}`)
  )
  console.log()

  for (const o of outputs) {
    const tag = o.isNew ? c.green('new    ') : o.changed ? c.yellow('updated') : c.dim('same   ')
    console.log(`  ${tag}  ${o.entry.lang}  ${o.entry.key}`)
  }
  for (const [a, reason] of skipped) {
    console.log(`  ${c.dim('skipped')}  ${a.lang}  ${a.key} ${c.dim(`(${reason})`)}`)
  }
  for (const s of stale) {
    console.log(`  ${c.red('removed')}  ${s.lang}  ${s.key} ${c.dim('(no longer publishable)')}`)
  }
  for (const w of warnings) console.log('  ' + c.yellow('! ') + w)

  console.log()
  console.log(
    c.dim(
      `${outputs.length} article(s): ${changed.length} changed, ${outputs.length - changed.length} unchanged · ` +
        `${skipped.length} skipped · ${stale.length} removed`
    )
  )

  if (options.dryRun) {
    console.log(c.cyan('\nDry run — nothing was written.\n'))
    return
  }

  // ---- write
  for (const o of outputs) {
    if (!o.changed) continue
    const target = path.join(ROOT, o.outputPath)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, o.file)
    for (const copy of o.copies) {
      fs.mkdirSync(path.dirname(copy.outAbs), { recursive: true })
      fs.writeFileSync(copy.outAbs, copy.content)
    }
  }
  for (const s of stale) {
    const target = path.join(ROOT, s.outputPath)
    if (fs.existsSync(target)) fs.rmSync(target)
    removeEmptyDirs(path.dirname(target))
  }

  writeJSON(MANIFEST_PATH, {
    generatedAt: new Date().toISOString(),
    source: SOURCE_ROOT,
    preview: options.preview,
    entries: outputs.map((o) => o.entry),
  })

  console.log(c.green(`\n✔ Wrote ${changed.length} file(s) to ${CONTENT_SYNC.outputDir}\n`))
  if (options.preview && changed.length) {
    console.log(c.dim('   Preview articles carry a badge and stay out of RSS/sitemap.\n'))
  }
}

function removeEmptyDirs(dir) {
  try {
    if (fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir)
      removeEmptyDirs(path.dirname(dir))
    }
  } catch {
    /* ignore */
  }
}

function cmdVerify() {
  const manifest = readJSON(MANIFEST_PATH, null)
  const managedDirs = [CONTENT_SYNC.outputDir]
  const onDisk = []
  for (const managedDir of managedDirs) {
    for (const lang of LOCALE_CODES) {
      const dir = path.join(ROOT, managedDir, lang)
      if (!fs.existsSync(dir)) continue
      for (const f of walkMarkdown(dir)) onDisk.push(f)
    }
  }

  if (!manifest) {
    console.log()
    if (onDisk.length === 0) {
      console.log(c.green('✔ No synced content yet — nothing to verify.\n'))
      return
    }
    fail(
      `Found ${onDisk.length} file(s) in ${CONTENT_SYNC.outputDir} but no manifest at ` +
        `${rel(MANIFEST_PATH)}.\nRun npm run content:sync to regenerate it.`
    )
  }

  const drift = []
  for (const entry of manifest.entries || []) {
    const abs = path.join(ROOT, entry.outputPath)
    if (!fs.existsSync(abs)) {
      drift.push(`${entry.outputPath}: missing`)
      continue
    }
    const hash = sha256(fs.readFileSync(abs, 'utf8'))
    if (hash !== entry.outputHash) drift.push(`${entry.outputPath}: edited by hand`)
  }
  // orphan files in the managed tree that sync never produced
  const managed = new Set((manifest.entries || []).map((e) => path.join(ROOT, e.outputPath)))
  for (const abs of onDisk) {
    if (!managed.has(abs)) drift.push(`${rel(abs)}: not produced by sync`)
  }

  console.log()
  console.log(
    c.bold('Content integrity: ') +
      `${(manifest.entries || []).length} synced file(s) recorded ${c.dim(
        `(last sync ${manifest.generatedAt})`
      )}`
  )
  if (!drift.length) {
    console.log(c.green('✔ Everything matches the manifest.\n'))
    return
  }
  console.log()
  for (const d of drift) console.log('  ' + c.red('✖ ') + d)
  console.log(
    '\n' +
      c.yellow(
        'Synced files are generated — edit the article in the writing workspace, then re-run sync.\n'
      )
  )
  process.exit(1)
}

function cmdNew(args) {
  const key = typeof args.flags.key === 'string' ? args.flags.key : args._[0]
  if (!key) fail('Usage: npm run content:new -- --key <translation-key> [--series <id>] [--lang zh|en] [--order 3] [--both]')
  if (!/^[a-z0-9][a-z0-9-]*$/.test(key)) fail('--key must be lowercase letters, digits and dashes, e.g. wake-the-ai-less')

  const seriesId = args.flags.series ? resolveSeriesId(args.flags.series) : undefined
  if (args.flags.series && !seriesId) {
    fail(`Unknown series "${args.flags.series}". Known: ${SERIES.map((s) => s.id).join(', ')}`)
  }
  const series = seriesById(seriesId)
  const langs = args.flags.both ? ['zh', 'en'] : [String(args.flags.lang || DEFAULT_LOCALE)]
  for (const l of langs) if (!LOCALE_CODES.includes(l)) fail(`Unsupported language "${l}"`)

  const order = args.flags.order !== undefined ? Number(args.flags.order) : undefined
  const dir = path.join(SOURCE_ROOT, series?.dir || 'drafts')
  const created = []

  for (const lang of langs) {
    const name = `${order !== undefined ? pad(order) + '-' : ''}${key}.${lang}.md`
    const target = path.join(dir, name)
    if (fs.existsSync(target)) fail(`${rel(target)} already exists — not overwriting.`)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(target, newArticleTemplate({ key, lang, series, order }))
    created.push(target)
  }

  console.log()
  for (const f of created) console.log('  ' + c.green('created ') + rel(f))
  console.log(
    '\n' +
      c.dim('Write the draft, set status to ready when it is publishable, then:\n') +
      c.dim('  npm run content:status\n  npm run content:sync\n')
  )
}

function newArticleTemplate({ key, lang, series, order }) {
  const zh = lang === 'zh'
  const placeholder = key.replace(/-/g, ' ')
  const frontmatter = {
    translationKey: key,
    titleZh: zh ? placeholder : '',
    titleEn: zh ? '' : placeholder,
    summaryZh: '',
    summaryEn: '',
    date: new Date().toISOString().slice(0, 10),
    ...(series ? { series: series.title.en } : {}),
    ...(order !== undefined ? { order } : {}),
    part: '',
    tags: [],
    status: 'outline',
    languagePair: ['zh', 'en'],
    canonical: '',
    publicProof: [],
    confidentialityChecked: false,
  }
  const body = zh
    ? `# 标题\n\n## 1. 开场：问题是什么\n\n## 2. 核心论点\n\n## 3. 具体案例 / 数据结构\n\n## 4. 为什么这样设计\n\n## 5. 局限与反模式\n\n## 6. 落地清单\n\n## 7. 收尾与下一篇预告\n`
    : `# Title\n\n## 1. The Problem\n\n## 2. The Core Idea\n\n## 3. A Concrete Example\n\n## 4. Why This Works\n\n## 5. Limits and Anti-Patterns\n\n## 6. Implementation Checklist\n\n## 7. Conclusion and What Comes Next\n`
  return matter.stringify(body, frontmatter)
}

// ----------------------------------------------------------------------- main

const COMMANDS = {
  status: cmdStatus,
  sync: cmdSync,
  verify: cmdVerify,
  new: cmdNew,
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const command = args._.shift() || 'status'
  const run = COMMANDS[command]
  if (!run) {
    fail(`Unknown command "${command}". Use one of: ${Object.keys(COMMANDS).join(', ')}`)
  }
  run(args)
}

main()
