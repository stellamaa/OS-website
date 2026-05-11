'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'


export type ProjectListItem = {
  _id: string
  listTitle?: string
  slug?: string | null
  location?: { lat?: number; lng?: number } | null
}

export default function ProjectsList({ projects }: { projects: ProjectListItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pointsById, setPointsById] = useState<Record<string, { x: number; y: number }>>({})
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const accessToken =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ??
    'pk.eyJ1Ijoic3RlbGxhbWEiLCJhIjoiY21ucnE0ZTVtMDUxczJycGZqcjBjaW1pNyJ9.CG5n9eKQSyGvhiJTfiM-9g'

  mapboxgl.accessToken = accessToken

  const updatePoints = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    const nextPoints: Record<string, { x: number; y: number }> = {}

    for (const project of projects) {
      const lat = project.location?.lat
      const lng = project.location?.lng
      if (typeof lat !== 'number' || typeof lng !== 'number') continue

      const projected = map.project([lng, lat])
      nextPoints[project._id] = { x: projected.x, y: projected.y }
    }

    setPointsById(nextPoints)
  }, [projects])

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/empty-v9',
      center: [0, 30],
      zoom: 3,
    })

    mapRef.current = map
    map.on('load', updatePoints)
    map.on('move', updatePoints)
    map.on('zoom', updatePoints)

    return () => {
      map.off('load', updatePoints)
      map.off('move', updatePoints)
      map.off('zoom', updatePoints)
      map.remove()
    }
  }, [updatePoints])

  return (
    <div className="min-h-screen w-full bg-white px-6 py-6 text-black">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full flex-col items-center justify-between gap-4">
        <div className="relative w-full flex-1">
          <div className="pointer-events-none absolute inset-0">
            <div ref={mapContainer} className="absolute inset-0 opacity-0" />
            {activeId && pointsById[activeId] ? (
              <div
                className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-600 bg-zinc-300"
                style={{
                  left: pointsById[activeId].x,
                  top: pointsById[activeId].y,
                }}
              />
            ) : null}
          </div>
          <div className="absolute md:bottom-6 bottom-16 md:mb-7 left-0 md:max-w-[60%] max-w-[80%] md:text-xs text-sm md:leading-3 leading-4 text-zinc-500">
            {projects.map((project) => {
              const listTitle = project.listTitle || 'Untitled'
              const href = project.slug ? `/projects/list/${project.slug}` : '#'
              const isActive = project._id === activeId

              const row = (
                <span className={isActive ? 'text-black' : 'text-zinc-400'}>{listTitle}</span>
              )

              return (
                <div key={project._id}>
                  <Link
                    href={href}
                    onMouseEnter={() => setActiveId(project._id)}
                    onMouseLeave={() => setActiveId(null)}
                    className="hover:text-black"
                  >
                    {row}
                  </Link>
                </div>
              )
            })}
          </div>
          <div className="absolute bottom-6 left-0 md:bottom-3 md:left-0 md:text-xs text-xs tracking-wide text-zinc-500">
          <Link href="/about" className="text-zinc-500 ">AboutOS</Link>
        </div>
        

          <div className="absolute bottom-6 right-0 md:bottom-3 md:right-2 flex gap-6 md:text-xs text-sm tracking-wide text-zinc-500">
            <span className="text-black">LIST</span>
            <Link href="/projects/map" className="hover:text-black">
              MAP
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

