'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import osLogo from '@/public/assets/og-logo.svg'
import { imageSrc, type SanityImageField } from '@/sanity/lib/image'

export type LandingPageData = {
  enterText?: string | null
  heroImage?: SanityImageField | null
}

export default function LandingPage({ landing }: { landing: LandingPageData | null }) {
  const router = useRouter()
  const enterText = landing?.enterText?.trim() || 'click anywhere to enter site'
  const imageUrl = imageSrc(landing?.heroImage, { width: 2560, quality: 85 })

  const enter = () => router.push('/home')

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
          className="object-cover"
          sizes="100vw"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-5 z-10 flex justify-center mix-blend-difference md:top-8 4xl:top-10 ">
        <Image
          src={osLogo}
          alt="OS"
          priority
          className="h-4 w-auto md:h-[1.15rem] 4xl:h-9"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[5%] z-10 flex justify-center px-6">
        <p className="text-center text-[11px] tracking-wide text-white md:text-xs 4xl:text-2xl">
          {enterText}
        </p>
      </div>
    </div>
  )
}
