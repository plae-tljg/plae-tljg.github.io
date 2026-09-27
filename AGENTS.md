# AGENTS.md — site repository

Operating notes for any AI agent working in `plae-tljg.github.io`.

## What this repo is

The **presentation layer only**. Articles are written in a separate private
workspace (default `~/Music/blogs`) and copied here by `scripts/content.mjs`.
The site is Astro 7, output is static, hosting is GitHub Pages from `gh-pages`.

## Hard rules

1. **Never hand-edit `src/content/posts/**`** — it is generated. Change the draft
   in the writing workspace and run `npm run content:sync`. `npm run content:verify`
   detects drift and runs in CI.
2. **Never copy unpublished drafts into this repo.** The repository is public.
   Publication is controlled by the `status` field in the writing workspace; only
   `ready` (plus `--preview` statuses, clearly badged) may be synced.
3. **Keep the staging guard on** until the launch gate in the writing workspace's
   `AGENTS.md` is passed: `SITE_STAGING` must not be `false`, and `noindex` /
   `robots.txt` must stay in place.
4. **No employer or client material**, no identifiable business data — the same
   rule the writing workspace operates under.
5. `sync` must stay read-only with respect to the writing workspace.

## Where to change what

| Want to change | Edit |
|---|---|
| Site title, taglines, author, GitHub link | `src/site.mjs` (`SITE`) |
| Locales, UI strings | `src/site.mjs` (`LOCALES`, `UI`) |
| Series registry, order, descriptions | `src/site.mjs` (`SERIES`) |
| Which statuses publish | `src/site.mjs` (`CONTENT_SYNC`) |
| Post/page schema | `src/content.config.ts` |
| Layout, routes, components | `src/layouts`, `src/pages`, `src/components` |
| Typography, dark mode, table/KaTeX styling | `src/styles/global.css` |
| Deploy behaviour, site URL, staging flag | `.github/workflows/deploy.yml` |

## Verify before finishing

```bash
npm run content:verify
npx astro build      # must finish with no errors
```

## Known constraints

- Astro 7 defaults to the native Sätteri Markdown processor; this project uses the
  `unified()` processor from `@astrojs/markdown-remark` because the articles carry
  inline TeX (`remark-math` + `rehype-katex`). Do not switch processors without
  checking that math still renders.
- `public/.nojekyll` is required: the build emits `_astro/`, which Jekyll would
  otherwise drop on the `gh-pages` branch.
