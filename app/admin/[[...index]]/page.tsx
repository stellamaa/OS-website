import Studio from './studio'

export function generateStaticParams() {
  return [{ index: [] as string[] }]
}

export default function AdminPage() {
  return <Studio />
}
