import { sanityClient } from '@/sanity/lib/client'
import { homeQuery } from '@/sanity/lib/queries'
import Home, { type HomeData } from '@/components/home/Home'

export default async function HomePage() {
  const home = await sanityClient.fetch<HomeData | null>(homeQuery)
  return <Home home={home} />
}
