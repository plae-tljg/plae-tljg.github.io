/**
 * Image imports for the site. Kept out of src/site.mjs because that module is
 * also loaded by the Node content CLI, which cannot import image assets.
 */
import type { ImageMetadata } from 'astro'
import heroFormulas from '../assets/hero-formulas.jpg'
import seriesMath from '../assets/series-math.jpg'
import seriesSystems from '../assets/series-systems.jpg'
import seriesTinkering from '../assets/series-tinkering.jpg'
import mathPathHero from '../assets/paths/math-path-hero.jpeg'

export const HERO: ImageMetadata = heroFormulas

/** Series id → cover image. */
export const COVERS: Record<string, ImageMetadata> = {
  'why-ai-takes-over-math': seriesMath,
  'ai-maintainable-systems': seriesSystems,
  'tinkering-notes': seriesTinkering,
}

export function coverFor(seriesId: string): ImageMetadata | undefined {
  return COVERS[seriesId]
}

/**
 * Track id → hero image. Only the learning path has one: its mascot is part of
 * that track's joke, and hanging it over the Ubuntu manual was just wrong.
 */
export const TRACK_HEROES: Record<string, ImageMetadata> = {
  'math-path': mathPathHero,
}

export function heroFor(trackId: string): ImageMetadata | undefined {
  return TRACK_HEROES[trackId]
}
