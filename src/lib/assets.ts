/**
 * Image imports for the site. Kept out of src/site.mjs because that module is
 * also loaded by the Node content CLI, which cannot import image assets.
 */
import type { ImageMetadata } from 'astro'
import heroFormulas from '../assets/hero-formulas.jpg'
import seriesMath from '../assets/series-math.jpg'
import seriesSystems from '../assets/series-systems.jpg'

export const HERO: ImageMetadata = heroFormulas

/** Series id → cover image. */
export const COVERS: Record<string, ImageMetadata> = {
  'why-ai-takes-over-math': seriesMath,
  'ai-maintainable-systems': seriesSystems,
}

export function coverFor(seriesId: string): ImageMetadata | undefined {
  return COVERS[seriesId]
}
