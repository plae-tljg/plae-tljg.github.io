#!/usr/bin/env node
/**
 * Import `~/Music/test/android_gaming` into this site.
 *
 * The folder is a two-day investigation that got FGO 国服 and Arknights running
 * on Ubuntu. Unlike the Ubuntu manual this one was *already written* as
 * documentation, in English, with the dead ends recorded — so the import is
 * mostly redaction plus routing, and the stories go to the writing workspace as
 * articles instead of into the manual.
 *
 *   node scripts/import/android-gaming.mjs --source ~/Music/test/android_gaming
 *   node scripts/import/android-gaming.mjs --articles
 *
 * Nothing binary is published: the folder holds 4.13 GB, of which two game APKs
 * are 4.0 GB, plus Google's and Intel's translation libraries and Tencent ACE's
 * extracted binaries. See the notes in the commit that added this file.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const value = (name, fallback = '') => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}

const SOURCE = value('source', path.join(os.homedir(), 'Music/test/android_gaming'))
const OUT_DOCS = path.join(ROOT, 'src/content/docs')
const WORKSPACE = process.env.CONTENT_SOURCE || path.join(os.homedir(), 'Music/blogs')
const SERIES_DIR = path.join(WORKSPACE, 'seasons/03-tinkering')
const DRY = flag('dry-run')
const IMPORT_DATE = '2026-10-04'

/** Source file → destination. Anything not listed is not published. */
const MAP = [
  // The recipe itself: English and Chinese, one translationKey so they pair.
  ['docs/01-SOLUTION.md', 'android', 'solution', 'solution', 1, { index: true, lang: 'en', title: 'Running FGO 国服 on Ubuntu', related: { url: '/zh/writing/android-games/', title: '把 FGO 国服搬上 Ubuntu：十二个死胡同和一个版本号' } }],
  ['docs/01-SOLUTION.zh-CN.md', 'android', 'solution', 'solution', 1, { index: true, lang: 'zh', title: '在 Ubuntu 上玩 FGO 国服', related: { url: '/zh/writing/android-games/', title: '把 FGO 国服搬上 Ubuntu：十二个死胡同和一个版本号' } }],
  ['docs/05-ARKNIGHTS.md', 'android', 'solution', 'arknights', 2, { lang: 'en', title: 'Arknights on the same machine' }],
  ['docs/03-TROUBLESHOOTING.md', 'android', 'trouble', 'troubleshooting', 1, { index: true, lang: 'en', title: 'Troubleshooting' }],
]

const ARTICLE_SOURCES = ['docs/02-STORY.md']

const warnings = []
const log = (...a) => console.log(...a)

/**
 * Redaction.
 *
 * The investigation names this machine, its home directory and the game account
 * it ran on. None of that identifies a person, but together it is a fingerprint
 * that has nothing to do with the reader's problem — and the account details are
 * simply not ours to publish.
 */
function scrub(text) {
  return (
    text
      // home directory: the reader's own path is what matters, not mine
      .replace(/\/home\/lkm/g, '~')
      .replace(/~\/00app\/01lang\/android\/sdk/g, '$ANDROID_SDK')
      // LAN addresses never appear here, but a future edit should not leak one
      .replace(/192\.168\.\d+\.\d+/g, '192.0.2.10')
      // account fingerprint: keep the fact that it rendered, drop the save file
      .replace(/\(`从者 \/ 浅上藤乃 \/ 职阶: 弓兵`\)/g, '(the servant intro screen)')
      .replace(/, Chaldea Gate, level 142 —/g, ' —')
      .replace(/level 142/gi, 'the account')
      .replace(/character roster, level,? and event progress[^.]*\./gi, '')
      .replace(/player level 142/gi, 'the account')
  )
}

function textOfFile(file) {
  return scrub(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n'))
}

function firstParagraph(body) {
  const lines = body.split('\n')
  const out = []
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('#') || t.startsWith('```') || t.startsWith('|') || t.startsWith('*')) {
      if (out.length) break
      continue
    }
    out.push(t.replace(/^>\s*/, ''))
  }
  const text = out
    .join(' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 150 ? text.slice(0, 149) + '…' : text
}

// ------------------------------------------------------------------- pages
const written = []
for (const [src, track, stage, slug, order, opts] of flag('articles') ? [] : MAP) {
  const abs = path.join(SOURCE, src)
  if (!fs.existsSync(abs)) {
    warnings.push(`missing source: ${src}`)
    continue
  }
  let body = textOfFile(abs)
  // The documents are self-contained; the title is the page's, so the H1 goes.
  const h1 = body.match(/^#\s+(.+)$/m)
  const title = opts.title || (h1 ? h1[1].trim() : slug)
  if (h1) body = body.replace(/^#\s+.+\n/, '')

  const front = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `summary: ${JSON.stringify(firstParagraph(body))}`,
    `lang: ${opts.lang}`,
    `translationKey: ${JSON.stringify(`${track}-${stage}-${slug}`)}`,
    `slug: ${slug}`,
    `track: ${track}`,
    `stage: ${stage}`,
    `order: ${order}`,
    ...(opts.index ? ['stageIndex: true'] : []),
    `date: ${IMPORT_DATE}`,
    'tags: []',
    `status: ${opts.lang === 'zh' ? 'zh draft' : 'en draft'}`,
    `source: android_gaming:${src}`,
    '---',
    '',
  ]
  if (opts.related) {
    body = `${body.trim()}\n\n---\n\n> **来龙去脉**：[${opts.related.title}](${opts.related.url})——这一步为什么是这样，以及当时卡在哪里。\n`
  }

  const outPath = path.join(OUT_DOCS, opts.lang, track, stage, `${slug}.md`)
  if (!DRY) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, front.join('\n') + body.replace(/\n{3,}/g, '\n\n').trim() + '\n')
  }
  written.push({ src, out: path.relative(ROOT, outPath), lang: opts.lang, title })
}

if (!flag('articles')) {
  log(`\nandroid pages ${DRY ? '(dry run) ' : ''}`)
  for (const w of written) log(`  ${w.lang}  ${w.out}`)
}

// ---------------------------------------------------------------- articles
const ARTICLES = [
  {
    slug: 'nvidia-drivers',
    titleZh: '驱动装好了，但没有渲染：NVIDIA 在这台机器上的三种坏法',
    titleEn: 'Three Ways the NVIDIA Driver Broke on This Machine',
    summaryZh:
      '同一块显卡、同一台机器，坏过三次：一次是内核更新后模块没重编，一次是装成了计算专用的驱动所以客人用 llvmpipe 画图，还有一次找错了方向。',
    summaryEn:
      'One card, one machine, three failures: a module not rebuilt after a kernel update, a compute-only install that left the guest rendering with llvmpipe, and one that was misdiagnosed for months.',
    note:
      '合并三处素材：ubuntu_setup 的旧版 iGPU 复盘（误诊）、同一手册里 CUDA 页的“内核更新后驱动失效”，以及 android_gaming 里发现的两个宿主机缺陷。命令留在手册页，文章只写判断与误判。',
  },
  {
    slug: 'android-games',
    titleZh: '把 FGO 国服搬上 Ubuntu：十二个死胡同和一个版本号',
    titleEn: 'Twelve Dead Ends and One Image Version',
    summaryZh:
      '两天时间，容器、houdini、十六进制补丁都试过，最后让它跑起来的变量只有一个：Android 16.0 rev 7 的系统镜像。它的 ARM 翻译器不会触发那条栈指针断言。',
    summaryEn:
      'Containers, houdini and hex patches all failed; the one variable that fixed it was the Android 16.0 rev 7 system image, whose ARM translator does not trip the stack-pointer assert.',
    note:
      '英文长稿在 docs/02-STORY.md（27 KB）。这份中文稿是重写的第一版：只留主线与结论，细节留在手册的排错页。',
  },
  {
    slug: 'houdini-timebomb',
    titleZh: 'libhoudini 的「定时炸弹」不是炸弹，是一个版本号',
    titleEn: "libhoudini's Timebomb Is a Version Gate",
    summaryZh:
      '社区里都说“houdini 到 9.1 以后就不能用”，其实那是一个硬编码的计数器比较，和日期无关；另外它还有一段没被记录过的自毁逻辑，触发条件是符号链接的拓扑。',
    summaryEn:
      'The community story is that houdini stops working past 9.1. It is a hardcoded counter comparison with no time syscall in sight — and there is a second, undocumented self-destruct that triggers on symlink topology.',
    note:
      '素材在 docs/02-STORY.md §3.2 与 docs/research/FGO-on-Linux-ARM-emulation-report.md。涉及别人的逆向成果，发布前确认署名与链接（itstaftaf/houdini-timebomb-fix、Vvamp/Libhoudini-hpe-14-timebomb-patch）。',
  },
]

function writeArticles() {
  if (DRY) {
    log('\narticles (dry run)')
    for (const a of ARTICLES) log(`  ${a.slug}`)
    return
  }
  fs.mkdirSync(SERIES_DIR, { recursive: true })
  const existing = fs
    .readdirSync(SERIES_DIR)
    .filter((f) => /^\d+-/.test(f))
    .map((f) => f.replace(/^\d+-/, '').replace(/\.zh\.md$/, ''))
  const created = []
  for (const spec of ARTICLES) {
    if (existing.includes(spec.slug)) {
      warnings.push(`article already exists, left alone: ${spec.slug}`)
      continue
    }
    created.push(spec)
  }
  // The drafts below are written by hand in the same commit; this mode exists so
  // a re-run reports what is missing rather than inventing prose.
  log(`\narticles: ${ARTICLES.length} declared, ${created.length} missing`)
  for (const c of created) log(`  ${c.slug} — ${c.note}`)
}

if (flag('articles')) writeArticles()

if (warnings.length) {
  log(`\n${warnings.length} warning(s):`)
  for (const w of warnings) log(`  - ${w}`)
}
log('')
