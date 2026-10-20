'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'

import { useSiteTransition } from './SiteTransition'

type AboutLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href?: ComponentProps<typeof Link>['href']
}

/** OS mark — reveals About by sliding the current page down. */
export default function AboutLink({
  children,
  onClick,
  href = '/about',
  ...props
}: AboutLinkProps) {
  const { goAbout } = useSiteTransition()

  return (
    <Link
      {...props}
      href={href}
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
