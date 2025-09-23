"use client"

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  showText?: boolean
  href?: string
}

export function Logo({ 
  className, 
  width = 40, 
  height = 40, 
  showText = true,
  href = "/"
}: LogoProps) {
  const logoElement = (
    <div className={cn("flex items-center space-x-2", className)}>
      <Image
        src="/logo.png"
        alt="Opptym AI SEO Platform"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="font-bold text-xl text-foreground">
          Opptym AI SEO
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoElement}
      </Link>
    )
  }

  return logoElement
}
