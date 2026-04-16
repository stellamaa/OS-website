'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
   
    <div
      className="relative min-h-screen w-full bg-white px-6 py-6"
      onClick={() => router.push('/projects/list')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') router.push('/projects/list')
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col items-center justify-between">
      

        <div className="flex-1" />
        <div className="absolute inset-4 flex items-center justify-start">
          <div className="flex items-center gap-122 text-xs tracking-wide text-black">
            <span>click anywhere to enter site</span>
            <span className="h-3 w-3 rounded-full border border-black bg-transparent" />
          </div>
        </div>
       
      </div>
    </div>
  )
}
