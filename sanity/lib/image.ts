import { createImageUrlBuilder } from '@sanity/image-url'

import { sanityConfig } from './env'

const builder = createImageUrlBuilder({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
})

export type SanityImageField = {
  alt?: string | null
  hotspot?: { x?: number; y?: number } | null
  crop?: unknown
  asset?: { _ref?: string; _id?: string; url?: string | null } | null
  url?: string | null
  width?: number | null
  height?: number | null
}

/** Sanity CDN builder — use `.auto('format')` for WebP/AVIF when the browser supports it */
export function urlFor(source: SanityImageField) {
  // Builder accepts Sanity image objects; our field shape is compatible at runtime
  return builder.image(source as Parameters<typeof builder.image>[0]).auto('format').fit('max')
}

/**
 * High-res optimized URL for site media.
 * Defaults to 2400px wide @ q=85 with auto format.
 */
export function imageSrc(
  image: SanityImageField | null | undefined,
  opts: { width?: number; height?: number; quality?: number } = {},
) {
  if (!image) return null
  const { width, height, quality = 85 } = opts
  const w = width ?? (height ? undefined : 2400)

  const hasAsset = Boolean(image.asset?._ref || image.asset?._id)
  if (hasAsset) {
    let b = urlFor(image).quality(quality).dpr(2)
    if (w) b = b.width(w)
    if (height) b = b.height(height)
    return b.url()
  }

  if (image.url) {
    try {
      const u = new URL(image.url)
      u.searchParams.set('auto', 'format')
      u.searchParams.set('fit', 'max')
      u.searchParams.set('q', String(quality))
      u.searchParams.set('dpr', '2')
      if (w) u.searchParams.set('w', String(w))
      if (height) u.searchParams.set('h', String(height))
      return u.toString()
    } catch {
      return image.url
    }
  }

  return null
}
