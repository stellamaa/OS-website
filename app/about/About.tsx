import Link from 'next/link'
import type { ReactNode } from 'react'

type PortableTextChild = { _type?: string; text?: string }
type PortableTextBlock = { _type: 'block'; children?: PortableTextChild[] }
type PortableTextLineBreak = { _type: 'lineBreak' }
type PortableTextNode = PortableTextBlock | PortableTextLineBreak | { _type?: string }

export type AboutData = {
  title?: string
  aboutText?: PortableTextNode[] | null
  address?: PortableTextNode[] | string | null
  contactPhone?: string | null
  contactEmail?: string | null
  downloadCvUrl?: string | null
}

function renderPortableText(value: PortableTextNode[] | string | null | undefined): ReactNode {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return null

  const nodes: ReactNode[] = []
  let key = 0

  for (const item of value) {
    if (!item) continue

    if (item._type === 'lineBreak') {
      nodes.push(<br key={`br-${key++}`} />)
      continue
    }

    if (item._type === 'block') {
      const children = (item as PortableTextBlock).children
      const text = Array.isArray(children) ? children.map((c) => c?.text ?? '').join('') : ''
      if (text.trim()) {
        nodes.push(
          <p key={`p-${key++}`} className="m-0">
            {text}
          </p>,
        )
      }
    }
  }

  return nodes.length ? nodes : null
}

export default function About({ about }: { about: AboutData | null }) {
  return (
    <div className="min-h-screen w-full bg-white px-5 py-6 text-black md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full flex-col">
        <div className="relative flex-1">
        

          <div className="md:max-w-[85%] max-w-[100%] pt-50 md:absolute md:left-0 md:top-[35%] md:pt-0">
            <div className="text-xs text-black md:text-xs">About OS</div>
            <div className="mt-5 md:w-[95%] w-[100%] md:text-lg text-xl text-black md:mt-5 md:w-[90%] md:text-xl">
              {renderPortableText(about?.aboutText ?? null)}
            </div>

            {about?.downloadCvUrl ? (
              <div className="mt-5 text-xs text-black">
                <a href={about.downloadCvUrl} className="hover:underline" target="_blank">
                  (Download CV)
                </a>
              </div>
            ) : null}
          </div>

          <div className="mt-16 flex flex-col gap-6 pb-0 text-xs leading-4 text-black md:absolute md:bottom-24 absolute bottom-14 md:left-0 md:mt-0 md:flex-row md:pb-0">
            <div className="max-w-[220px] md:w-[70%]">{renderPortableText(about?.address ?? null)}</div>
            <div>
              {about?.contactPhone ? <div>{about.contactPhone}</div> : null}
              {about?.contactEmail ? <div>{about.contactEmail}</div> : null}
            </div>
          </div>

          <div className="absolute bottom-6 left-0 md:left-2 text-xs text-black">About</div>
          <div className="absolute bottom-6 right-0 md:right-2 flex gap-6 text-xs tracking-wide text-zinc-500">
            <Link href="/projects/list" className="hover:text-black">
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

