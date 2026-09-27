/**
 * Types for the shared config in src/site.mjs (kept as .mjs so the Node
 * content CLI and Astro can both import it).
 */

export type LocaleCode = 'zh' | 'en'

export interface SeriesEntry {
  id: string
  order: number
  title: Record<LocaleCode, string>
  description: Record<LocaleCode, string>
  state: 'closed' | 'ongoing'
  languages: LocaleCode[]
  /** Key into IMAGE_CREDITS. */
  cover?: string
  dir: string
  aliases: string[]
}

export interface ImageCredit {
  title: string
  author: string
  license: string
  licenseUrl: string
  source: string
}

export interface LocaleEntry {
  code: LocaleCode
  label: string
  short: string
  htmlLang: string
  ogLocale: string
}

export const SITE_URL: string
export const STAGING: boolean
export const SITE: {
  url: string
  staging: boolean
  author: string
  github: string
  title: Record<LocaleCode, string>
  tagline: Record<LocaleCode, string>
  description: Record<LocaleCode, string>
}
export const LOCALES: LocaleEntry[]
export const DEFAULT_LOCALE: LocaleCode
export const UI: Record<LocaleCode, Record<string, string>>
export const SERIES: SeriesEntry[]
export const IMAGE_CREDITS: Record<string, ImageCredit>
export const CONTENT_SYNC: Record<string, unknown>
