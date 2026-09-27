import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

/**
 * Synced articles. Written by `npm run content:sync` (see scripts/content.mjs):
 * do not edit files in src/content/posts by hand — sync will overwrite them.
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
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
    /** Human label for the part, e.g. "第三篇 — 操作". */
    partLabel: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /** ready | preview */
    status: z.string().default('ready'),
    canonical: z.string().optional(),
    /** Source path inside the writing workspace, for traceability. */
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

export const collections = { posts, pages, notes }
