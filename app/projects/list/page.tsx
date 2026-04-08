import { sanityClient } from '@/sanity/lib/client'
import { projectListQuery } from '@/sanity/lib/queries'
import ProjectsList, { type ProjectListItem } from '../ProjectsList'

export default async function ListProjectsPage() {
  const listProjects = await sanityClient.fetch<ProjectListItem[]>(projectListQuery)
  return <ProjectsList projects={listProjects ?? []} />
}

