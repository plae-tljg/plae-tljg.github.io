/**
 * Repository index for /projects/.
 *
 * The facts come from `src/content/repos.json`, a committed GitHub API snapshot
 * produced by `npm run repos:sync`; the grouping, ordering and hand-written
 * corrections come from `repos.config.mjs`. Nothing here calls the network.
 */
import data from '../content/repos.json'
import { GROUPS, FEATURED, OVERRIDES, IMPORTED_HERE } from '../../repos.config.mjs'
import type { LocaleCode } from '../site.mjs'

export interface Repo {
  fullName: string
  account: string
  name: string
  url: string
  homepage: string
  description: string
  descriptionOverride?: Partial<Record<LocaleCode, string>>
  note?: Partial<Record<LocaleCode, string>>
  language: string
  stars: number
  forks: number
  topics: string[]
  createdAt: string
  pushedAt: string
  isFork: boolean
  parent: string
  license: string
  archived: boolean
  hasPages: boolean
  importedAt?: string
}

export interface RepoGroup {
  id: string
  title: Record<LocaleCode, string>
  description: Record<LocaleCode, string>
  repos: Repo[]
}

interface Snapshot {
  generatedAt: string
  accounts: { login: string; label: Record<LocaleCode, string>; note: Record<LocaleCode, string> }[]
  repos: Repo[]
}

const snapshot = data as unknown as Snapshot

export const generatedAt: string = snapshot.generatedAt
export const accounts = snapshot.accounts
export const allRepos: Repo[] = snapshot.repos

const byName = new Map(allRepos.map((repo) => [repo.fullName, repo]))

/** Groups in the order declared in repos.config.mjs. */
export function repoGroups(): RepoGroup[] {
  return GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    repos: group.repos.map((id) => byName.get(id)).filter((r): r is Repo => Boolean(r)),
  }))
}

/** Curated highlight list, falling back to the most-starred repos. */
export function featuredRepos(): Repo[] {
  const picked = FEATURED.map((id) => byName.get(id)).filter((r): r is Repo => Boolean(r))
  if (picked.length > 0) return picked
  return [...allRepos].sort((a, b) => b.stars - a.stars).slice(0, 6)
}

/** Description in the requested language, with the hand-written override first. */
export function repoDescription(repo: Repo, lang: LocaleCode): string {
  return repo.descriptionOverride?.[lang] || repo.description || ''
}

export function repoNote(repo: Repo, lang: LocaleCode): string {
  return repo.note?.[lang] || ''
}

export function repoImportedAt(repo: Repo): string | undefined {
  return repo.importedAt || IMPORTED_HERE[repo.fullName as keyof typeof IMPORTED_HERE]
}

export function repoStats() {
  const forks = allRepos.filter((r) => r.isFork).length
  const languages = new Set(allRepos.map((r) => r.language).filter(Boolean))
  const stars = allRepos.reduce((sum, r) => sum + r.stars, 0)
  return { total: allRepos.length, forks, languages: languages.size, stars }
}

/** Repos newer than the curated config would otherwise silently disappear. */
export function ungroupedRepos(): Repo[] {
  const grouped = new Set(GROUPS.flatMap((g) => g.repos))
  return allRepos.filter((r) => !grouped.has(r.fullName))
}

export { OVERRIDES }
