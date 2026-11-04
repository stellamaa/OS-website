'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import AboutLink from '@/components/AboutLink'
import AutoPlayVideo from '@/components/AutoPlayVideo'
import {
  SITE_TRANSITIONS_ENABLED,
  useSiteTransition,
} from '@/components/SiteTransition'
import osLogo from '@/public/assets/og-logo.svg'
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
  const {
    goProject,
    projectChromeFlight,
    homeScrollRestore,
    clearHomeScrollRestore,
    finishHomeReturn,
  } = useSiteTransition()
  const slides = (home?.slides ?? []).filter(slideHasMedia)
  const total = slides.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [returnSlideIndex, setReturnSlideIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const pinTopRef = useRef<number | null>(null)
  const returnFinishedRef = useRef(false)
  const hideChrome = Boolean(projectChromeFlight)
  const returning = projectChromeFlight?.direction === 'up'
  const pinning = returnSlideIndex != null

  const updateActiveFromScroll = useCallback(() => {
    const root = scrollRef.current
    if (!root || total === 0) return

    // Switch when the next slide is about halfway into the viewport
    // (its top edge has reached the vertical midpoint).
    const mid = root.scrollTop + root.clientHeight / 2
    let best = 0

    const items = root.querySelectorAll<HTMLElement>('[data-slide-index]')
    for (const item of items) {
      const index = Number(item.dataset.slideIndex) || 0
      if (item.offsetTop <= mid) best = index
    }

    setActiveIndex(best)
  }, [total])

  const mediaAt = useCallback((index: number) => {
    const root = scrollRef.current
    if (!root) return null
    const slide = root.querySelector<HTMLElement>(`[data-slide-index="${index}"]`)
    return slide?.querySelector<HTMLElement>('img, video') ?? null
  }, [])

  const mediaReady = useCallback((media: HTMLElement | null) => {
    if (!media) return false
    if (media instanceof HTMLImageElement) {
      return media.complete && media.naturalWidth > 0
    }
    if (media instanceof HTMLVideoElement) {
      return media.readyState >= 1 || Boolean(media.poster)
    }
    return true
  }, [])

  const priorsReady = useCallback(
    (slideIndex: number) => {
      for (let i = 0; i <= slideIndex; i++) {
        if (!mediaReady(mediaAt(i))) return false
      }
      return true
    },
    [mediaAt, mediaReady],
  )

  // Capture restore payload; with transitions on, pin under the bridge until layout settles.
  useLayoutEffect(() => {
    if (!homeScrollRestore || !scrollRef.current) return
    const restore = homeScrollRestore
    scrollRef.current.scrollTop = restore.scrollTop
    setActiveIndex(restore.slideIndex)
    clearHomeScrollRestore()

    if (!SITE_TRANSITIONS_ENABLED) {
      requestAnimationFrame(() => {
        if (!scrollRef.current) return
        scrollRef.current.scrollTop = restore.scrollTop
        updateActiveFromScroll()
      })
      return
    }

    setReturnSlideIndex(restore.slideIndex)
    pinTopRef.current = restore.bridgeRect?.top ?? null
    returnFinishedRef.current = false
  }, [homeScrollRestore, clearHomeScrollRestore, updateActiveFromScroll])

  // Keep the target media locked to the bridge Y while layout (images above) settles,
  // and for a short window after the overlay clears so late loads don't jump.
  useLayoutEffect(() => {
    if (!SITE_TRANSITIONS_ENABLED) return
    if (returnSlideIndex == null || pinTopRef.current == null) return
    const root = scrollRef.current
    if (!root) return

    let raf = 0
    let stableFrames = 0
    let settleFrames = 0
    let bridgeReleased = false

    const tick = () => {
      const media = mediaAt(returnSlideIndex)
      const pinTop = pinTopRef.current
      if (media && pinTop != null) {
        const dy = media.getBoundingClientRect().top - pinTop
        if (Math.abs(dy) > 0.5) {
          root.scrollTop += dy
          stableFrames = 0
        } else {
          stableFrames += 1
        }
      }

      const ready =
        mediaReady(media) && priorsReady(returnSlideIndex) && stableFrames >= 4

      if (!returnFinishedRef.current && ready) {
        returnFinishedRef.current = true
        updateActiveFromScroll()
        finishHomeReturn()
      }

      // After the flying chrome unmounts, keep pinning briefly for late reflows
      if (returnFinishedRef.current && !projectChromeFlight) {
        if (!bridgeReleased) {
          bridgeReleased = true
          settleFrames = 0
        }
        settleFrames += 1
        if (settleFrames > 45 && stableFrames >= 4) {
          setReturnSlideIndex(null)
          pinTopRef.current = null
          return
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [
    returnSlideIndex,
    projectChromeFlight,
    mediaAt,
    mediaReady,
    priorsReady,
    updateActiveFromScroll,
    finishHomeReturn,
  ])

  // If we landed mid-return without a restore payload, still release the bridge
  useEffect(() => {
    if (!SITE_TRANSITIONS_ENABLED) return
    if (!returning || homeScrollRestore) return
    if (returnSlideIndex == null) {
      const id = window.setTimeout(() => finishHomeReturn(), 120)
      return () => window.clearTimeout(id)
    }
  }, [returning, homeScrollRestore, returnSlideIndex, finishHomeReturn])

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
      {!hideChrome ? (
        <div className="pointer-events-none absolute inset-x-0 top-5 z-20 flex justify-center mix-blend-difference md:top-8 4xl:top-10">
          <AboutLink aria-label="About" className="pointer-events-auto hover:opacity-60">
            <Image
              src={osLogo}
              alt=""
              priority
              className="h-6 w-auto md:h-6 4xl:h-11"
            />
          </AboutLink>
        </div>
      ) : null}

      {!hideChrome ? (
        <>
          <div className="pointer-events-none absolute left-4 top-1/2 z-20 max-w-[40%] -translate-y-1/2 md:left-7">
            <span className="block text-xs tracking-wide mix-blend-difference md:text-sm 4xl:text-2xl">
              {activeTitle}
            </span>
          </div>

          <div className="pointer-events-none absolute right-4 top-1/2 z-20 -translate-y-1/2 md:right-7">
            <span className="text-xs tracking-wide mix-blend-difference md:text-sm 4xl:text-2xl">
              {activeIndex + 1}/{total}
            </span>
          </div>
        </>
      ) : null}

      <div
        ref={scrollRef}
        className={
          pinning
            ? 'h-full w-full overflow-y-auto overscroll-none'
            : 'h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-none md:snap-none'
        }
      >
        {slides.map((slide, index) => {
          const slug = slide.project?.slug
          const href = slug ? `/projects/${slug}` : null
          const isVideo = slide.mediaType === 'video' && slide.videoUrl
          const alt = slide.image?.alt || slide.title || slide.project?.title || 'Project media'

          const imgSrc = imageSrc(slide.image, { width: 2560, quality: 85 })
          const posterSrc = imageSrc(slide.poster, { width: 1600, quality: 70 }) || undefined

          const isReturnTarget = returnSlideIndex === index
          const preloadForReturn =
            returnSlideIndex != null && index <= returnSlideIndex
          const media = isVideo ? (
            <AutoPlayVideo
              className="pointer-events-none block h-full w-full object-cover md:h-auto md:object-contain"
              src={slide.videoUrl!}
              poster={posterSrc}
              playKey={slide._key}
              preload={index === 0 || preloadForReturn ? 'auto' : 'metadata'}
              aria-label={alt}
            />
          ) : imgSrc ? (
            <Image
              src={imgSrc}
              alt={alt}
              width={2560}
              height={1600}
              priority={index === 0 || preloadForReturn}
              className="block h-full w-full object-cover md:h-auto md:w-full md:object-contain"
              sizes="100vw"
            />
          ) : null

          return (
            <section
              key={slide._key}
              data-slide-index={index}
              data-home-return-slide={isReturnTarget ? 'true' : undefined}
              className={
                pinning
                  ? 'relative h-[100dvh] w-full shrink-0 leading-none md:h-auto'
                  : 'relative h-[100dvh] w-full shrink-0 snap-start snap-always leading-none md:h-auto md:snap-align-none'
              }
            >
              {href ? (
                <Link
                  href={href}
                  prefetch
                  className="block h-full w-full leading-none md:h-auto"
                  aria-label={slide.title || slide.project?.title || 'Open project'}
                  onClick={(event) => {
                    event.preventDefault()
                    const title =
                      slide.title?.trim() ||
                      slide.project?.title?.trim() ||
                      activeTitle
                    const mediaEl = event.currentTarget.querySelector('img, video')
                    const rect = mediaEl?.getBoundingClientRect()
                    goProject(href, {
                      title,
                      counter: `${index + 1}/${total}`,
                      bridgeSrc: isVideo ? posterSrc || imgSrc : imgSrc,
                      bridgeRect: rect
                        ? {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height,
                          }
                        : null,
                      scrollTop: scrollRef.current?.scrollTop ?? 0,
                      slideIndex: index,
                    })
                  }}
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
