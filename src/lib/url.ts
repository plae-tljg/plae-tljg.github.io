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

export function postPath(lang: LocaleCode, slug: string): string {
  return localePath(lang, 'posts', slug)
}

export function seriesPath(lang: LocaleCode, id: string): string {
  return localePath(lang, 'series', id)
}

export function tagPath(lang: LocaleCode, tag: string): string {
  return localePath(lang, 'tags', encodeURIComponent(tag))
}

export function notePath(lang: LocaleCode, slug: string): string {
  return localePath(lang, 'notes', slug)
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
