import { sanityClient } from '@/sanity/lib/client'
import { aboutProjectsQuery } from '@/sanity/lib/queries'

import About, { type AboutProjectItem } from './About'

export default async function AboutPage() {
  const projects = await sanityClient.fetch<AboutProjectItem[]>(aboutProjectsQuery)
  return <About projects={projects ?? []} />
}
