import Image from 'next/image'
import Link from 'next/link'

import { sanityClient } from '@/sanity/lib/client'
import closeButton from '@/public/assets/closeButton.png'
import { projectBySlugQuery, projectListQuery } from '@/sanity/lib/queries'

import ProjectDetail from '../../ProjectDetail'

type PageProps = { params: Promise<{ slug: string }> }

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = await sanityClient.fetch(projectBySlugQuery, { slug })
  const projects = await sanityClient.fetch<
    Array<{ _id: string; listTitle?: string; slug?: string | null }>
  >(projectListQuery)

  return (
    <div className="min-h-screen w-full bg-white px-6 py-6 text-black">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full flex-col items-center gap-4">
        <div className="relative w-full flex-1">
          <Link
            href="/projects/list"
            aria-label="Back to list"
            className="fixed right-4 top-4 z-40 text-black md:absolute md:right-0 md:top-0"
          >
            <Image src={closeButton} alt="Close" className="h-10 w-10" priority />
          </Link>

          <div className="absolute inset-x-0 top-50">
            <ProjectDetail project={project} />
          </div>

        
          <div className="absolute bottom-0 md:bottom-6 md:mb-7  left-0 max-w-[60%] text-xs leading-3 text-zinc-500 hidden md:block">
            {(projects ?? []).map((p) => {
              const listTitle = p.listTitle || 'Untitled'
              const href = p.slug ? `/projects/list/${p.slug}` : '#'
              const isCurrent = p.slug === slug

              return (
                <div key={p._id}>
                  <Link
                    href={href}
                    className={isCurrent ? 'text-black' : 'text-zinc-400 hover:text-black'}
                  >
                    {listTitle}
                  </Link>
                </div>
              )
            })}
          </div>

          <div className="absolute bottom-6 left-0 md:left-0 md:text-xs text-xs tracking-wide text-zinc-500">
          <Link href="/about" className="text-zinc-500">AboutOS</Link>
        </div>
          <div className="absolute md:bottom-6 bottom-6 right-0 md:right-2 flex gap-6 text-xs tracking-wide text-zinc-500">
            <Link href="/projects/list" className="text-black">
              LIST
            </Link>
            <Link href="/projects/map" className="hover:text-black">
              MAP
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

