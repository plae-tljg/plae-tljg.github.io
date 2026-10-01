import { LOCALES, type LocaleCode } from '../site.mjs'

const BASE = import.meta.env.BASE_URL || '/'

/** Prefix a site-absolute path with the configured deployment base. */
export function withBase(pathname: string): string {
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${p}` || '/'
}

export function absoluteUrl(pathname: string): string {
  return new URL(withBase(pathname), import.meta.env.SITE).href
}

export function localePath(lang: LocaleCode, ...segments: string[]): string {
  const tail = segments.filter(Boolean).join('/')
  return withBase(`/${lang}/${tail ? tail + '/' : ''}`)
}

/* ---------------------------------------------------------------- sections */

/** /<lang>/writing/ — the article section (series live inside it). */
export function writingPath(lang: LocaleCode): string {
  return localePath(lang, 'writing')
}

/** /<lang>/writing/<slug>/ — one article. */
export function articlePath(lang: LocaleCode, slug: string): string {
  return localePath(lang, 'writing', slug)
}

/** /<lang>/writing/series/<id>/ — one series. */
export function seriesPath(lang: LocaleCode, id: string): string {
  return localePath(lang, 'writing', 'series', id)
}

/** /<lang>/docs/ — the documentation section (tracks live inside it). */
export function docsPath(lang: LocaleCode): string {
  return localePath(lang, 'docs')
}

/** /<lang>/docs/<track>/ — a track's landing page. */
export function trackPath(lang: LocaleCode, trackId: string): string {
  return localePath(lang, 'docs', trackId)
}

/** /<lang>/docs/<track>/<stage>/ — one stage of a track. */
export function stagePath(lang: LocaleCode, trackId: string, stage: string): string {
  return localePath(lang, 'docs', trackId, stage)
}

/** /<lang>/docs/<track>/<stage>/<slug>/ — one page of a track. */
export function guidePath(
  lang: LocaleCode,
  trackId: string,
  stage: string,
  slug: string
): string {
  return localePath(lang, 'docs', trackId, stage, slug)
}

/** /<lang>/docs/notes/<slug>/ — the site's own older tutorial posts. */
export function notePath(lang: LocaleCode, slug: string): string {
  return localePath(lang, 'docs', 'notes', slug)
}

/** /<lang>/projects/ — the project and repository index. */
export function projectsPath(lang: LocaleCode): string {
  return localePath(lang, 'projects')
}

/** /<lang>/archive/ — the cross-section index. */
export function archivePath(lang: LocaleCode): string {
  return localePath(lang, 'archive')
}

export function tagPath(lang: LocaleCode, tag: string): string {
  return localePath(lang, 'tags', encodeURIComponent(tag))
}

/** Swap the locale segment of the current path, keeping the rest. */
export function switchLocalePath(pathname: string, to: LocaleCode): string {
  const stripped = pathname.replace(/^\/(zh|en)(?=\/|$)/, '')
  return withBase(`/${to}${stripped || '/'}`)
}

/** getStaticPaths() params for every configured locale. */
export function localePaths() {
  return LOCALES.map((locale) => ({ params: { lang: locale.code } }))
}
