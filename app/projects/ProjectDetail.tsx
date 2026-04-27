'use client'

import Image from 'next/image'
import { useMemo, useState, type ReactNode } from 'react'

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
  const images = project?.image ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const safeIndex = useMemo(() => {
    if (images.length === 0) return 0
    if (activeIndex < 0) return 0
    if (activeIndex > images.length - 1) return images.length - 1
    return activeIndex
  }, [activeIndex, images.length])

  const activeImage = images[safeIndex]

  const goToNext = () => {
    if (images.length <= 1) return
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrev = () => {
    if (images.length <= 1) return
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!project) {
    return (
      <div className="w-full text-center text-xs leading-4 text-zinc-500">Not found.</div>
    )
  }

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        <div
          className="relative h-[480px] w-[420px] max-w-full"
          onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return
            const touchEndX = e.changedTouches[0]?.clientX ?? touchStartX
            const deltaX = touchStartX - touchEndX
            if (Math.abs(deltaX) > 35) {
              if (deltaX > 0) goToNext()
              else goToPrev()
            }
            setTouchStartX(null)
          }}
        >
          {activeImage?.url ? (
            <>
              <Image
                src={activeImage.url}
                alt={activeImage.alt ?? project.title ?? 'Project image'}
                width={420}
                height={480}
                unoptimized
                className="h-full w-full object-contain"
              />

              <button
                type="button"
                aria-label="Previous image"
                onClick={goToPrev}
                className="absolute left-0 top-0 h-full w-1/2"
                style={{ cursor: 'w-resize' }}
              />
              <button
                type="button"
                aria-label="Next image"
                onClick={goToNext}
                className="absolute right-0 top-0 h-full w-1/2"
                style={{ cursor: 'e-resize' }}
              />
            </>
          ) : null}
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs md:hidden">
          {images.map((img, index) => (
            <span
              key={img._key ?? `${img.url ?? 'img'}-${index}`}
              className={index === safeIndex ? 'text-black' : 'text-zinc-400'}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-8 left-1/2 w-[420px] -translate-x-1/2 text-left text-xs leading-2 text-black hidden md:block">
        {renderDescription(project.description ?? null)}
      </div>
    </div>
  )
}

