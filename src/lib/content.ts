import { getCollection, type CollectionEntry } from 'astro:content'
import {
  SERIES,
  TRACKS,
  LOCALES,
  DEFAULT_LOCALE,
  type LocaleCode,
  type SeriesEntry,
} from '../site.mjs'

export type Post = CollectionEntry<'posts'>
export type Note = CollectionEntry<'notes'>
export type Page = CollectionEntry<'pages'>
export type PathPage = CollectionEntry<'docs'>

export const isPreview = (post: Post): boolean => post.data.status !== 'ready'

/** Published posts for one locale, newest first. */
export async function getPosts(lang: LocaleCode): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => data.lang === lang)
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getPost(lang: LocaleCode, slug: string): Promise<Post | undefined> {
  const posts = await getPosts(lang)
  return posts.find((p) => p.data.slug === slug)
}

/** Series posts in reading order (seriesOrder, then date). */
export async function getSeriesPosts(seriesId: string, lang: LocaleCode): Promise<Post[]> {
  const posts = await getPosts(lang)
  return posts
    .filter((p) => p.data.series === seriesId)
    .sort(
      (a, b) =>
        (a.data.seriesOrder ?? 999) - (b.data.seriesOrder ?? 999) ||
        a.data.date.valueOf() - b.data.date.valueOf()
    )
}

export interface SeriesView {
  series: SeriesEntry
  posts: Post[]
}

/** Every series that has at least one post in this locale, plus empty ones. */
export async function getSeriesViews(lang: LocaleCode): Promise<SeriesView[]> {
  const views: SeriesView[] = []
  for (const series of SERIES) {
    views.push({ series, posts: await getSeriesPosts(series.id, lang) })
  }
  return views.sort((a, b) => a.series.order - b.series.order)
}

/** All posts in any locale, keyed by translationKey — used for language links. */
export async function getTranslationMap(): Promise<Map<string, Partial<Record<LocaleCode, Post>>>> {
  const posts = await getCollection('posts')
  const map = new Map<string, Partial<Record<LocaleCode, Post>>>()
  for (const post of posts) {
    const key = post.data.translationKey
    const entry = map.get(key) || {}
    entry[post.data.lang as LocaleCode] = post
    map.set(key, entry)
  }
  return map
}

export function siblings(posts: Post[], current: Post) {
  const index = posts.findIndex((p) => p.id === current.id)
  return {
    previous: index > 0 ? posts[index - 1] : undefined,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  }
}

export async function getNotes(lang: LocaleCode): Promise<Note[]> {
  const notes = await getCollection('notes', ({ data }) => data.lang === lang)
  return notes.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getPage(lang: LocaleCode, slug: string): Promise<Page | undefined> {
  const pages = await getCollection('pages', ({ data }) => data.lang === lang)
  return pages.find((p) => p.id.endsWith(slug))
}

/** Rough reading time; CJK counts characters, Latin counts words. */
export function readingTime(text: string, lang: LocaleCode): number {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const words = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9'’-]+/g) || []).length
  const minutes = lang === 'zh' ? cjk / 380 + words / 200 : words / 220 + cjk / 380
  return Math.max(1, Math.round(minutes))
}

export function formatDate(date: Date, lang: LocaleCode): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return lang === 'zh' ? `${y} 年 ${Number(m)} 月 ${Number(d)} 日` : `${y}-${m}-${d}`
}

/** Compact numeric date for narrow list columns. */
export function formatDateShort(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function allTags(posts: Post[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export function sortByOrder(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const sa = a.data.series ? SERIES.findIndex((s) => s.id === a.data.series) : 99
    const sb = b.data.series ? SERIES.findIndex((s) => s.id === b.data.series) : 99
    return (
      sa - sb ||
      (a.data.seriesOrder ?? 999) - (b.data.seriesOrder ?? 999) ||
      b.data.date.valueOf() - a.data.date.valueOf()
    )
  })
}

/* ------------------------------------------------------- guide / path pages */

/** Every page of a track in one locale, in stage then page order. */
export async function getTrackPages(trackId: string, lang: LocaleCode): Promise<PathPage[]> {
  const pages = await getCollection(
    'docs',
    ({ data }) => data.lang === lang && data.track === trackId
  )
  return pages.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999))
}

export interface StageView {
  id: string
  /** The page rendered at the stage URL itself, if the stage has one. */
  index?: PathPage
  items: PathPage[]
}

export async function getStageView(
  trackId: string,
  stageId: string,
  lang: LocaleCode
): Promise<StageView> {
  const pages = (await getTrackPages(trackId, lang)).filter((p) => p.data.stage === stageId)
  return {
    id: stageId,
    index: pages.find((p) => p.data.stageIndex),
    items: pages.filter((p) => !p.data.stageIndex),
  }
}

export async function getStageViews(trackId: string, lang: LocaleCode): Promise<StageView[]> {
  const track = TRACKS.find((t) => t.id === trackId)
  const views: StageView[] = []
  for (const stage of track?.stages || []) {
    views.push(await getStageView(trackId, stage.id, lang))
  }
  return views
}

export async function getGuidePage(
  lang: LocaleCode,
  stage: string,
  slug: string
): Promise<PathPage | undefined> {
  const pages = await getCollection('docs', ({ data }) => data.lang === lang)
  return pages.find((p) => p.data.stage === stage && p.data.slug === slug)
}

/** A page as the sidebar needs it: which locale it lives in, and its entry. */
export interface DocsTreeEntry {
  page: PathPage
  /** The locale the page actually exists in — not necessarily the reader's. */
  lang: LocaleCode
}

export interface DocsTreeStage {
  id: string
  title: string
  items: DocsTreeEntry[]
  index?: DocsTreeEntry
}

export interface DocsTreeTrack {
  id: string
  title: string
  stages: DocsTreeStage[]
  total: number
}

/**
 * Every track with its stages and pages, for the docs sidebar.
 *
 * Built once per page render at build time: the whole point of the sidebar is
 * that any page of the manual is one click from any other, which means the tree
 * has to be present on every page.
 *
 * The tree spans **both locales**. A bilingual manual is written in whichever
 * language the author got to first, so a Chinese reader looking at the Android
 * track would otherwise see one page of four — the other three being English
 * was invisible rather than marked. Entries that only exist in the other locale
 * are listed too, flagged, and link there.
 */
export async function getDocsTree(lang: LocaleCode): Promise<DocsTreeTrack[]> {
  const others = LOCALES.map((l) => l.code as LocaleCode).filter((code) => code !== lang)
  const out: DocsTreeTrack[] = []

  for (const track of TRACKS) {
    const mine = await getStageViews(track.id, lang)
    const theirs = await Promise.all(others.map((code) => getStageViews(track.id, code)))

    const stages: DocsTreeStage[] = mine.map((stage, i) => {
      const pickStage = (code: LocaleCode) => theirs[others.indexOf(code)]?.[i]

      // One entry per translationKey, the reader's own language winning.
      const seen = new Set<string>()
      const items: DocsTreeEntry[] = []
      const addAll = (view: Awaited<ReturnType<typeof getStageView>> | undefined, code: LocaleCode) => {
        for (const page of view?.items || []) {
          const key = page.data.translationKey
          if (seen.has(key)) continue
          seen.add(key)
          items.push({ page, lang: code })
        }
      }
      addAll(stage, lang)
      for (const code of others) addAll(pickStage(code), code)

      const ownIndex = stage.index ? { page: stage.index, lang } : undefined
      const otherIndex = others
        .map((code) => pickStage(code)?.index)
        .map((page, idx) => (page ? { page, lang: others[idx] } : undefined))
        .find(Boolean)
      const indexEntry = ownIndex || otherIndex
      if (indexEntry) seen.add(indexEntry.page.data.translationKey)

      return {
        id: stage.id,
        title: (track.stages || []).find((s) => s.id === stage.id)?.title[lang] || stage.id,
        items,
        index: indexEntry,
      }
    })

    out.push({
      id: track.id,
      title: track.title[lang],
      stages: stages.filter((s) => s.items.length + (s.index ? 1 : 0) > 0),
      total: stages.reduce((n, s) => n + s.items.length + (s.index ? 1 : 0), 0),
    })
  }
  return out.filter((t) => t.total > 0)
}

/** Every page of one track in reading order — the sidebar's order. */
export async function trackSequence(
  trackId: string,
  lang: LocaleCode
): Promise<PathPage[]> {
  const stages = await getStageViews(trackId, lang)
  return stages.flatMap((stage) => stage.items)
}

/** Prev/next inside a stage, following `order`. */
export function stageSiblings(items: PathPage[], current: PathPage) {
  const index = items.findIndex((p) => p.id === current.id)
  return {
    previous: index > 0 ? items[index - 1] : undefined,
    next: index >= 0 && index < items.length - 1 ? items[index + 1] : undefined,
  }
}

export { DEFAULT_LOCALE }
