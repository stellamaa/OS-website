import Link from 'next/link'

export default function MapProjectsPage() {
  return (
    <div className="min-h-screen w-full bg-white px-6 py-6 text-black">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full flex-col items-center justify-between gap-4">
        <div className="relative w-full flex-1">
          <div className="absolute bottom-0 right-0 flex gap-6 text-[10px] tracking-wide text-zinc-500">
            <Link href="/projects/list" className="hover:text-black">
              LIST
            </Link>
            <span className="text-black">MAP</span>
          </div>
        </div>
      </div>
    </div>
  )
}

