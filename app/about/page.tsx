import { sanityClient } from '@/sanity/lib/client'
import { aboutQuery } from '@/sanity/lib/queries'

import About, { type AboutData } from './About'

export default async function AboutPage() {
  const about = await sanityClient.fetch<AboutData | null>(aboutQuery)
  return <About about={about} />
}

