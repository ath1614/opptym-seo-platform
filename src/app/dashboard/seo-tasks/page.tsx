"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SEOTasksGrid } from '@/components/seo-tasks/seo-tasks-grid'
import { SEOTasksStats } from '@/components/seo-tasks/seo-tasks-stats'

export default function SEOTasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">SEO Tasks</h1>
        <p className="text-muted-foreground">
          Submit your projects to directories, article sites, and other SEO platforms
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-md border p-4 bg-muted/30">
        <h2 className="text-lg font-semibold text-foreground mb-2">Disclaimer</h2>
        <p className="text-sm text-muted-foreground">
          We strive to provide accurate and helpful SEO guidance, but we do not promise 100% accuracy or guaranteed outcomes. The bookmarklet and related automation features are continuously improving over time, and results may vary by site and context. Use these tasks and outputs as directional guidance and validate important decisions with additional tools and your own judgment.
        </p>
      </div>

        {/* Stats */}
        <SEOTasksStats />

        {/* Tasks Grid */}
        <SEOTasksGrid />
      </div>
  )
}
