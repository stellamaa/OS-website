'use client'

import Image from 'next/image'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'

import AboutLink from '@/components/AboutLink'
import osLogo from '@/public/assets/og-logo.svg'

const REVEAL_MS = 600
const FADE_MS = 420
/**
 * Click → fade almost immediately; letters fall over the dissolve with mix-blend.
 */
const CHROME_HOLD_MS = 0
const CHROME_FALL_MS = 1450
/** Crossfade runs with the fall so type sits over the page change */
const PROJECT_CROSSFADE_MS = 900
/** Steady through the middle, gentle settle — avoids crawling at the end */
const CHROME_FALL_EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)'
/** Even dissolve — less “ease dump” at the end than material decelerate */
const CROSSFADE_EASE = 'cubic-bezier(0.37, 0, 0.63, 1)'
/** Mid-screen → bottom, GPU-only (from final bottom dock) */
const CHROME_FROM = 'translate3d(0, calc(-50dvh + 1.25rem), 0)'
const CHROME_TO = 'translate3d(0, 0, 0)'

type BridgeRect = {
  top: number
  left: number
  width: number
  height: number
}

type ProjectChromeFlight = {
  title: string
  counter: string
  bridgeSrc?: string | null
  bridgeRect?: BridgeRect | null
}

type SiteTransitionValue = {
  goAbout: () => void
  leaveAbout: () => void
  goProject: (
    href: string,
    chrome: {
      title: string
      counter: string
      bridgeSrc?: string | null
      bridgeRect?: BridgeRect | null
    },
  ) => void
  projectChromeFlight: ProjectChromeFlight | null
  clearProjectChromeFlight: () => void
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

function FallingChrome({
  title,
  counter,
  runId,
}: {
  title: string
  counter: string
  runId: number
}) {
  const titleRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLDivElement>(null)

  // Imperative transform so React re-renders during route change don't kill the fall
  useLayoutEffect(() => {
    const nodes = [titleRef.current, counterRef.current].filter(
      (n): n is HTMLDivElement => Boolean(n),
    )
    for (const node of nodes) {
      node.style.transition = 'none'
      node.style.transform = CHROME_FROM
    }
    for (const node of nodes) void node.offsetHeight

    let frame = 0
    frame = requestAnimationFrame(() => {
      for (const node of nodes) {
        node.style.transition = `transform ${CHROME_FALL_MS}ms ${CHROME_FALL_EASE}`
        node.style.transform = CHROME_TO
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [runId])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 mix-blend-difference"
      aria-hidden
    >
      <div
        ref={titleRef}
        className="absolute bottom-2 left-4 max-w-[40%] will-change-transform md:bottom-3 md:left-7"
        style={{
          transform: CHROME_FROM,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <span className="block text-xs tracking-wide text-white md:text-sm 4xl:text-4xl">
          {title}
        </span>
      </div>
      <div
        ref={counterRef}
        className="absolute bottom-2 right-4 will-change-transform md:bottom-3 md:right-7"
        style={{
          transform: CHROME_FROM,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <span className="text-xs tracking-wide text-white md:text-sm 4xl:text-4xl">
          {counter}
        </span>
      </div>
    </div>
  )
}

export default function SiteTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const onAbout = isAboutPath(pathname)
  const onProject = isProjectPath(pathname)
  const fadeMs = onProject ? PROJECT_CROSSFADE_MS : FADE_MS
  const fadeEase = onProject ? CROSSFADE_EASE : 'cubic-bezier(0.22, 1, 0.36, 1)'

  const [fadeIn, setFadeIn] = useState(onAbout)
  const [slideDown, setSlideDown] = useState(false)
  const [plate, setPlate] = useState<'none' | 'about' | 'home'>('none')
  const [snap, setSnap] = useState(false)
  const [projectChromeFlight, setProjectChromeFlight] =
    useState<ProjectChromeFlight | null>(null)
  const [flightRunId, setFlightRunId] = useState(0)
  const busyRef = useRef(false)
  const skipFadeRef = useRef(false)
  const projectHandoffRef = useRef(false)
  const chromeNavTimerRef = useRef<number | null>(null)
  const chromeClearTimerRef = useRef<number | null>(null)
  const bridgeFadeTimerRef = useRef<number | null>(null)
  const bridgeRafRef = useRef<number | null>(null)
  const bridgeLayerRef = useRef<HTMLDivElement>(null)
  const wasOnProjectRef = useRef(onProject)

  const cancelBridgeFade = useCallback(() => {
    if (bridgeFadeTimerRef.current != null) {
      window.clearTimeout(bridgeFadeTimerRef.current)
      bridgeFadeTimerRef.current = null
    }
    if (bridgeRafRef.current != null) {
      window.cancelAnimationFrame(bridgeRafRef.current)
      bridgeRafRef.current = null
    }
  }, [])

  const startBridgeDissolve = useCallback(() => {
    cancelBridgeFade()
    // Short paint buffer so landscape (and portrait) first frames are ready under the bridge
    bridgeFadeTimerRef.current = window.setTimeout(() => {
      bridgeFadeTimerRef.current = null
      bridgeRafRef.current = window.requestAnimationFrame(() => {
        bridgeRafRef.current = window.requestAnimationFrame(() => {
          bridgeRafRef.current = null
          const bridge = bridgeLayerRef.current
          if (!bridge) return
          bridge.style.transition = 'none'
          bridge.style.opacity = '1'
          bridge.style.willChange = 'opacity'
          void bridge.offsetHeight
          bridge.style.transition = `opacity ${PROJECT_CROSSFADE_MS}ms ${CROSSFADE_EASE}`
          bridge.style.opacity = '0'
          bridgeFadeTimerRef.current = window.setTimeout(() => {
            if (bridgeLayerRef.current === bridge) bridge.style.willChange = 'auto'
            bridgeFadeTimerRef.current = null
          }, PROJECT_CROSSFADE_MS + 32)
        })
      })
    }, 48)
  }, [cancelBridgeFade])

  useEffect(() => {
    // Project handoff: don't snap/toggle page opacity — keep bridge covering until dissolve
    if (projectHandoffRef.current && onProject) {
      projectHandoffRef.current = false
      busyRef.current = false
      setSlideDown(false)
      setPlate('none')
      setFadeIn(true)
      // Dissolve only after the project route has committed under the bridge
      startBridgeDissolve()
      return
    }

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
  }, [pathname, onAbout, onProject, startBridgeDissolve])

  useEffect(() => {
    if (onProject) {
      wasOnProjectRef.current = true
      return
    }
    if (wasOnProjectRef.current) {
      wasOnProjectRef.current = false
      setProjectChromeFlight(null)
    }
  }, [onProject])

  useEffect(() => {
    return () => {
      if (chromeNavTimerRef.current != null) window.clearTimeout(chromeNavTimerRef.current)
      if (chromeClearTimerRef.current != null) window.clearTimeout(chromeClearTimerRef.current)
      cancelBridgeFade()
    }
  }, [cancelBridgeFade])

  const clearProjectChromeFlight = useCallback(() => {
    if (chromeNavTimerRef.current != null) {
      window.clearTimeout(chromeNavTimerRef.current)
      chromeNavTimerRef.current = null
    }
    if (chromeClearTimerRef.current != null) {
      window.clearTimeout(chromeClearTimerRef.current)
      chromeClearTimerRef.current = null
    }
    cancelBridgeFade()
    setProjectChromeFlight(null)
  }, [cancelBridgeFade])

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

  const goProject = useCallback(
    (
      href: string,
      chrome: {
        title: string
        counter: string
        bridgeSrc?: string | null
        bridgeRect?: BridgeRect | null
      },
    ) => {
      if (busyRef.current) return
      busyRef.current = true
      projectHandoffRef.current = true

      if (chromeNavTimerRef.current != null) window.clearTimeout(chromeNavTimerRef.current)
      if (chromeClearTimerRef.current != null) window.clearTimeout(chromeClearTimerRef.current)
      cancelBridgeFade()

      // Warm the project route while letters start falling
      router.prefetch(href)

      setFlightRunId((n) => n + 1)
      setProjectChromeFlight({
        title: chrome.title,
        counter: chrome.counter,
        bridgeSrc: chrome.bridgeSrc,
        bridgeRect: chrome.bridgeRect,
      })

      // Navigate immediately so fade + fall run together; dissolve starts when route commits
      chromeNavTimerRef.current = window.setTimeout(() => {
        router.push(href)
        chromeNavTimerRef.current = null
      }, CHROME_HOLD_MS)

      // Keep flying chrome until fall finishes (over the fade the whole time)
      chromeClearTimerRef.current = window.setTimeout(() => {
        setProjectChromeFlight(null)
        chromeClearTimerRef.current = null
      }, Math.max(CHROME_FALL_MS, PROJECT_CROSSFADE_MS) + 160)
    },
    [router, cancelBridgeFade],
  )

  useEffect(() => {
    router.prefetch('/about')
    router.prefetch('/home')
  }, [router])

  const bridgeSrc = projectChromeFlight?.bridgeSrc
  const bridgeRect = projectChromeFlight?.bridgeRect

  const contextValue = useMemo(
    () => ({
      goAbout,
      leaveAbout,
      goProject,
      projectChromeFlight,
      clearProjectChromeFlight,
    }),
    [goAbout, leaveAbout, goProject, projectChromeFlight, clearProjectChromeFlight],
  )

  return (
    <SiteTransitionContext.Provider value={contextValue}>
      <div
        className={`relative min-h-full flex-1 ${
          slideDown ? 'h-[100dvh] overflow-hidden' : ''
        }`}
      >
        {plate !== 'none' ? (
          <div
            className={`pointer-events-none fixed inset-0 z-0 ${
              plate === 'about' ? 'bg-white' : 'bg-black'
            }`}
            aria-hidden
          />
        ) : null}

        <div
          className="relative z-10 min-h-full flex-1"
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

        {/* Home image held on top, then dissolves onto the project (same timing for portrait & landscape) */}
        {projectChromeFlight ? (
          <div
            ref={bridgeLayerRef}
            className="pointer-events-none fixed inset-0 z-40"
            aria-hidden
            style={{ opacity: 1, transform: 'translateZ(0)' }}
          >
            {bridgeSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bridgeSrc}
                alt=""
                className={
                  bridgeRect
                    ? 'absolute max-w-none object-cover md:object-contain'
                    : 'h-full w-full object-cover md:absolute md:left-0 md:top-1/2 md:h-auto md:w-full md:-translate-y-1/2 md:object-contain'
                }
                style={
                  bridgeRect
                    ? {
                        top: bridgeRect.top,
                        left: bridgeRect.left,
                        width: bridgeRect.width,
                        height: bridgeRect.height,
                      }
                    : undefined
                }
                draggable={false}
              />
            ) : null}
          </div>
        ) : null}

        {/* Logo stays put above the fade (same spot as home) */}
        {projectChromeFlight ? (
          <div className="pointer-events-none fixed inset-x-0 top-5 z-[45] flex justify-center mix-blend-difference md:top-8 4xl:top-10">
            <AboutLink aria-label="About" className="pointer-events-auto hover:opacity-60">
              <Image
                src={osLogo}
                alt=""
                priority
                className="h-4 w-auto md:h-[1.15rem] 4xl:h-9"
              />
            </AboutLink>
          </div>
        ) : null}

        {projectChromeFlight ? (
          <FallingChrome
            key={flightRunId}
            runId={flightRunId}
            title={projectChromeFlight.title}
            counter={projectChromeFlight.counter}
          />
        ) : null}
      </div>
    </SiteTransitionContext.Provider>
  )
}
