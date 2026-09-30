'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { imageSrc, type SanityImageField } from '@/sanity/lib/image'

export type HomeSlide = {
  _key: string
  title?: string | null
  mediaType?: 'image' | 'video' | null
  image?: SanityImageField | null
  videoUrl?: string | null
  poster?: SanityImageField | null
  project?: {
    _id?: string | null
    title?: string | null
    slug?: string | null
  } | null
}

export type HomeData = {
  slides?: HomeSlide[] | null
}

function slideHasMedia(slide: HomeSlide) {
  if (slide.mediaType === 'video') return Boolean(slide.videoUrl)
  return Boolean(slide.image?.asset || slide.image?.url)
}

export default function Home({ home }: { home: HomeData | null }) {
  const slides = (home?.slides ?? []).filter(slideHasMedia)
  const total = slides.length
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const updateActiveFromScroll = useCallback(() => {
    const root = scrollRef.current
    if (!root || total === 0) return

    const mid = root.scrollTop + root.clientHeight / 2
    let best = 0
    let bestDist = Infinity

    const items = root.querySelectorAll<HTMLElement>('[data-slide-index]')
    for (const item of items) {
      const top = item.offsetTop
      const center = top + item.offsetHeight / 2
      const dist = Math.abs(center - mid)
      if (dist < bestDist) {
        bestDist = dist
        best = Number(item.dataset.slideIndex) || 0
      }
    }

    setActiveIndex(best)
  }, [total])

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return

    updateActiveFromScroll()
    root.addEventListener('scroll', updateActiveFromScroll, { passive: true })
    window.addEventListener('resize', updateActiveFromScroll)

    return () => {
      root.removeEventListener('scroll', updateActiveFromScroll)
      window.removeEventListener('resize', updateActiveFromScroll)
    }
  }, [updateActiveFromScroll, slides.length])

  const activeSlide = slides[activeIndex]
  const activeTitle =
    activeSlide?.title?.trim() || activeSlide?.project?.title?.trim() || ''

  if (total === 0) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-black text-white">
        <p className="text-sm tracking-wide">Add images or videos in Sanity → Home Page</p>
      </div>
    )
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-x-0 top-5 z-20 flex justify-center md:top-8">
        <span className="text-sm tracking-wide font-bold text-white md:text-base">OS</span>
      </div>

      <div className="pointer-events-none absolute left-4 top-1/2 z-20 max-w-[40%] -translate-y-1/2 md:left-7">
        <span className="block text-xs tracking-wide text-white md:text-sm">
          {activeTitle}
        </span>
      </div>

      <div className="pointer-events-none absolute right-4 top-1/2 z-20 -translate-y-1/2 md:right-7">
        <span className="text-xs tracking-wide text-white md:text-sm">
          {activeIndex + 1}/{total}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-none md:snap-none"
      >
        {slides.map((slide, index) => {
          const slug = slide.project?.slug
          const href = slug ? `/projects/${slug}` : null
          const isVideo = slide.mediaType === 'video' && slide.videoUrl
          const alt = slide.image?.alt || slide.title || slide.project?.title || 'Project media'

          const imgSrc = imageSrc(slide.image, { width: 2560, quality: 85 })
          const posterSrc = imageSrc(slide.poster, { width: 1600, quality: 70 }) || undefined

          const media = isVideo ? (
            <video
              className="pointer-events-none block h-full w-full object-cover md:h-auto md:object-contain"
              src={slide.videoUrl!}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              preload={index === 0 ? 'auto' : 'metadata'}
              aria-label={alt}
            />
          ) : imgSrc ? (
            <Image
              src={imgSrc}
              alt={alt}
              width={2560}
              height={1600}
              priority={index === 0}
              className="block h-full w-full object-cover md:h-auto md:w-full md:object-contain"
              sizes="100vw"
            />
          ) : null

          return (
            <section
              key={slide._key}
              data-slide-index={index}
              className="relative h-[100dvh] w-full shrink-0 snap-start snap-always leading-none md:h-auto md:snap-align-none"
            >
              {href ? (
                <Link
                  href={href}
                  className="block h-full w-full leading-none md:h-auto"
                  aria-label={slide.title || slide.project?.title || 'Open project'}
                >
                  {media}
                </Link>
              ) : (
                <div className="block h-full w-full leading-none md:h-auto">{media}</div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
