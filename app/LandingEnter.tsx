'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export type LandingData = {
  enterText?: string | null
  heroImage?: { alt?: string | null; url?: string | null } | null
}

export default function LandingEnter({ landing }: { landing: LandingData | null }) {
  const router = useRouter()
  const enterText = landing?.enterText?.trim() || 'click anywhere to enter site'
  const imageUrl = landing?.heroImage?.url ?? null

  const enter = () => router.push('/about')

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-black"
      onClick={enter}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') enter()
      }}
      aria-label={enterText}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={landing?.heroImage?.alt || 'Landing'}
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="100vw"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-[18%] z-10 flex justify-center px-6">
        <p className="font-[family-name:var(--font-neue-haas)] text-center text-xs tracking-wide text-white md:text-sm">
          {enterText}
        </p>
      </div>
    </div>
  )
}
