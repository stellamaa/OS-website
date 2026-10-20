'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'

import { useSiteTransition } from './SiteTransition'

/** OS mark — reveals About by sliding the current page down. */
export default function AboutLink({
  children,
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  const { goAbout } = useSiteTransition()

  return (
    <Link
      {...props}
      href="/about"
      onClick={(e) => {
        e.preventDefault()
        onClick?.(e)
        goAbout()
      }}
    >
      {children}
    </Link>
  )
}
