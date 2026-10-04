#!/usr/bin/env node
/**
 * Every internal link in the built site has to resolve.
 *
 * This exists because two rounds of "the sidebar links 404" shipped without
 * anyone noticing: stage landing pages were linked as `<stage>/<slug>/` (they
 * render at the stage URL), and language chips swapped the locale prefix on
 * pages that were never translated. Both are invisible in a page-by-page
 * review and obvious in a crawl.
 *
 *   npm run links:check        # after `astro build`
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SECTIONS = 'docs|writing|projects|archive|about'

if (!fs.existsSync(DIST)) {
  console.error('dist/ does not exist — run `npm run build` first.')
  process.exit(1)
}

const pages = []
const walk = (dir) => {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name)
    if (item.isDirectory()) {
      // generated search index and third-party archives are not our links
      if (item.name === 'pagefind' || item.name === 'archives' || item.name === '_astro') continue
      walk(full)
    } else if (item.name === 'index.html') {
      pages.push(full)
    }
  }
}
walk(DIST)

const exists = (href) => fs.existsSync(path.join(DIST, href.replace(/^\//, ''), 'index.html'))
const linkRe = new RegExp(`href="(/[a-z]{2}/(?:${SECTIONS})[^"#?]*)"`, 'g')

let checked = 0
const broken = new Map()

for (const page of pages) {
  const rel = path.relative(DIST, page)
  if (!/^(zh|en)\//.test(rel)) continue
  const html = fs.readFileSync(page, 'utf8')
  for (const match of new Set(html.match(linkRe) || [])) {
    const href = match.slice('href="'.length, -1)
    checked += 1
    if (exists(href)) continue
    if (!broken.has(href)) broken.set(href, new Set())
    broken.get(href).add(path.dirname(rel))
  }
}

if (broken.size === 0) {
  console.log(`✔ ${checked} internal links resolve (${pages.length} pages)`)
  process.exit(0)
}

console.error(`✖ ${broken.size} broken internal link(s), from ${checked} checked:\n`)
for (const [href, sources] of [...broken].sort()) {
  const from = [...sources].slice(0, 3).map((s) => `/${s}/`).join(', ')
  console.error(`  ${href}`)
  console.error(`      linked from ${sources.size} page(s): ${from}`)
}
process.exit(1)
