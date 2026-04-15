'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import mapboxgl from 'mapbox-gl'
import { sanityClient } from '@/sanity/lib/client'
import { locationsQuery } from '@/sanity/lib/queries'

export default function MapBoxLocationInput() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [locations, setLocations] = useState<any[]>([])
  const [points, setPoints] = useState<any[]>([])
  const locationsRef = useRef<any[]>([])

  const accessToken =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ??
    'pk.eyJ1Ijoic3RlbGxhbWEiLCJhIjoiY21ucnE0ZTVtMDUxczJycGZqcjBjaW1pNyJ9.CG5n9eKQSyGvhiJTfiM-9g'

  mapboxgl.accessToken = accessToken

  useEffect(() => {
    sanityClient.fetch(locationsQuery).then(setLocations)
  }, [])

  const updatePoints = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    const newPoints = locationsRef.current
      .map((loc) => {
        if (typeof loc.lng !== 'number' || typeof loc.lat !== 'number') return null

        const projected = map.project([loc.lng, loc.lat])

        return {
          ...loc,
          x: projected.x,
          y: projected.y,
        }
      })
      .filter(Boolean)

    setPoints(newPoints as any[])
  }, [])

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

  useEffect(() => {
    locationsRef.current = locations
    updatePoints()
  }, [locations])

  return (
    <div className="relative w-full flex-1">
      <div ref={mapContainer} className="absolute inset-0 opacity-1" />

      {points.map((p, i) => (
        <Link
          key={i}
          href={`/projects/map/${p.slug}?x=${encodeURIComponent(p.x)}&y=${encodeURIComponent(p.y)}`}
          className="absolute text-[11px] tracking-wide"
          style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-transparent border border-black" />
            <span>{p.title}</span>
          </div>
        </Link>
      ))}
 <div className="absolute bottom-0 left-0 text-xs tracking-wide text-zinc-500">
          <Link href="/about" className="text-zinc-500">AboutOS</Link>
        </div>
        
      <div className="absolute bottom-0 right-0 flex gap-6 text-xs tracking-wide text-zinc-500">
        <Link href="/projects/list" className="hover:text-black">
          LIST
        </Link>
        <span className="text-black">MAP</span>
      </div>
    </div>
  )
}