import { sanityClient } from '@/sanity/lib/client'
import { landingQuery } from '@/sanity/lib/queries'
import LandingPage, { type LandingPageData } from '@/components/landingpage/LandingPage'

export default async function LandingRoute() {
  const landing = await sanityClient.fetch<LandingPageData | null>(landingQuery)
  return <LandingPage landing={landing} />
}
