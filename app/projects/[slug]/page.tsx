import { notFound } from 'next/navigation'

import ProjectDetail, { type ProjectDetailData } from '@/components/projects/ProjectDetail'
import { sanityClient } from '@/sanity/lib/client'
import { projectBySlugQuery } from '@/sanity/lib/queries'

export async function generateStaticParams() {
  const projects = await sanityClient.fetch<{ slug: string | null }[]>(
    `*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`,
  )

  return projects.flatMap((project) => (project.slug ? [{ slug: project.slug }] : []))
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await sanityClient.fetch<ProjectDetailData | null>(projectBySlugQuery, {
    slug,
  })

  if (!project) notFound()

  return <ProjectDetail project={project} />
}
