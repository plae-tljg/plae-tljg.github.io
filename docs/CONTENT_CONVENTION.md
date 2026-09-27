# Content convention

How an article written in the private workspace becomes a page on this site.

The tool is `scripts/content.mjs` (`npm run content:*`). It reads the writing
workspace, normalizes what it finds, and writes this repository's
`src/content/posts/<lang>/`. It never writes back to the workspace.

The settings below live in [`src/site.mjs`](../src/site.mjs) under `CONTENT_SYNC`
and `SERIES` — that file is the single place to change them.

---

## 1. Where articles live

```text
~/Music/blogs/                 ← writing workspace (CONTENT_SYNC.source)
  drafts/                      ← scanned (CONTENT_SYNC.include)
    wake-the-ai-less.zh.md
    v2/
      00-abstract.zh.md
      01-three-principles.zh.md
      ...
```

- Every `.md` file under `drafts/` is scanned, recursively.
- These are skipped: `v1/`, `_old/`, dot-directories, any file starting with `_`,
  and the housekeeping files (`README.md`, `AGENTS.md`, `CONTENT_PLAN.md`,
  `ARTICLE_TEMPLATE.md`, `collection-plan.md`, `plan-proposal.md`,
  `research-notes*.md`, `REVIEW-*.md`).
- Override the workspace location for one run:
  `CONTENT_SOURCE=/path/to/workspace npm run content:sync`

### File name

```text
[<order>-]<translationKey>.<lang>.md
```

| Part | Meaning |
|---|---|
| `<order>` | Optional leading number (`00`, `01`, …) → position inside the series |
| `<translationKey>` | Stable id, lowercase and dashes; also the URL slug and the link between the zh and en versions |
| `<lang>` | `zh` or `en`; a file without a suffix falls back to `CONTENT_SYNC.defaultLang` |

`03-why-ai-takes-over.zh.md` and `03-why-ai-takes-over.en.md` are the two
language versions of one article. The English file may not exist yet — the site
then shows the Chinese one alone instead of a broken language link.

---

## 2. Frontmatter

```yaml
---
translationKey: why-ai-takes-over-math-03   # required — id and slug
titleZh: "为什么 AI 会接管数学"              # required for zh files (or `title`)
titleEn: "Why AI Will Take Over Mathematics"
summaryZh: "一句话摘要"                      # used for cards, meta, RSS
summaryEn: "One-line summary"
date: "2026-09-24"
updated: "2026-09-27"                       # optional
series: "Why I Already Knew AI Would Take Over Mathematics"   # registry alias
part: "第三篇 — 操作"                        # label shown in the series list
tags: [AI, 数学, 自动化]
status: "zh draft"                          # see §3
canonical: ""                               # fill after launch, if cross-posted
confidentialityChecked: true                # required before publishing
---
```

Recognized keys, and what happens to them:

| Key | Goes to the site? | Notes |
|---|---|---|
| `translationKey` | yes | required; becomes the URL slug |
| `titleZh` / `titleEn` | yes | the one matching the file's language wins; `title` also works |
| `summaryZh` / `summaryEn` | yes | |
| `date`, `updated` | yes | `YYYY-MM-DD` |
| `series` | yes, as an id | resolved through the registry in `src/site.mjs` |
| `part` | yes, as `partLabel` | display label only |
| `order`, `seriesOrder` | yes, as `seriesOrder` | overrides the file-name number |
| `tags` | yes | |
| `status` | yes | drives what gets published |
| `canonical` | yes | |
| `confidentialityChecked` | **no** — used as a gate | `false` blocks publication |
| `languagePair`, `publicProof`, `notes` | no | workspace bookkeeping, not published |

Anything else in the source frontmatter is ignored. The body is copied as-is
except that a leading `# H1` is removed, because the page layout renders the title.

---

## 3. Status and what publishes

```text
idea → outline → zh draft → en draft → tech review → visuals → staging → ready
```

| Command | Publishes |
|---|---|
| `npm run content:sync` | `status: ready` only |
| `npm run content:sync -- --preview` | `ready` **plus** `zh draft`, `en draft`, `tech review`, `visuals`, `staging` — written as `status: preview` |

Preview articles appear on the site with a 「草稿预览」 badge, carry
`noindex`, and are left out of RSS and the sitemap. They are the way to read a
draft in its real layout before committing to `ready`.

An article with `confidentialityChecked: false` is never copied; `--force`
overrides this (deliberately awkward).

---

## 4. Series

A series is registered once in `src/site.mjs`:

```js
{
  id: 'why-ai-takes-over-math',            // URL: /zh/series/why-ai-takes-over-math/
  order: 1,                                // order on the series index
  title: { zh: '…', en: '…' },
  description: { zh: '…', en: '…' },
  state: 'closed',                         // 'closed' | 'ongoing'
  languages: ['zh'],                       // shown as a badge
  dir: 'drafts/v2',                        // where `content new --series` writes
  aliases: ['Why I Already Knew AI Would Take Over Mathematics'],
}
```

`aliases` is what makes the drafts' existing `series:` strings resolve; add the
raw string there when a draft uses a new name. An unresolvable `series:` value is
not fatal — the article is published without series navigation and shows up in
`content status` under `(no series)`, which is the signal to register it.

Reading order inside a series comes from `seriesOrder`, which comes from the file
name number (`03-…`), then `order`/`seriesOrder` in frontmatter.

---

## 5. Images

Relative image links are copied into `public/content/<translationKey>/` and
rewritten to `/content/<translationKey>/…`, with a short content hash in the file
name. Absolute paths (`/assets/…`), full URLs and `data:` URIs are left alone.
A missing image is reported as a warning and the link is left untouched.

---

## 6. Commands

```bash
npm run content:status                     # inventory: status, language, order, published?
npm run content:sync -- --dry-run          # show what would change
npm run content:sync -- --only <key>       # one article
npm run content:sync -- --preview          # include drafts as previews
npm run content:new -- --key <key> [--lang zh|en] [--series <id>] [--order 3] [--both]
npm run content:verify                     # repo still matches the manifest (CI)
```

`content:new` creates the file in the series' `dir` (or `drafts/`), never
overwriting an existing one.

---

## 7. Rules the tool enforces

1. `sync` never writes to the writing workspace.
2. Synced files are generated. Editing them here is detected by `content:verify`
   and fails CI — change the draft in the workspace and sync again.
3. A file that exists in `src/content/posts/` but was not produced by sync is
   never overwritten (`--force` required), so hand-written files cannot be
   silently destroyed.
4. Two source files mapping to the same output path abort the run.
5. An article that stops being publishable (status moved back, file deleted) is
   removed from the site on the next sync.
6. `content:verify` also flags files in the managed directory that sync does not
   know about.
