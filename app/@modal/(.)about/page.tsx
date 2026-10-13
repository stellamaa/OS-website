import { sanityClient } from '@/sanity/lib/client'
import { aboutProjectsQuery } from '@/sanity/lib/queries'
import About, { type AboutProjectItem } from '@/components/about/About'

/** Soft-nav intercept: About drops over the current page (home / project). */
export default async function AboutModalPage() {
  const projects = await sanityClient.fetch<AboutProjectItem[]>(aboutProjectsQuery)
  return <About projects={projects ?? []} />
}
