'use client'

import Link from 'next/link'
import { useState } from 'react'


export type ProjectListItem = {
  _id: string
  listTitle?: string
  slug?: string | null
}

export default function ProjectsList({ projects }: { projects: ProjectListItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(projects[0]?._id ?? null)

  return (
    <div className="min-h-screen w-full bg-white px-6 py-6 text-black">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full flex-col items-center justify-between gap-4">
        <div className="relative w-full flex-1">
          <div className="absolute bottom-0 left-0 max-w-[60%] text-[10px] leading-3 text-zinc-500">
            {projects.map((project) => {
              const listTitle = project.listTitle || 'Untitled'
              const href = project.slug ? `/projects/list/${project.slug}` : '#'
              const isActive = project._id === activeId

              const row = (
                <span className={isActive ? 'text-black' : 'text-zinc-400'}>{listTitle}</span>
              )

              return (
                <div key={project._id}>
                  <Link
                    href={href}
                    onMouseEnter={() => setActiveId(project._id)}
                    onMouseLeave={() => setActiveId(null)}
                    className="hover:text-black"
                  >
                    {row}
                  </Link>
                </div>
              )
            })}
          </div>

          <div className="absolute bottom-0 right-0 flex gap-6 text-[10px] tracking-wide text-zinc-500">
            <span className="text-black">LIST</span>
            <Link href="/projects/map" className="hover:text-black">
              MAP
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

