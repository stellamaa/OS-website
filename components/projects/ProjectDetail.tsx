'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import AboutLink from '@/components/AboutLink'
import AutoPlayVideo from '@/components/AutoPlayVideo'
import osLogo from '@/public/assets/og-logo.svg'
import { imageSrc, type SanityImageField } from '@/sanity/lib/image'

export type DisplayMode = 'landscape' | 'portrait' | 'irregular'

export type ProjectBlock = {
  _key: string
  _type?: string | null
  mediaType?: 'image' | 'video' | 'text' | 'spacer25' | 'spacer50' | null
  displayMode?: DisplayMode | null
  caption?: string | null
  text?: string | null
  textMobile?: string | null
  image?: SanityImageField | null
  videoUrl?: string | null
  videoWidth?: number | null
  videoHeight?: number | null
  poster?: SanityImageField | null
}

function isLegacySpacer(block: ProjectBlock) {
  return (
    block._type === 'projectSpacer25' ||
    block._type === 'projectSpacer50' ||
    block.mediaType === 'spacer25' ||
    block.mediaType === 'spacer50'
  )
}

/** Resolve Sanity display mode, falling back to asset aspect if unset. */
function resolveDisplayMode(
  block: ProjectBlock,
  width?: number | null,
  height?: number | null,
): DisplayMode {
  if (
    block.displayMode === 'landscape' ||
    block.displayMode === 'portrait' ||
    block.displayMode === 'irregular'
  ) {
    return block.displayMode
  }
  if (width != null && height != null && width > 0 && height > 0) {
    return width >= height ? 'landscape' : 'portrait'
  }
  return 'landscape'
}

function ProjectVideo({
  src,
  poster,
  priority,
  label,
  isDesktop,
  mode,
}: {
  src: string
  poster?: string
  priority?: boolean
  label: string
  isDesktop: boolean
  mode: DisplayMode
}) {
  const className = !isDesktop
    ? mode === 'portrait'
      ? 'h-full w-full object-cover'
      : 'block h-auto w-full object-contain'
    : mode === 'landscape'
      ? 'h-full w-full object-cover'
      : 'h-full w-auto max-w-full object-contain'

  return (
    <AutoPlayVideo
      className={className}
      src={src}
      poster={poster}
      playKey={src}
      preload={priority ? 'auto' : 'metadata'}
      aria-label={label}
    />
  )
}

export type ProjectDetailData = {
  _id: string
  title?: string | null
  slug?: string | null
  blocks?: ProjectBlock[] | null
}

function blockIsValid(block: ProjectBlock) {
  // Legacy empty-space blocks are ignored — use displayMode on images instead
  if (isLegacySpacer(block)) return false
  if (block.mediaType === 'video') return Boolean(block.videoUrl)
  if (block.mediaType === 'text') {
    return Boolean(block.text?.trim() || block.textMobile?.trim())
  }
  return Boolean(block.image?.asset || block.image?.url)
}

function isChromeHiddenBlock(block: ProjectBlock | undefined) {
  if (!block) return false
  return block.mediaType === 'text'
}

function isCountedMedia(block: ProjectBlock) {
  if (isLegacySpacer(block) || block.mediaType === 'text') return false
  if (block.mediaType === 'video') return Boolean(block.videoUrl)
  return Boolean(block.image?.asset || block.image?.url)
}

function objectPositionFromHotspot(hotspot?: { x?: number; y?: number } | null) {
  if (hotspot?.x == null || hotspot?.y == null) return 'center'
  return `${hotspot.x * 100}% ${hotspot.y * 100}%`
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isDesktop
}

export default function ProjectDetail({ project }: { project: ProjectDetailData }) {
  const blocks = (project.blocks ?? []).filter(blockIsValid)
  const mediaBlocks = blocks.filter(isCountedMedia)
  const mediaTotal = mediaBlocks.length
  const firstMediaIndex = blocks.findIndex(isCountedMedia)
  const [activeIndex, setActiveIndex] = useState(firstMediaIndex >= 0 ? firstMediaIndex : 0)
  const [entered, setEntered] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const isDesktop = useIsDesktop()

  // Soft, quick fade so the first image doesn't pop in
  useEffect(() => {
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [])

  const updateActiveFromScroll = useCallback(() => {
    const root = scrollRef.current
    if (!root || blocks.length === 0) return

    const mid = root.scrollTop + root.clientHeight / 2
    let containing = -1
    let best = -1
    let bestDist = Infinity

    const items = root.querySelectorAll<HTMLElement>('[data-block-index]')
    for (const item of items) {
      if (item.offsetHeight < 1) continue
      const index = Number(item.dataset.blockIndex)
      if (Number.isNaN(index)) continue
      const top = item.offsetTop
      const bottom = top + item.offsetHeight
      if (mid >= top && mid < bottom) containing = index
      const center = top + item.offsetHeight / 2
      const dist = Math.abs(center - mid)
      if (dist < bestDist) {
        bestDist = dist
        best = index
      }
    }

    const next = containing >= 0 ? containing : best
    if (next >= 0) setActiveIndex(next)
  }, [blocks.length])

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return

    updateActiveFromScroll()
    root.addEventListener('scroll', updateActiveFromScroll, { passive: true })
    window.addEventListener('resize', updateActiveFromScroll)
    const observer = new ResizeObserver(() => updateActiveFromScroll())
    observer.observe(root)

    return () => {
      observer.disconnect()
      root.removeEventListener('scroll', updateActiveFromScroll)
      window.removeEventListener('resize', updateActiveFromScroll)
    }
  }, [updateActiveFromScroll, isDesktop])

  const activeBlock = blocks[activeIndex]
  const hideChrome = isChromeHiddenBlock(activeBlock)
  const activeCaption = hideChrome ? '' : activeBlock?.caption?.trim() || ''
  const projectName = (project.title || '').toUpperCase()
  const mediaIndex = mediaBlocks.findIndex((block) => block._key === activeBlock?._key)

  if (blocks.length === 0) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-white text-black">
        <p className="text-sm tracking-wide">Add page blocks in Sanity → Project</p>
      </div>
    )
  }

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-white"
      style={{
        opacity: entered ? 1 : 0,
        transition: 'opacity 480ms cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    >
      <Link
        href="/home"
        className="absolute left-4 top-5 z-30 text-xs tracking-wide text-white mix-blend-difference hover:opacity-60 md:left-7 md:top-8 md:text-sm 4xl:text-4xl 4xl:top-20 4xl:left-15"
      >
        Projects
      </Link>

      <div className="absolute inset-x-0 top-5 z-20 flex justify-center mix-blend-difference md:top-8 4xl:top-20">
        <AboutLink aria-label="About" className="hover:opacity-60">
          <Image src={osLogo} alt="" priority className="h-4 w-auto md:h-[1.15rem] 4xl:h-12" />
        </AboutLink>
      </div>

      {!hideChrome ? (
        <>
          <div className="pointer-events-none absolute bottom-2 left-4 z-20 max-w-[40%] mix-blend-difference md:bottom-3 md:left-7">
            <span className="block text-xs tracking-wide text-white md:text-sm 4xl:text-4xl">
              {projectName}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center px-16 mix-blend-difference md:bottom-3">
            <span className="block text-center text-xs tracking-wide text-white 4xl:text-4xl md:text-sm">
              {activeCaption}
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-2 right-4 z-20 mix-blend-difference md:bottom-3 md:right-7">
            <span className="text-xs tracking-wide text-white md:text-sm 4xl:text-4xl">
              {mediaIndex + 1}/{mediaTotal}
            </span>
          </div>
        </>
      ) : null}

      <div
        ref={scrollRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-none"
      >
        {blocks.map((block, index) => {
          const type = block.mediaType || 'image'

          if (type === 'text') {
            const desktopText = block.text?.trim() || ''
            const mobileOnly = block.textMobile?.trim() || ''
            // Mobile: always prefer textMobile; never show desktop copy on small screens when mobile text exists
            const body = isDesktop
              ? desktopText || mobileOnly
              : mobileOnly || desktopText

            if (!body) return null

            return (
              <section
                key={block._key}
                data-block-index={index}
                className="relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-white px-8 md:px-16"
              >
                <p
                  className={
                    isDesktop
                      ? 'max-w-[50rem] whitespace-pre-line text-center text-base leading-6 tracking-wide text-black 4xl:max-w-[95rem] 4xl:text-4xl 4xl:leading-13'
                      : 'max-w-md whitespace-pre-line text-center text-sm leading-5 tracking-wide text-black'
                  }
                >
                  {body}
                </p>
              </section>
            )
          }

          if (type === 'video' && block.videoUrl) {
            const mode = resolveDisplayMode(
              block,
              block.videoWidth,
              block.videoHeight,
            )
            const mobileLandscape = !isDesktop && mode === 'landscape'
            const mobileIrregular = !isDesktop && mode === 'irregular'

            return (
              <section
                key={block._key}
                data-block-index={index}
                className={
                  mobileIrregular
                    ? 'relative w-full shrink-0 snap-start leading-none'
                    : mobileLandscape
                      ? 'relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-white leading-none'
                      : 'relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-white'
                }
              >
                <ProjectVideo
                  src={block.videoUrl}
                  poster={imageSrc(block.poster, { width: 1600, quality: 70 }) || undefined}
                  priority={index === 0}
                  label={block.caption || project.title || 'Project video'}
                  isDesktop={isDesktop}
                  mode={mode}
                />
              </section>
            )
          }

          const objectPosition = objectPositionFromHotspot(block.image?.hotspot)
          const imgW = block.image?.width ?? 1
          const imgH = block.image?.height ?? 1
          const mode = resolveDisplayMode(block, imgW, imgH)
          const src =
            mode === 'irregular' && !isDesktop
              ? imageSrc(block.image, { width: 1600, quality: 90 })
              : mode === 'landscape' && isDesktop
                ? imageSrc(block.image, { width: 3840, quality: 90 })
                : mode === 'portrait' && !isDesktop
                  ? imageSrc(block.image, { width: 1600, quality: 90 })
                  : imageSrc(block.image, {
                      // portrait/irregular desktop: tall as viewport; landscape mobile
                      width: isDesktop ? undefined : 1920,
                      height: isDesktop ? 2400 : undefined,
                      quality: 90,
                    })

          const alt = block.image?.alt || block.caption || project.title || ''

          // Landscape — desktop: full-bleed cover
          //            mobile: centered in 100vh with white letterboxing
          // Portrait  — desktop: viewport-tall, natural width
          //            mobile: full-bleed cover
          // Irregular — desktop: viewport-tall, natural width
          //            mobile: full width, natural height, no letterboxing
          if (!isDesktop) {
            if (mode === 'irregular') {
              // Full-bleed width, natural height — no letterboxing, section hugs the image
              return (
                <section
                  key={block._key}
                  data-block-index={index}
                  className="relative w-full shrink-0 snap-start leading-none"
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={alt}
                      width={imgW}
                      height={imgH}
                      priority={index === 0}
                      className="block h-auto w-full max-w-none object-contain"
                      style={{ objectPosition, width: '100%', height: 'auto' }}
                      sizes="100vw"
                    />
                  ) : null}
                </section>
              )
            }

            if (mode === 'landscape') {
              return (
                <section
                  key={block._key}
                  data-block-index={index}
                  className="relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-white leading-none"
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={alt}
                      width={imgW}
                      height={imgH}
                      priority={index === 0}
                      className="block h-auto w-full object-contain"
                      style={{ objectPosition, width: '100%', height: 'auto' }}
                      sizes="100vw"
                    />
                  ) : null}
                </section>
              )
            }

            // portrait — full bleed
            return (
              <section
                key={block._key}
                data-block-index={index}
                className="relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-white leading-none"
              >
                {src ? (
                  <Image
                    src={src}
                    alt={alt}
                    width={imgW}
                    height={imgH}
                    priority={index === 0}
                    className="h-full w-full object-cover"
                    style={{ objectPosition }}
                    sizes="100vw"
                  />
                ) : null}
              </section>
            )
          }

          // Desktop — landscape: full-bleed; portrait & irregular: viewport-tall, natural width
          if (mode === 'portrait' || mode === 'irregular') {
            return (
              <section
                key={block._key}
                data-block-index={index}
                className="relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-white"
              >
                {src ? (
                  <Image
                    src={src}
                    alt={alt}
                    width={imgW}
                    height={imgH}
                    priority={index === 0}
                    className="h-full w-auto max-w-full object-contain"
                    style={{ objectPosition, height: '100%', width: 'auto' }}
                    sizes="60vw"
                  />
                ) : null}
              </section>
            )
          }

          return (
            <section
              key={block._key}
              data-block-index={index}
              className="relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-white"
            >
              {src ? (
                <div className="relative h-full w-full">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    style={{ objectPosition }}
                    sizes="100vw"
                  />
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    </div>
  )
}
