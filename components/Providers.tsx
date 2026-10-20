'use client'

import SiteTransition from './SiteTransition'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SiteTransition>{children}</SiteTransition>
}
