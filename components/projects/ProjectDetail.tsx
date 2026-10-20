'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import AboutLink from '@/components/AboutLink'
import AutoPlayVideo from '@/components/AutoPlayVideo'
import osLogo from '@/public/assets/og-logo.svg'
import { imageSrc, type SanityImageField } from '@/sanity/lib/image'

export type ProjectBlock = {
  _key: string
  _type?: string | null
  mediaType?: 'image' | 'video' | 'text' | 'spacer25' | 'spacer50' | null
  caption?: string | null
  text?: string | null
  textMobile?: string | null
  image?: SanityImageField | null
  videoUrl?: string | null
  videoWidth?: number | null
  videoHeight?: number | null
  poster?: SanityImageField | null
}

function spacerSize(block: ProjectBlock): 25 | 50 | null {
  if (block._type === 'projectSpacer25' || block.mediaType === 'spacer25') return 25
  if (block._type === 'projectSpacer50' || block.mediaType === 'spacer50') return 50
  return null
}

function ProjectVideo({
  src,
  poster,
  width,
  height,
  priority,
  label,
  isDesktop,
}: {
  src: string
  poster?: string
  width?: number | null
  height?: number | null
  priority?: boolean
  label: string
  isDesktop: boolean
}) {
  const knownLandscape =
    width != null && height != null && width > 0 && height > 0 ? width >= height : null
  const [isLandscape, setIsLandscape] = useState<boolean | null>(knownLandscape)

  // Mobile: full screen width, natural aspect, object-contain
  const className = !isDesktop
    ? 'block h-auto w-full object-contain'
    : isLandscape === false
      ? 'h-full w-auto max-w-full object-contain'
      : 'h-full w-full object-cover'

  return (
    <AutoPlayVideo
      className={className}
      src={src}
      poster={poster}
      playKey={src}
      preload={priority ? 'auto' : 'metadata'}
      aria-label={label}
      onLoadedMetadata={(e) => {
        if (knownLandscape != null) return
        const v = e.currentTarget
        if (v.videoWidth > 0 && v.videoHeight > 0) {
          setIsLandscape(v.videoWidth >= v.videoHeight)
        }
      }}
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
  if (spacerSize(block)) return true
  if (block.mediaType === 'video') return Boolean(block.videoUrl)
  if (block.mediaType === 'text') {
    return Boolean(block.text?.trim() || block.textMobile?.trim())
  }
  return Boolean(block.image?.asset || block.image?.url)
}

function isChromeHiddenBlock(block: ProjectBlock | undefined) {
  if (!block) return false
  if (spacerSize(block)) return true
  return block.mediaType === 'text'
}

function isCountedMedia(block: ProjectBlock) {
  if (spacerSize(block) || block.mediaType === 'text') return false
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
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#d9d9d9] text-black">
        <p className="text-sm tracking-wide">Add page blocks in Sanity → Project</p>
      </div>
    )
  }

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-[#dedede]"
      style={{
        opacity: entered ? 1 : 0,
        transition: 'opacity 480ms cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    >
      <Link
        href="/home"
        className="absolute left-4 top-5 z-30 text-xs tracking-wide text-white mix-blend-difference hover:opacity-60 md:left-7 md:top-8 md:text-sm 4xl:text-2xl"
      >
        Projects
      </Link>

      <div className="absolute inset-x-0 top-5 z-20 flex justify-center mix-blend-difference md:top-8">
        <AboutLink aria-label="About" className="hover:opacity-60">
          <Image src={osLogo} alt="" priority className="h-4 w-auto md:h-[1.15rem] 4xl:h-9" />
        </AboutLink>
      </div>

      {!hideChrome ? (
        <>
          <div className="pointer-events-none absolute bottom-2 left-4 z-20 max-w-[40%] mix-blend-difference md:bottom-3 md:left-7">
            <span className="block text-xs tracking-wide text-white md:text-sm 4xl:text-2xl">
              {projectName}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center px-16 mix-blend-difference md:bottom-3">
            <span className="block text-center text-xs tracking-wide text-white 4xl:text-2xl md:text-sm">
              {activeCaption}
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-2 right-4 z-20 mix-blend-difference md:bottom-3 md:right-7">
            <span className="text-xs tracking-wide text-white md:text-sm 4xl:text-2xl">
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

          const gap = spacerSize(block)
          if (gap) {
            // Mobile-only gap — collapsed on desktop
            if (isDesktop) {
              return (
                <section
                  key={block._key}
                  data-block-index={index}
                  aria-hidden
                  className="relative h-0 w-full overflow-hidden"
                />
              )
            }

            return (
              <section
                key={block._key}
                data-block-index={index}
                aria-hidden
                className={`relative w-full shrink-0 snap-start bg-[#dedede] ${
                  gap === 50 ? 'h-[50vh]' : 'h-[25vh]'
                }`}
              />
            )
          }

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
                className="relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-[#dedede] px-8 md:px-16"
              >
                <p
                  className={
                    isDesktop
                      ? 'max-w-[50rem] whitespace-pre-line text-center text-base leading-6 tracking-wide text-black 4xl:max-w-[75rem] 4xl:text-2xl 4xl:leading-8'
                      : 'max-w-md whitespace-pre-line text-center text-sm leading-5 tracking-wide text-black'
                  }
                >
                  {body}
                </p>
              </section>
            )
          }

          if (type === 'video' && block.videoUrl) {
            return (
              <section
                key={block._key}
                data-block-index={index}
                className={
                  isDesktop
                    ? 'relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-[#dedede]'
                    : 'relative flex w-full shrink-0 snap-start snap-always items-center justify-center bg-[#dedede] leading-none'
                }
              >
                <ProjectVideo
                  src={block.videoUrl}
                  poster={imageSrc(block.poster, { width: 1600, quality: 70 }) || undefined}
                  width={block.videoWidth}
                  height={block.videoHeight}
                  priority={index === 0}
                  label={block.caption || project.title || 'Project video'}
                  isDesktop={isDesktop}
                />
              </section>
            )
          }

          const objectPosition = objectPositionFromHotspot(block.image?.hotspot)
          const imgW = block.image?.width ?? 1
          const imgH = block.image?.height ?? 1
          const isLandscape = imgW >= imgH
          // Landscape: wide CDN source so full-width display stays sharp.
          // Portrait: tall source for viewport-height display.
          const src = isLandscape
            ? imageSrc(block.image, { width: 3840, quality: 90 })
            : imageSrc(block.image, {
                width: isDesktop ? undefined : 1600,
                height: isDesktop ? 2400 : undefined,
                quality: 90,
              })

          // Mobile: portrait fills 100vh; landscape centered in the viewport.
          // Desktop: landscape full-width contain; portrait viewport-tall.
          if (!isDesktop) {
            return (
              <section
                key={block._key}
                data-block-index={index}
                className="relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-[#dedede] leading-none"
              >
                {src ? (
                  isLandscape ? (
                    <Image
                      src={src}
                      alt={block.image?.alt || block.caption || project.title || ''}
                      width={imgW}
                      height={imgH}
                      priority={index === 0}
                      className="block h-auto w-full object-contain"
                      style={{ objectPosition, width: '100%', height: 'auto' }}
                      sizes="100vw"
                    />
                  ) : (
                    <Image
                      src={src}
                      alt={block.image?.alt || block.caption || project.title || ''}
                      width={imgW}
                      height={imgH}
                      priority={index === 0}
                      className="h-full w-full object-cover"
                      style={{ objectPosition }}
                      sizes="100vw"
                    />
                  )
                ) : null}
              </section>
            )
          }

          return (
            <section
              key={block._key}
              data-block-index={index}
              className="relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-[#dedede]"
            >
              {src ? (
                isLandscape ? (
                  <Image
                    src={src}
                    alt={block.image?.alt || block.caption || project.title || ''}
                    width={imgW}
                    height={imgH}
                    priority={index === 0}
                    className="h-full w-full object-contain"
                    style={{ objectPosition }}
                    sizes="100vw"
                  />
                ) : (
                  <Image
                    src={src}
                    alt={block.image?.alt || block.caption || project.title || ''}
                    width={imgW}
                    height={imgH}
                    priority={index === 0}
                    className="h-full w-auto max-w-full object-contain"
                    style={{ objectPosition, height: '100%', width: 'auto' }}
                    sizes="60vw"
                  />
                )
              ) : null}
            </section>
          )
        })}
      </div>
    </div>
  )
}
