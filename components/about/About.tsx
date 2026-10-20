'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useSiteTransition } from '@/components/SiteTransition'
import closeButton from '@/public/assets/closeButton.png'
import { imageSrc, type SanityImageField } from '@/sanity/lib/image'
import OficinaSateliteLogo from './OficinaSateliteLogo'

export type AboutProjectItem = {
  _id: string
  title?: string | null
  description?: string | null
  image?: SanityImageField | null
}

const CONTACT_LINKS = [
  { label: 'Mail', href: 'mailto:hello@oficinasatelite.com' },
  { label: 'Press', href: 'mailto:press@oficinasatelite.com' },
  { label: 'Applications', href: 'mailto:applications@oficinasatelite.com' },
] as const

function isDesktopViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
}

export default function About({ projects }: { projects: AboutProjectItem[] }) {
  const { leaveAbout } = useSiteTransition()
  const [activeId, setActiveId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const updateActiveFromScroll = useCallback(() => {
    if (isDesktopViewport()) return

    const root = scrollRef.current
    if (!root) return

    // Stay white at the top of the list
    if (root.scrollTop < 16) {
      setActiveId(null)
      return
    }

    const rootRect = root.getBoundingClientRect()
    const targetY = rootRect.top + Math.min(120, rootRect.height * 0.28)

    let bestId: string | null = null
    let bestDist = Infinity

    const items = root.querySelectorAll<HTMLElement>('[data-project-id]')
    for (const item of items) {
      const rect = item.getBoundingClientRect()
      if (rect.bottom < rootRect.top || rect.top > rootRect.bottom) continue

      const mid = (rect.top + rect.bottom) / 2
      const dist = Math.abs(mid - targetY)
      if (dist < bestDist) {
        bestDist = dist
        bestId = item.dataset.projectId ?? null
      }
    }

    if (bestId) setActiveId(bestId)
  }, [])

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
  }, [projects, updateActiveFromScroll])

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-white text-black">
        {/* Background: stacked project images crossfade on hover / mobile scroll */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {projects.map((project) => {
            const url = imageSrc(project.image, { width: 1600, quality: 70 })
            if (!url) return null
            return (
              <div
                key={project._id}
                className="absolute inset-0 transition-opacity duration-500 ease-in-out"
                style={{ opacity: activeId === project._id ? 1 : 0 }}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="scale-110 object-cover blur-2xl brightness-110"
                  sizes="100vw"
                />
              </div>
            )
          })}
          <div
            className="absolute inset-0 bg-white/35 transition-opacity duration-500 ease-in-out md:bg-white/25"
            style={{ opacity: activeId ? 1 : 0 }}
          />
        </div>

        {/*
          Plain black text — no mix-blend, so the blurry image never recolors it.
          Logo sits on top and difference-blends against this text + the image.
        */}
        <div className="relative flex h-full w-full flex-col px-5 py-5 md:px-7 md:py-8">
          <div className="relative flex min-h-0 flex-1 flex-col md:flex-row md:items-stretch md:justify-between md:gap-10">
            {/* Desktop left column */}
            <div className="relative hidden min-h-0 shrink-0 flex-col md:flex md:h-full md:w-[34%] md:max-w-[28rem] 4xl:max-w-none 4xl:w-auto">
              {/* Spacer matching logo size so intro stays below the overlaid logo */}
              <div className="h-[1.35rem] 4xl:h-8" aria-hidden />
              <p className="mt-4 max-w-[20rem] text-2xl leading-5 tracking-wide text-black md:max-w-[28rem] 4xl:mt-6 4xl:max-w-none 4xl:whitespace-nowrap 4xl:text-3xl 4xl:leading-8">
                is an architecture studio founded in 2021.
              </p>

              <div className="mt-auto flex flex-col gap-0 pt-10 text-sm 4xl:text-2xl tracking-normal text-black">
                {CONTACT_LINKS.map((link) => (
                  <a key={link.label} href={link.href} className="hover:opacity-60">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div
              ref={scrollRef}
              className="about-projects-scroll relative min-h-0 flex-1 overflow-y-auto overscroll-contain md:ml-auto md:mr-10 md:h-full md:w-[38%] md:max-w-[34rem] md:shrink-0 md:pr-4"
            >
              <p className="max-w-[19rem] pt-10 text-2xl leading-8 tracking-wide text-black md:hidden">
                is an architecture studio founded in 2021.
              </p>

              <ul className="mt-8 flex flex-col gap-3 pb-24 md:mt-0 md:gap-4 md:pb-4">
                {projects.map((project, index) => {
                  const title = (project.title || 'Untitled').toUpperCase()
                  const projectNumber = String(index + 1).padStart(3, '0')

                  return (
                    <li key={project._id} data-project-id={project._id}>
                      <button
                        type="button"
                        className="w-full cursor-default text-left text-black"
                        onMouseEnter={() => {
                          if (isDesktopViewport()) setActiveId(project._id)
                        }}
                        onMouseLeave={() => {
                          if (isDesktopViewport()) setActiveId(null)
                        }}
                        onFocus={() => {
                          if (isDesktopViewport()) setActiveId(project._id)
                        }}
                        onBlur={() => {
                          if (isDesktopViewport()) setActiveId(null)
                        }}
                      >
                        <div className="text-sm font-normal tracking-wide md:text-sm 4xl:text-2xl">
                          {projectNumber}:
                        </div>
                        <div className="mt-0 text-sm font-normal tracking-wide md:text-sm 4xl:text-2xl">
                          {title}
                        </div>
                        {project.description ? (
                          <p className="mt-0 w-[16rem] whitespace-pre-line text-sm leading-4 tracking-wide md:w-[25rem] md:text-sm md:leading-4 4xl:text-2xl 4xl:leading-8 4xl:w-[40rem]">
                            {project.description}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Mobile contacts */}
          <div className="absolute bottom-5 left-5 flex flex-col gap-1 text-[11px] tracking-wide text-black md:hidden">
            {CONTACT_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="hover:opacity-60">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/*
          Logo on top — only element with mix-blend-difference.
          Reacts to the image and to black text underneath; body text stays solid black.
        */}
        <OficinaSateliteLogo className="pointer-events-none absolute left-5 top-5 mix-blend-difference md:left-7 md:top-8" />

        <button
          type="button"
          aria-label="Close"
          onClick={leaveAbout}
          className="absolute right-5 top-5 z-50 shrink-0 hover:opacity-60 md:right-7 md:top-8"
        >
          <Image
            src={closeButton}
            alt="Close"
            className="h-3 w-3 md:hidden"
            priority
          />
          <span className="hidden text-[11px] tracking-wide text-black md:inline md:text-sm">
            Close
          </span>
        </button>
    </div>
  )
}
