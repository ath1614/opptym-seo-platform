"use client"

import { usePathname } from 'next/navigation'
import { Navbar } from './navbar'

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Don't show navbar on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null
  }
  
  return <Navbar />
}
