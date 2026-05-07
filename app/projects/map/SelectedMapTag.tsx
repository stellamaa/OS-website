'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

type SelectedMapTagProps = {
  title: string
  lat?: number
  lng?: number
  x?: number
  y?: number
}

export default function SelectedMapTag({ title, lat, lng, x, y }: SelectedMapTagProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null)
  const hasScreenPoint = typeof x === 'number' && typeof y === 'number'

  const accessToken =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ??
    'pk.eyJ1Ijoic3RlbGxhbWEiLCJhIjoiY21ucnE0ZTVtMDUxczJycGZqcjBjaW1pNyJ9.CG5n9eKQSyGvhiJTfiM-9g'

  mapboxgl.accessToken = accessToken

  const updatePoint = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    if (typeof lat !== 'number' || typeof lng !== 'number') return

    const projected = map.project([lng, lat])
    setPoint({ x: projected.x, y: projected.y })
  }, [lat, lng])

  useEffect(() => {
    if (hasScreenPoint) {
      setPoint({ x: x as number, y: y as number })
      return
    }

    if (!mapContainer.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/empty-v9',
      center: [0, 30],
      zoom: 3,
    })

    mapRef.current = map
    map.on('load', updatePoint)
    map.on('move', updatePoint)
    map.on('zoom', updatePoint)

    return () => {
      map.off('load', updatePoint)
      map.off('move', updatePoint)
      map.off('zoom', updatePoint)
      map.remove()
    }
  }, [hasScreenPoint, updatePoint, x, y])

  useEffect(() => {
    if (hasScreenPoint) return
    updatePoint()
  }, [hasScreenPoint, updatePoint])

  if (!point) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 md:absolute md:inset-0 md:z-30">
      {!hasScreenPoint ? <div ref={mapContainer} className="absolute inset-0 opacity-0" /> : null}
      <div
        className="absolute text-[11px] tracking-wide"
        style={{ left: 0, top: 0, transform: `translate(${point.x}px, ${point.y}px)` }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full border border-zinc-600 bg-zinc-300" />
          <span>{title}</span>
        </div>
      </div>
    </div>
  )
}
