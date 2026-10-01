/**
 * Cross-section index helpers: one shape for "a thing on this site", whether it
 * is an article, a documentation page or a legacy note. Used by the home page
 * and the archive so no section is a silo.
 */
import { articlePath, guidePath, notePath, seriesPath } from './url'
import {
  getNotes,
  getPosts,
  getTrackPages,
  isPreview,
  type Post,
  type PathPage,
  type Note,
} from './content'
import { SERIES, TRACKS, type LocaleCode } from '../site.mjs'

export type EntryKind = 'article' | 'doc' | 'note'

export interface Entry {
  kind: EntryKind
  title: string
  summary: string
  date: Date
  href: string
  /** Series or track title, when the entry belongs to one. */
  group?: string
  groupHref?: string
  /** Draft preview — not marked ready yet. */
  preview?: boolean
}

function fromPost(post: Post, lang: LocaleCode): Entry {
  const series = post.data.series ? SERIES.find((s) => s.id === post.data.series) : undefined
  return {
    kind: 'article',
    title: post.data.title,
    summary: post.data.summary,
    date: post.data.date,
    href: articlePath(lang, post.data.slug),
    group: series?.title[lang],
    groupHref: series ? seriesPath(lang, series.id) : undefined,
    preview: isPreview(post),
  }
}

function fromPathPage(page: PathPage, lang: LocaleCode): Entry {
  const track = TRACKS.find((t) => t.id === page.data.track)
  return {
    kind: 'doc',
    title: page.data.title,
    summary: page.data.summary,
    date: page.data.date,
    href: guidePath(lang, page.data.track, page.data.stage || '', page.data.slug),
    group: track?.title[lang],
    groupHref: track ? `/${lang}/docs/${track.id}/` : undefined,
    preview: page.data.status !== 'ready',
  }
}

function fromNote(note: Note, lang: LocaleCode): Entry {
  return {
    kind: 'note',
    title: note.data.title,
    summary: note.data.summary,
    date: note.data.date,
    href: notePath(lang, note.data.slug),
  }
}

/** Everything published in a locale, newest first. */
export async function getAllEntries(lang: LocaleCode): Promise<Entry[]> {
  const [posts, notes] = await Promise.all([getPosts(lang), getNotes(lang)])
  const docPages: PathPage[] = []
  for (const track of TRACKS) {
    docPages.push(...(await getTrackPages(track.id, lang)))
  }
  return [
    ...posts.map((p) => fromPost(p, lang)),
    ...docPages.filter((p) => !p.data.stageIndex).map((p) => fromPathPage(p, lang)),
    ...notes.map((n) => fromNote(n, lang)),
  ].sort((a, b) => b.date.valueOf() - a.date.valueOf())
}

export async function getRecentEntries(lang: LocaleCode, limit = 6): Promise<Entry[]> {
  return (await getAllEntries(lang)).slice(0, limit)
}

/** Counts for the three section cards on the home page. */
export async function getSectionCounts(lang: LocaleCode) {
  const posts = await getPosts(lang)
  const notes = await getNotes(lang)
  let docs = 0
  let tracks = 0
  for (const track of TRACKS) {
    const pages = await getTrackPages(track.id, lang)
    if (pages.length > 0) tracks += 1
    docs += pages.filter((p) => !p.data.stageIndex).length
  }
  const seriesWithPosts = SERIES.filter((s) => posts.some((p) => p.data.series === s.id)).length
  return {
    articles: posts.length,
    series: seriesWithPosts,
    docs,
    tracks,
    notes: notes.length,
  }
}
