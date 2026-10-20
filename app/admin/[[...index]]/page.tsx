import Studio from './studio'

/**
 * Sanity Studio is a client-side app under /admin/*.
 * Static export only needs a shell pages; nested desk routes are handled in the browser.
 */
export function generateStaticParams() {
  return [
    { index: [] },
    { index: ['structure'] },
    { index: ['vision'] },
    { index: ['desk'] },
    { index: ['media'] },
  ]
}

export default function AdminPage() {
  return <Studio />
}
