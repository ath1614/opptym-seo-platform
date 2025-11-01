"use client"

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export default function DashboardAppLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const displayName = (session?.user?.name || 'User')
  const fullText = `Welcome, ${displayName}`

  const [typedText, setTypedText] = useState('')
  const hasAnimatedRef = useRef(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

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
      {/* Sidebar is hidden on mobile via its own class */}
      <Sidebar />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold">{displayName}</span>
        </div>
      </div>

      {/* Main content with responsive left margin */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-[var(--sidebar-width,16rem)]">
        <main className="flex-1 overflow-y-auto p-6 pt-16 md:pt-0">
          {/* Gradient Welcome Header (hidden on mobile) */}
          <div className="hidden md:block mb-8 pb-4 border-b border-border">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {hasAnimatedRef.current ? typedText : fullText}
              </span>
            </h1>
          </div>
          {children}
        </main>
      </div>

      {/* Mobile Drawer for dashboard navigation */}
      {isMobileNavOpen && (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-y-0 left-0 z-[100] w-[85vw] max-w-sm bg-background border-r shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold">Navigation</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setIsMobileNavOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="px-2 py-4 space-y-1">
              <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted" onClick={() => setIsMobileNavOpen(false)}>Dashboard</Link>
              <Link href="/dashboard/analyze-website" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted" onClick={() => setIsMobileNavOpen(false)}>Analyze Website</Link>
              <Link href="/dashboard/projects" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted" onClick={() => setIsMobileNavOpen(false)}>Projects</Link>
              <Link href="/dashboard/seo-tools" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted" onClick={() => setIsMobileNavOpen(false)}>SEO Tools</Link>
              <Link href="/dashboard/seo-tasks" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted" onClick={() => setIsMobileNavOpen(false)}>SEO Tasks</Link>
              <Link href="/dashboard/reports" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted" onClick={() => setIsMobileNavOpen(false)}>Reports</Link>
              <Link href="/dashboard/pricing" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted" onClick={() => setIsMobileNavOpen(false)}>Pricing</Link>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}