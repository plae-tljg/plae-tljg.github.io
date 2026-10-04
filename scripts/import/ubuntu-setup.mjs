#!/usr/bin/env node
/**
 * Import `plae-lkm/ubuntu_setup` into this site — one-shot, kept for provenance.
 *
 * The source is a VuePress site being frozen: its writing-workspace equivalent
 * never existed, so (like the learning path) this content is *hand-written here*
 * after import. Nothing syncs it; re-running this script is the only thing that
 * overwrites it, and that is deliberate — the mapping below is the judgement,
 * and it is reviewed like content.
 *
 *   node scripts/import/ubuntu-setup.mjs --source /tmp/ubsetup/repo [--dry-run]
 *
 * What it converts:
 *   - the leading H1 becomes the page title (the layout renders it)
 *   - <CodeViewer filePath="/lib/x"> inlines the referenced file as a fenced
 *     code block: the viewer was a runtime file fetch, which has no equivalent
 *   - <ReferenceViewer> becomes a link to the archived third-party page (the
 *     originals are extracted from each snapshot's canonical URL)
 *   - internal links between guides are rewritten to the new routes
 *   - images are copied to public/ubuntu/ and rewritten
 *   - LAN addresses are scrubbed to documentation examples
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const value = (name, fallback = '') => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}

const SOURCE = value('source', '/tmp/ubsetup/repo')
const SRC_DOCS = path.join(SOURCE, 'docs')
const SRC_PUBLIC = path.join(SRC_DOCS, '.vuepress', 'public')
const OUT_DOCS = path.join(ROOT, 'src/content/docs')
const OUT_IMAGES = path.join(ROOT, 'public/ubuntu')
const DRY = flag('dry-run')

/** The date the source material was last real (repo's last push). */
const IMPORT_DATE = '2026-01-04'

/**
 * Source path → destination. One row per source file; anything not listed is
 * not published. `index: true` marks the stage's own landing page.
 */
const MAP = [
  // ---- ubuntu · base: installation and disks -----------------------------
  ['dev/headless.md', 'ubuntu', 'base', 'headless', 1, {}],
  ['dev/multiple_ssds.md', 'ubuntu', 'base', 'multiple-ssds', 2, {}],

  // ---- ubuntu · apps: what gets installed --------------------------------
  // The App Deck (~70 installed apps, 10 tables) is the natural landing page.
  ['utils/structure/README.md', 'ubuntu', 'apps', 'index', 0, { index: true, title: 'Ubuntu 应用清单' }],
  ['apps/common/quick_apps.md', 'ubuntu', 'apps', 'quick-install', 1, {}],
  ['apps/common/browsers.md', 'ubuntu', 'apps', 'browsers', 2, {}],
  ['apps/common/firefox.md', 'ubuntu', 'apps', 'firefox', 3, {}],
  ['apps/common/editors.md', 'ubuntu', 'apps', 'editors', 4, {}],
  ['apps/common/ide.md', 'ubuntu', 'apps', 'ide', 5, {}],
  ['apps/common/image_editors.md', 'ubuntu', 'apps', 'image-editors', 6, {}],
  ['apps/common/audio.md', 'ubuntu', 'apps', 'audio', 7, {}],
  ['apps/common/multimedia.md', 'ubuntu', 'apps', 'multimedia', 8, {}],
  ['apps/common/office.md', 'ubuntu', 'apps', 'office', 9, {}],
  ['apps/common/games.md', 'ubuntu', 'apps', 'games', 10, {}],
  ['apps/common/network.md', 'ubuntu', 'apps', 'network-tools', 11, {}],
  ['apps/common/database.md', 'ubuntu', 'apps', 'database-tools', 12, {}],
  ['apps/common/dev_tools.md', 'ubuntu', 'apps', 'dev-tools', 13, {}],
  ['apps/common/system.md', 'ubuntu', 'apps', 'system-tools', 14, {}],
  ['apps/common/user_config.md', 'ubuntu', 'apps', 'user-config', 15, {}],
  ['apps/common/vm/virtual_machines.md', 'ubuntu', 'apps', 'virtual-machines', 16, {}],
  ['apps/common/vm/kvm_qemu.md', 'ubuntu', 'apps', 'kvm-qemu', 17, {}],
  ['apps/common/old/sogou_input.md', 'ubuntu', 'apps', 'sogou-input', 18, { note: '已过时' }],

  // ---- ubuntu · gpu ------------------------------------------------------
  ['apps/gpu/cuda.md', 'ubuntu', 'gpu', 'cuda', 1, {}],
  // Kept in the docs as well as queued as an article: cuda.md links to it, and
  // the post-mortem is the operational half of that story.
  ['apps/gpu/old_igpu_problems.md', 'ubuntu', 'gpu', 'igpu-postmortem', 2, { title: '旧版 iGPU 问题记录（复盘）' }],

  // ---- ubuntu · remote: getting into the machine -------------------------
  ['dev/ssh/README.md', 'ubuntu', 'remote', 'index', 0, { index: true }],
  ['dev/ssh/basics.md', 'ubuntu', 'remote', 'basics', 1, {}],
  ['dev/ssh/authentication.md', 'ubuntu', 'remote', 'authentication', 2, {}],
  ['dev/ssh/sftp.md', 'ubuntu', 'remote', 'sftp', 3, {}],
  ['dev/ssh/proxy_jump.md', 'ubuntu', 'remote', 'proxy-jump', 4, {}],
  ['dev/ssh/android_access.md', 'ubuntu', 'remote', 'android-access', 5, {}],

  // ---- ubuntu · net ------------------------------------------------------
  ['dev/internet/static_ip.md', 'ubuntu', 'net', 'static-ip', 1, {}],
  ['dev/https.md', 'ubuntu', 'net', 'local-https', 2, {}],
  ['dev/internet/wifi_reconnect.md', 'ubuntu', 'net', 'wifi-reconnect', 3, { note: 'Windows 端' }],

  // ---- ubuntu · shell: commands and configuration ------------------------
  ['utils/structure/common_dir.md', 'ubuntu', 'shell', 'common-dirs', 1, {}],
  ['utils/common_cmd/bash_tricks.md', 'ubuntu', 'shell', 'bash-tricks', 2, {}],
  ['utils/common_cmd/README.md', 'ubuntu', 'shell', 'systemd', 3, { title: 'systemd 常用命令' }],
  ['utils/common_cmd/audio_cmd.md', 'ubuntu', 'shell', 'audio-cmd', 4, {}],
  ['utils/common_cmd/reboot_router.md', 'ubuntu', 'shell', 'reboot-router', 5, {}],
  ['utils/common_cmd/send_email.md', 'ubuntu', 'shell', 'send-email', 6, {}],
  ['utils/user_config/code_highlight.md', 'ubuntu', 'shell', 'code-highlight', 7, {}],
  ['utils/user_config/cursor_style.md', 'ubuntu', 'shell', 'cursor-style', 8, {}],
  ['utils/interesting_cmd/README.md', 'ubuntu', 'shell', 'fun-commands', 9, {}],
  ['utils/useful_links.md', 'ubuntu', 'shell', 'links', 10, {}],

  // ---- homelab · services ------------------------------------------------
  ['dev/asterisk/README.md', 'homelab', 'services', 'index', 0, { index: true }],
  ['dev/asterisk/basics.md', 'homelab', 'services', 'asterisk-basics', 1, {}],
  ['dev/asterisk/trunk_config.md', 'homelab', 'services', 'asterisk-trunk', 2, {}],
  ['dev/asterisk/audio.md', 'homelab', 'services', 'asterisk-audio', 3, {}],
  ['apps/db/psql.md', 'homelab', 'services', 'postgresql', 4, {}],
  ['dev/git/local_git_server.md', 'homelab', 'services', 'local-git', 5, {}],

  // ---- homelab · home ----------------------------------------------------
  ['household/ip_cam/ip_cam.md', 'homelab', 'home', 'ip-cam', 1, {}],
  ['household/ip_cam/old/camera_monitoring.md', 'homelab', 'home', 'ip-cam-old', 2, { note: '旧方案' }],
  ['household/ip_cam/old/ip_cam_install.md', 'homelab', 'home', 'ip-cam-old-install', 3, { note: '旧方案' }],
]

/** Published as articles in the writing workspace instead (see the plan). */
const ARTICLE_ONLY = [
  'dev/git/github_pages.md',
  'dev/git/breaking_change.md',
  'dev/web_dev/html.md',
  'utils/interesting_cmd/hidden_img.md',
]

// --------------------------------------------------------------- utilities

const log = (...args) => console.log(...args)
const warnings = []

/** LAN addresses become documentation examples outside the private ranges. */
function scrub(text) {
  return text
    .replace(/192\.168\.\d+\.\d+/g, (m) => {
      const table = {
        '192.168.8.108': '192.0.2.10',
        '192.168.8.120': '192.0.2.20',
        '192.168.8.1': '192.0.2.1',
      }
      return table[m] || '192.0.2.' + m.split('.').pop()
    })
    .replace(/\blkm@/g, 'user@')
}

function firstParagraph(body) {
  const lines = body.split('\n')
  const out = []
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('#') || t.startsWith('```') || t.startsWith('<') || t.startsWith('|')) {
      if (out.length) break
      continue
    }
    out.push(t)
  }
  const text = out
    .join(' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 150 ? text.slice(0, 149) + '…' : text
}

/**
 * Which locale a page belongs to.
 *
 * Not a ratio: these pages are Chinese prose wrapped around English commands, so
 * a character count is dominated by the code. Measure the prose only — strip
 * fenced blocks, inline code and HTML — and the corpus separates cleanly at
 * zero: 17 pages have no CJK outside code, everything else does.
 */
function isChinese(title, body) {
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
  return /[\u4e00-\u9fff]/.test(prose + title)
}

/** <CodeViewer filePath="/lib/x.conf" title="…" language="conf" /> */
function expandCodeViewers(body, srcFile) {
  return body.replace(/<CodeViewer\b([\s\S]*?)\/>/g, (whole, attrs) => {
    const get = (name) => (attrs.match(new RegExp(`${name}="([^"]*)"`)) || [])[1] || ''
    const filePath = get('filePath')
    const title = get('title')
    const language = get('language') || ''
    if (!filePath) return whole
    const abs = path.join(SRC_PUBLIC, filePath.replace(/^\//, ''))
    if (!fs.existsSync(abs)) {
      warnings.push(`${srcFile}: CodeViewer target missing: ${filePath}`)
      return `> 文件 \`${filePath}\`（原仓库中已不存在）\n`
    }
    if (/\.(key|csr)$/.test(filePath)) {
      warnings.push(`${srcFile}: skipped private-key material: ${filePath}`)
      return `> \`${filePath}\` — 私钥文件，未随站点发布。\n`
    }
    const content = fs.readFileSync(abs, 'utf8').replace(/\s+$/, '')
    const head = title ? `**${title}**（\`${filePath}\`）\n\n` : `\`${filePath}\`\n\n`
    return `${head}\`\`\`${language}\n${content}\n\`\`\`\n`
  })
}

/** <ReferenceViewer htmlPath="/assets/…html" title="…" /> */
function expandReferenceViewers(body, srcFile) {
  return body.replace(/<ReferenceViewer\b([\s\S]*?)\/>/g, (whole, attrs) => {
    const get = (name) => (attrs.match(new RegExp(`${name}="([^"]*)"`)) || [])[1] || ''
    const htmlPath = get('htmlPath')
    const title = get('title') || htmlPath
    if (!htmlPath) return whole
    const abs = path.join(SRC_PUBLIC, htmlPath.replace(/^\//, ''))
    // The component carries originalUrl on most instances; the snapshot's own
    // canonical is the fallback for the rest.
    let origin = get('originalUrl')
    if (!origin) {
      if (fs.existsSync(abs)) {
        const html = fs.readFileSync(abs, 'utf8').slice(0, 200000)
        origin =
          (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || [])[1] ||
          (html.match(/<meta[^>]+property="og:url"[^>]+content="([^"]+)"/i) || [])[1] ||
          ''
      } else {
        warnings.push(`${srcFile}: ReferenceViewer target missing: ${htmlPath}`)
      }
    }
    // The marker lets the archive pass add the local copy without touching prose.
    const marker = `<!--ref:${htmlPath}-->`
    const link = origin ? `[${title}](${origin})` : title
    return `${marker}\n> 参考（第三方页面）：${link}\n`
  })
}

function rewriteLinks(body, urlFor, srcFile) {
  const fromDir = path.posix.dirname(srcFile)
  return body.replace(/\]\(([^)\s]+\.md)(#[^)]*)?\)/g, (whole, target, hash = '') => {
    // VuePress wrote these relative to the page (`./basics.md`); the map is
    // keyed by repo-relative path, so resolve against the source directory.
    const key = target.startsWith('/')
      ? target.replace(/^\//, '')
      : path.posix.normalize(path.posix.join(fromDir, target))
    let url = urlFor.get(key)
    if (!url) {
      // The author wrote one link as if from the section root
      // (`./gpu/old_igpu_problems.md` inside apps/gpu/). Fall back to a unique
      // basename before giving up, so a slip in one page is not a dead link.
      const base = path.posix.basename(target)
      const hits = [...urlFor.entries()].filter(([k]) => path.posix.basename(k) === base)
      if (hits.length === 1) url = hits[0][1]
    }
    if (!url) {
      warnings.push(`${srcFile}: link target not migrated: ${target}`)
      return whole
    }
    return `](${url}${hash})`
  })
}

function copyImages(body, srcFile) {
  return body.replace(/!\[([^\]]*)\]\((\/assets\/[^)\s]+)\)/g, (whole, alt, asset) => {
    const abs = path.join(SRC_PUBLIC, asset.replace(/^\//, ''))
    const rel = asset.replace(/^\/assets\//, '')
    const out = path.join(OUT_IMAGES, rel)
    if (!fs.existsSync(abs)) {
      warnings.push(`${srcFile}: image missing: ${asset}`)
      return whole
    }
    const size = fs.statSync(abs).size
    if (size > 5 * 1024 * 1024) {
      warnings.push(`${srcFile}: image too heavy to publish (${Math.round(size / 1e6)} MB): ${asset}`)
      return `${whole}\n\n> 上图约 ${Math.round(size / 1e6)} MB，未随站点发布。`
    }
    if (!DRY) {
      fs.mkdirSync(path.dirname(out), { recursive: true })
      fs.copyFileSync(abs, out)
    }
    return `![${alt}](/ubuntu/${rel})`
  })
}

// -------------------------------------------------------------------- main

const urlFor = new Map()
for (const [src, track, stage, slug] of MAP) urlFor.set(src, `__LANG__/docs/${track}/${stage}/${slug}/`)

const written = []
const redirects = []

for (const [src, track, stage, slug, order, opts] of flag('archives') ? [] : MAP) {
  const abs = path.join(SRC_DOCS, src)
  if (!fs.existsSync(abs)) {
    warnings.push(`missing source file: ${src}`)
    continue
  }
  let raw = fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n')
  if (raw.startsWith('---\n')) raw = raw.slice(raw.indexOf('\n---', 4) + 5)

  // title: the H1 the VuePress theme rendered (the layout renders it now)
  let title = opts.title || ''
  const h1 = raw.match(/^#\s+(.+)$/m)
  if (!title && h1) title = h1[1].trim()
  if (h1) raw = raw.replace(/^#\s+.+\n/, '')
  if (!title) {
    warnings.push(`${src}: no H1 and no title override`)
    title = slug
  }

  const lang = isChinese(title, raw) ? 'zh' : 'en'
  const localise = (url) => url.replace('__LANG__', `/${lang}`)

  let body = raw
  body = expandCodeViewers(body, src)
  body = expandReferenceViewers(body, src)
  body = copyImages(body, src)
  body = rewriteLinks(body, new Map([...urlFor].map(([k, v]) => [k, localise(v)])), src)
  body = scrub(body)
  // A visible marker, not frontmatter: these pages stay published because the
  // commands still work, but the reader should know which way the wind blew.
  if (opts.note) body = `> ⚠️ **${opts.note}**：这一页记录的是当时的做法，可能已经不适用。\n\n${body}`
  body = body.replace(/\n{3,}/g, '\n\n').trim()

  const front = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `summary: ${JSON.stringify(firstParagraph(body))}`,
    `lang: ${lang}`,
    `translationKey: ${JSON.stringify(`${track}-${stage}-${slug}`)}`,
    `slug: ${slug}`,
    `track: ${track}`,
    `stage: ${stage}`,
    `order: ${order}`,
    ...(opts.index ? ['stageIndex: true'] : []),
    `date: ${IMPORT_DATE}`,
    'tags: []',
    `status: ${lang === 'zh' ? 'zh draft' : 'en draft'}`,
    `source: plae-lkm/ubuntu_setup:docs/${src}`,
  ]
  front.push('---', '')

  const outPath = path.join(OUT_DOCS, lang, track, stage, `${slug}.md`)
  if (!DRY) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, front.join('\n') + body + '\n')
  }
  written.push({ src, out: path.relative(ROOT, outPath), track, stage, slug, lang, title })
  redirects.push({ from: `/${src.replace(/\.md$/, '.html')}`, to: localise(urlFor.get(src)) })
}

log(`\nimport ${DRY ? '(dry run) ' : ''}${SOURCE}`)
log(`  pages written : ${written.length}`)
const byTrack = {}
for (const w of written) byTrack[`${w.track}/${w.stage}`] = (byTrack[`${w.track}/${w.stage}`] || 0) + 1
for (const [k, n] of Object.entries(byTrack).sort()) log(`    ${k.padEnd(20)} ${n}`)
log(`  zh / en       : ${written.filter((w) => w.lang === 'zh').length} / ${written.filter((w) => w.lang === 'en').length}`)
log(`  article-only  : ${ARTICLE_ONLY.length} (left for the writing workspace)`)

if (!DRY) {
  const mapFile = path.join(ROOT, 'scripts/import/ubuntu-map.json')
  fs.writeFileSync(
    mapFile,
    JSON.stringify({ generatedFrom: 'plae-lkm/ubuntu_setup', date: IMPORT_DATE, pages: written, redirects, articleOnly: ARTICLE_ONLY }, null, 2) + '\n'
  )
  log(`  url map       : ${path.relative(ROOT, mapFile)}`)
}

if (warnings.length) {
  log(`\n  ${warnings.length} warning(s):`)
  for (const w of warnings) log(`    - ${w}`)
}
log('')

// ---------------------------------------------------------------- archives
//
// The source site republished ~19 third-party pages (NVIDIA docs and forums,
// Ask Ubuntu, fast.ai, …) through its own <ReferenceViewer>. Those snapshots
// move here so the citations keep working after the source repo is frozen.
//
// Two rules for other people's pages: they are marked noindex/nofollow and they
// carry a banner saying where they came from, because a copy that looks like
// your own page is a lie about authorship.
//
//   node scripts/import/ubuntu-setup.mjs --archives [--source DIR]

const ARCHIVE_DIR = path.join(ROOT, 'public/archives/ubuntu-setup')
/** One payload image is a 31 MB puzzle artifact, not a reference page. */
const ARCHIVE_SKIP = [/image_seeds\/hybrid\.png$/]

const BANNER = `<div style="all:initial;display:block;font:14px/1.6 system-ui,sans-serif;background:#fff8e1;border-bottom:1px solid #e0c98a;color:#4a3b00;padding:10px 16px">
<strong>第三方页面存档</strong> — 这是他人页面的本地快照，版权归原作者，仅作参考。
<a href="https://github.com/plae-lkm/ubuntu_setup" style="color:#8a6d00">来源仓库</a>
</div>
`

/** Every .md under a directory, recursively. */
function walkMd(dir) {
  const out = []
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name)
    if (item.isDirectory()) out.push(...walkMd(full))
    else if (item.name.endsWith('.md')) out.push(full)
  }
  return out
}

function stampArchive(html) {
  let out = html.replace(
    /<head([^>]*)>/i,
    `<head$1>\n<meta name="robots" content="noindex, nofollow">`
  )
  out = out.replace(/<body([^>]*)>/i, `<body$1>\n${BANNER}`)
  return out
}

function copyArchive() {
  const src = path.join(SRC_PUBLIC, 'assets')
  let files = 0
  let bytes = 0
  const walk = (dir) => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const from = path.join(dir, item.name)
      const rel = path.relative(src, from)
      if (ARCHIVE_SKIP.some((re) => re.test(rel))) {
        warnings.push(`archive: skipped ${rel}`)
        continue
      }
      const to = path.join(ARCHIVE_DIR, 'assets', rel)
      if (item.isDirectory()) {
        walk(from)
        continue
      }
      if (DRY) {
        files += 1
        continue
      }
      fs.mkdirSync(path.dirname(to), { recursive: true })
      if (item.name.endsWith('.html')) {
        fs.writeFileSync(to, stampArchive(fs.readFileSync(from, 'utf8')))
      } else {
        fs.copyFileSync(from, to)
      }
      files += 1
      bytes += fs.statSync(from).size
    }
  }
  walk(src)

  // Point the reference lines at the local copy as well as the original.
  const linkFor = (htmlPath) => {
    const rel = htmlPath.replace(/^\//, '')
    return `/archives/ubuntu-setup/${encodeURI(rel)}`
  }
  let patched = 0
  for (const dir of [path.join(OUT_DOCS, 'zh'), path.join(OUT_DOCS, 'en')]) {
    if (!fs.existsSync(dir)) continue
    for (const file of walkMd(dir)) {
      const before = fs.readFileSync(file, 'utf8')
      const after = before.replace(
        /<!--ref:(.+?)-->\n(> 参考（第三方页面）：[^\n]*)/g,
        (whole, htmlPath, line) =>
          `${whole}\n> 本地存档：[快照](${linkFor(htmlPath)})`
      )
      if (after !== before) {
        patched += 1
        if (!DRY) fs.writeFileSync(file, after)
      }
    }
  }
  log(`\narchives ${DRY ? '(dry run) ' : ''}`)
  log(`  files copied  : ${files} (${(bytes / 1e6).toFixed(1)} MB)`)
  log(`  pages updated : ${patched}`)
  log(`  served at     : /archives/ubuntu-setup/assets/…\n`)
}

if (flag('archives')) {
  copyArchive()
  if (warnings.length) {
    log(`  ${warnings.length} warning(s):`)
    for (const w of warnings) log(`    - ${w}`)
  }
}
