'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'

const REVEAL_MS = 820
const FADE_MS = 420
const PROJECT_FADE_MS = 560

type SiteTransitionValue = {
  goAbout: () => void
  leaveAbout: () => void
}

const SiteTransitionContext = createContext<SiteTransitionValue | null>(null)

export function useSiteTransition() {
  const ctx = useContext(SiteTransitionContext)
  if (!ctx) {
    throw new Error('useSiteTransition must be used within SiteTransition')
  }
  return ctx
}

function isAboutPath(pathname: string) {
  return /\/about\/?$/.test(pathname)
}

function isProjectPath(pathname: string) {
  return /\/projects\//.test(pathname)
}

export default function SiteTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const onAbout = isAboutPath(pathname)
  const onProject = isProjectPath(pathname)
  const fadeMs = onProject ? PROJECT_FADE_MS : FADE_MS
  const fadeEase = onProject
    ? 'cubic-bezier(0.33, 1, 0.68, 1)'
    : 'cubic-bezier(0.22, 1, 0.36, 1)'

  const [fadeIn, setFadeIn] = useState(onAbout)
  const [slideDown, setSlideDown] = useState(false)
  const [plate, setPlate] = useState<'none' | 'about' | 'home'>('none')
  const [snap, setSnap] = useState(false)
  const busyRef = useRef(false)
  const skipFadeRef = useRef(false)

  // Enter fade for non-about routes (skipped right after a reveal transition)
  useEffect(() => {
    // Snap transform reset so the new page isn't animated back up from off-screen
    setSnap(true)
    setSlideDown(false)
    setPlate('none')
    busyRef.current = false

    const clearSnap = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSnap(false))
    })

    if (onAbout) {
      setFadeIn(true)
      return () => cancelAnimationFrame(clearSnap)
    }

    if (skipFadeRef.current) {
      skipFadeRef.current = false
      setFadeIn(true)
      return () => cancelAnimationFrame(clearSnap)
    }

    setFadeIn(false)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setFadeIn(true))
    })
    return () => {
      cancelAnimationFrame(clearSnap)
      cancelAnimationFrame(id)
    }
  }, [pathname, onAbout])

  const goAbout = useCallback(() => {
    if (busyRef.current || onAbout) return
    busyRef.current = true
    setPlate('about')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSlideDown(true))
    })
    window.setTimeout(() => {
      skipFadeRef.current = true
      router.push('/about')
    }, REVEAL_MS)
  }, [onAbout, router])

  const leaveAbout = useCallback(() => {
    if (busyRef.current || !onAbout) return
    busyRef.current = true
    setPlate('home')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSlideDown(true))
    })
    window.setTimeout(() => {
      skipFadeRef.current = true
      router.push('/home')
    }, REVEAL_MS)
  }, [onAbout, router])

  useEffect(() => {
    router.prefetch('/about')
    router.prefetch('/home')
  }, [router])

  return (
    <SiteTransitionContext.Provider value={{ goAbout, leaveAbout }}>
      <div
        className={`relative min-h-full flex-1 ${
          slideDown ? 'h-[100dvh] overflow-hidden' : ''
        }`}
      >
        {/* Plate revealed as the current page slides away */}
        {plate !== 'none' ? (
          <div
            className={`pointer-events-none fixed inset-0 z-0 ${
              plate === 'about' ? 'bg-white' : 'bg-black'
            }`}
            aria-hidden
          />
        ) : null}

        <div
          className="relative z-10 min-h-full flex-1 will-change-transform"
          style={{
            opacity: onAbout || fadeIn ? 1 : 0,
            transform: slideDown ? 'translateY(100%)' : 'translateY(0)',
            transitionProperty: snap ? 'none' : slideDown ? 'transform' : 'opacity',
            transitionDuration: snap ? '0ms' : slideDown ? `${REVEAL_MS}ms` : `${fadeMs}ms`,
            transitionTimingFunction: slideDown
              ? 'cubic-bezier(0.16, 1, 0.3, 1)'
              : fadeEase,
          }}
        >
          {children}
        </div>
      </div>
    </SiteTransitionContext.Provider>
  )
}
