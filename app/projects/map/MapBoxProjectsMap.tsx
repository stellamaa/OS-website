'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

import { sanityClient } from '@/sanity/lib/client'
import { locationsQuery } from '@/sanity/lib/queries'

type LocationDoc = {
  title?: string
  slug?: string | null
  lat?: number
  lng?: number
}

type ProjectPoint = {
  slug: string
  title: string
  x: number
  y: number
}

export default function MapBoxProjectsMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [locations, setLocations] = useState<LocationDoc[]>([])
  const [points, setPoints] = useState<ProjectPoint[]>([])
  const [hoverSlug, setHoverSlug] = useState<string | null>(null)
  const locationsRef = useRef<LocationDoc[]>([])

  const accessToken = useMemo(
    () =>
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ??
      'pk.eyJ1Ijoic3RlbGxhbWEiLCJhIjoiY21ucnE0ZTVtMDUxczJycGZqcjBjaW1pNyJ9.CG5n9eKQSyGvhiJTfiM-9g',
    [],
  )

  useEffect(() => {
    mapboxgl.accessToken = accessToken
  }, [accessToken])

  useEffect(() => {
    sanityClient.fetch<LocationDoc[]>(locationsQuery).then((docs) => setLocations(docs ?? []))
  }, [])

  const updatePoints = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    const next: ProjectPoint[] = []

    for (const loc of locationsRef.current) {
      const slug = typeof loc.slug === 'string' ? loc.slug : null
      const title = typeof loc.title === 'string' && loc.title.trim() ? loc.title : null
      if (!slug || !title) continue
      if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') continue

      const projected = map.project([loc.lng, loc.lat])
      next.push({ slug, title, x: projected.x, y: projected.y })
    }

    setPoints(next)
  }, [])

  useEffect(() => {
    const container = mapContainer.current
    if (!container) return

    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/empty-v9', // transparent base
      center: [0, 30],
      zoom: 3,
    })

    mapRef.current = map

    // Defend against CSS cascade disabling interaction.
    const canvas = map.getCanvas()
    const canvasContainer = map.getCanvasContainer()
    canvas.style.pointerEvents = 'auto'
    canvasContainer.style.pointerEvents = 'auto'
    canvas.style.touchAction = 'none'
    canvasContainer.style.touchAction = 'none'

    map.dragPan.enable()
    map.scrollZoom.enable()
    map.doubleClickZoom.enable()
    map.touchZoomRotate.enable()

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(container)

    map.on('load', updatePoints)
    map.on('move', updatePoints)
    map.on('zoom', updatePoints)

    map.on('error', (e) => {
      // eslint-disable-next-line no-console
      console.error('[mapbox] error', e?.error ?? e)
    })

    return () => {
      ro.disconnect()
      map.off('load', updatePoints)
      map.off('move', updatePoints)
      map.off('zoom', updatePoints)
      map.remove()
    }
  }, [updatePoints])

  useEffect(() => {
    locationsRef.current = locations
    updatePoints()
  }, [locations, updatePoints])

  return (
    <div className="relative w-full flex-1 overscroll-none">
      <div
        ref={mapContainer}
        className="absolute inset-0 z-0 mapbox-host"
        // Ensure browser gestures don’t steal map interactions.
        style={{ touchAction: 'none' }}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        {points.map((p) => {
          const isHover = hoverSlug === p.slug
          const colorClass = isHover ? 'text-black' : 'text-zinc-500'
          const borderClass = isHover ? 'border-black' : 'border-zinc-500'

          return (
            <Link
              key={p.slug}
              href={`/projects/map/${p.slug}?x=${encodeURIComponent(p.x)}&y=${encodeURIComponent(p.y)}`}
              className={`pointer-events-auto absolute inline-flex text-[11px] tracking-wide ${colorClass}`}
              style={{ left: 0, top: 0, transform: `translate(${p.x}px, ${p.y}px)` }}
              onMouseEnter={() => setHoverSlug(p.slug)}
              onMouseLeave={() => setHoverSlug(null)}
            >
              <span className="inline-flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full border ${borderClass} bg-transparent`} />
                <span className={colorClass}>{p.title}</span>
              </span>
            </Link>
          )
        })}
      </div>

      <div className="fixed left-0 z-30 bottom-[calc(env(safe-area-inset-bottom)+0.25rem)] md:absolute md:bottom-3 md:left-2 text-xs tracking-wide text-zinc-500">
        <Link href="/about" className="hover:text-black">
          AboutOS
        </Link>
      </div>

      <div className="fixed right-0 z-30 bottom-[calc(env(safe-area-inset-bottom)+0.25rem)] md:absolute md:bottom-3 md:right-2 flex gap-6 text-xs tracking-wide text-zinc-500">
        <Link href="/projects/list" className="hover:text-black">
          LIST
        </Link>
        <span className="text-black">MAP</span>
      </div>
    </div>
  )
}

