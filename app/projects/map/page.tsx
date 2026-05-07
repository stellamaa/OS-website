'use client'

import MapBoxProjectsMap from './MapBoxProjectsMap'

export default function MapProjectsPage() {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-white px-6 py-6 text-black md:overflow-visible">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full flex-col items-center justify-between gap-4">
        <MapBoxProjectsMap />
      </div>
    </div>
  )
}