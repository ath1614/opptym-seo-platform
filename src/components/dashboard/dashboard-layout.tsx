"use client"

import { ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Sidebar } from './sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const displayName = (session?.user?.name || 'User')

  // Simple typewriter effect for the welcome text
  const fullText = `Welcome, ${displayName}`
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
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
  }, [fullText])

  return (
    <div className="flex h-full min-h-0 bg-background">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main content with left margin to account for fixed sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Gradient Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {typedText}
              </span>
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
