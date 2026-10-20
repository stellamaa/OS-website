import Image from 'next/image'

import logo from '@/public/assets/os-logo-long.svg'

export default function OficinaSateliteLogo({
  className = '',
}: {
  className?: string
}) {
  return (
    <Image
      src={logo}
      alt="OFICINASATELITE"
      priority
      className={`block h-[1.25rem] w-auto md:h-[1.15rem] 4xl:h-8 ${className}`}
    />
  )
}
