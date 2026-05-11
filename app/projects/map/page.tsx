'use client'

import MapBoxProjectsMap from './MapBoxProjectsMap'

export default function MapProjectsPage() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-white px-6 py-6 text-black md:min-h-screen md:h-auto md:overflow-visible">
      <div className="mx-auto flex h-[calc(100dvh-3rem)] w-full flex-col items-center justify-between gap-4 md:min-h-[calc(100vh-3rem)] md:h-auto">
        <MapBoxProjectsMap />
      </div>
    </div>
  )
}