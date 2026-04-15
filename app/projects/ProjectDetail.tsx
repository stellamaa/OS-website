import Image from 'next/image'
import type { ReactNode } from 'react'

type PortableTextChild = { _type?: string; text?: string }
type PortableTextBlock = { _type: 'block'; children?: PortableTextChild[] }
type PortableTextLineBreak = { _type: 'lineBreak' }
type PortableTextNode = PortableTextBlock | PortableTextLineBreak

type ProjectDetailData = {
  title?: string
  listTitle?: string
  slug?: string | null
  description?: PortableTextNode[] | null
  image?: Array<{ _key?: string; alt?: string; url?: string | null }> | null
}

function renderDescription(description: ProjectDetailData['description']): ReactNode {
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

export default function ProjectDetail({ project }: { project: ProjectDetailData | null }) {
  if (!project) {
    return (
      <div className="w-full text-center text-xs leading-4 text-zinc-500">Not found.</div>
    )
  }

  const images = project.image ?? []

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        <div className="h-[480px] w-[420px]">
          {images[0]?.url ? (
            <Image
              src={images[0].url}
              alt={images[0].alt ?? project.title ?? 'Project image'}
              width={320}
              height={240}
              unoptimized
              className="h-full w-full object-contain"
            />
          ) : null}
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-8 left-1/2 w-[420px] -translate-x-1/2 text-left text-xs leading-2 text-black">
        {renderDescription(project.description ?? null)}
      </div>
    </div>
  )
}

