import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const neueHaas = localFont({
  src: [
    {
      path: '../public/fonts/NeueHaasDisplayXXThin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/NeueHaasDisplayXThin.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/NeueHaasDisplayThin.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/NeueHaasDisplayLight.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/NeueHaasDisplayRoman.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/NeueHaasDisplayMediu.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/NeueHaasDisplayBold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/NeueHaasDisplayBlack.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-neue-haas',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Oficina Satelite ',
  description: 'Architecture and Design Studio',
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${neueHaas.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-neue-haas)]" suppressHydrationWarning>
        {children}
        {modal}
      </body>
    </html>
  )
}
