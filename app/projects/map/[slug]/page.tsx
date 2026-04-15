import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { sanityClient } from '@/sanity/lib/client'
import { projectBySlugQuery } from '@/sanity/lib/queries'
import SelectedMapTag from '../SelectedMapTag'
import closeButton from '@/public/assets/closeButton.png'

type PortableTextChild = { _type?: string; text?: string }
type PortableTextBlock = { _type: 'block'; children?: PortableTextChild[] }
type PortableTextLineBreak = { _type: 'lineBreak' }
type PortableTextNode = PortableTextBlock | PortableTextLineBreak

type MapProjectDetailData = {
  title?: string
  mapTitle?: string
  listTitle?: string
  location?: { lat?: number; lng?: number } | null
  description?: PortableTextNode[] | null
  image?: Array<{ _key?: string; alt?: string; url?: string | null }> | null
}

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ x?: string; y?: string }>
}

function renderDescription(description: MapProjectDetailData['description']): ReactNode {
  if (!Array.isArray(description)) return null

  const nodes: ReactNode[] = []
  let key = 0

  for (const item of description) {
    if (!item) continue

    if (item._type === 'lineBreak') {
      nodes.push(<br key={`br-${key++}`} />)
      continue
    }

    if (item._type === 'block') {
      const text = Array.isArray(item.children)
        ? item.children.map((c) => c?.text ?? '').join('')
        : ''

      if (text.trim().length > 0) {
        nodes.push(
          <p key={`p-${key++}`} className="m-0">
            {text}
          </p>,
        )
      }
    }
  }

  return nodes.length > 0 ? nodes : null
}

export default async function MapProjectPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const screenX = Number(resolvedSearchParams?.x)
  const screenY = Number(resolvedSearchParams?.y)
  const hasScreenPoint = Number.isFinite(screenX) && Number.isFinite(screenY)
  const project = await sanityClient.fetch<MapProjectDetailData | null>(projectBySlugQuery, { slug })
  const images = project?.image ?? []

  if (!project) {
    return (
      <div className="min-h-screen w-full bg-white px-6 py-6 text-black">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full items-center justify-center text-xs text-zinc-500">
          Not found.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white px-6 py-6 text-black">
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full flex-col">
        <SelectedMapTag
          title={project.mapTitle || project.title || 'Untitled'}
          lat={project.location?.lat}
          lng={project.location?.lng}
          x={hasScreenPoint ? screenX : undefined}
          y={hasScreenPoint ? screenY : undefined}
        />

        <Link
          href="/projects/map"
          aria-label="Back to map"
          className="absolute right-0 top-0 text-7xl font-thin text-black"
        >
          <Image src={closeButton} alt="Close" className="h-10 w-10" priority />
        </Link>


        <div className="map-gallery-scroll fixed bottom-0 left-0 h-[62vh] w-full max-w-[400px] overflow-y-auto md:left-1/2 md:w-[400px] md:max-w-none md:-translate-x-full">
          <div className="flex flex-col gap-0 pb-6">
            {images.map((img) =>
              img?.url ? (
                <Image
                  key={img._key ?? img.url}
                  src={img.url}
                  alt={img.alt ?? project.title ?? 'Project image'}
                  width={840}
                  height={1200}
                  unoptimized
                  className="h-auto w-full object-cover"
                />
              ) : null,
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-2 left-0 max-w-[50%] text-xs leading-2 text-black">
          {renderDescription(project.description ?? null)}
        </div>

        <div className="absolute bottom-0 right-0 flex gap-6 text-xs tracking-wide text-zinc-500">
          <Link href="/projects/list" className="text-zinc-500">
            LIST
          </Link>
          <Link href="/projects/map" className="text-black">
            MAP
          </Link>
        </div>
      </div>
    </div>
  )
}
