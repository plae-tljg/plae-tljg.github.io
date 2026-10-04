import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

/**
 * Entry ids must be unique per collection, but the glob loader defaults to the
 * frontmatter `slug` — which is deliberately the *same* for a zh/en pair. Derive
 * the id from the path instead (`zh/my-slug`), or one locale silently replaces
 * the other in the store.
 */
const byPath = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '')

/**
 * Synced articles. Written by `npm run content:sync` (see scripts/content.mjs):
 * do not edit files in src/content/posts by hand — sync will overwrite them.
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts', generateId: byPath }),
  schema: z.object({
    title: z.string(),
    summary: z.string().default(''),
    lang: z.enum(['zh', 'en']),
    /** Stable id shared by the zh/en versions of the same article. */
    translationKey: z.string(),
    /** URL segment, normally the translationKey. */
    slug: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** Series id from the registry in src/site.mjs. */
    series: z.string().optional(),
    /** Position inside the series (0 = abstract / preface). */
    seriesOrder: z.number().optional(),
    /**
     * Human label for the part, e.g. "第三篇 — 操作". A bare number is accepted
     * and stringified: YAML writes `08` unquoted, and a parser that reads it
     * back as an integer should not fail the build.
     */
    partLabel: z
      .union([z.string(), z.number()])
      .transform((v) => String(v))
      .optional(),
    tags: z.array(z.string()).default([]),
    /** ready | preview */
    status: z.string().default('ready'),
    /** Translated by a model, and the page says so. */
    aiTranslated: z.boolean().default(false),
    canonical: z.string().optional(),
    /** Source path inside the writing workspace, for traceability. */
    source: z.string().optional(),
    syncedAt: z.string().optional(),
  }),
})

/**
 * Guide/track pages, rendered at /<lang>/docs/<track>/<stage>/<slug>/ — a tree
 * rather than a series.
 *
 * These are **hand-written here**, not synced: the learning path came from a
 * standalone site, its writing-workspace copy was retired, and nothing in
 * scripts/content.mjs reads or writes this directory.
 */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs', generateId: byPath }),
  schema: z.object({
    title: z.string(),
    summary: z.string().default(''),
    lang: z.enum(['zh', 'en']),
    translationKey: z.string(),
    slug: z.string(),
    /** Track id from the registry in src/site.mjs. */
    track: z.string(),
    stage: z.string().optional(),
    /** Display order inside the stage. */
    order: z.number().optional(),
    /** Difficulty badge (L1–L5). */
    level: z.number().optional(),
    icon: z.string().optional(),
    /** Rendered at the stage URL itself, with the stage's other pages below. */
    stageIndex: z.boolean().default(false),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    status: z.string().default('ready'),
    /** Translated by a model, and the page says so. */
    aiTranslated: z.boolean().default(false),
    canonical: z.string().optional(),
    source: z.string().optional(),
    syncedAt: z.string().optional(),
  }),
})

/**
 * Site-local pages (about, colophon, …) plus the articles that predate the
 * writing workspace. Hand-written: never touched by content sync.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    lang: z.enum(['zh', 'en']),
    description: z.string().default(''),
    updated: z.coerce.date().optional(),
  }),
})

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().default(''),
    lang: z.enum(['zh', 'en']),
    slug: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    legacy: z.boolean().default(true),
  }),
})

export const collections = { posts, docs, pages, notes }
