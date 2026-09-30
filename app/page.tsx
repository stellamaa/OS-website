import { sanityClient } from '@/sanity/lib/client'
import { landingQuery } from '@/sanity/lib/queries'
import LandingEnter, { type LandingData } from './LandingEnter'

export default async function Home() {
  const landing = await sanityClient.fetch<LandingData | null>(landingQuery)
  return <LandingEnter landing={landing} />
}
