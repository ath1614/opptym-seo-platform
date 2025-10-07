"use client"

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardAppLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const displayName = (session?.user?.name || 'User')
  const fullText = `Welcome, ${displayName}`

  const [typedText, setTypedText] = useState('')
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    if (hasAnimatedRef.current) return
    if (!fullText) return

    hasAnimatedRef.current = true
    let i = 0
    setTypedText('')
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1))
      i += 1
      if (i >= fullText.length) {
        clearInterval(interval)
      }
    }, 120)
    return () => clearInterval(interval)
  }, [status, fullText])

  // Do not render the user sidebar/layout on admin routes.
  // Admin pages provide their own layout (navbar + sidebar).
  if (pathname.startsWith('/dashboard/admin')) {
    return <>{children}</>
  }

  return (
    <div className="flex h-full min-h-0 bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8 pb-4 border-b border-border">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {hasAnimatedRef.current ? typedText : fullText}
              </span>
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}