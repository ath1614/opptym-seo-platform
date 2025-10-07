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

        {/* Stats */}
        <SEOTasksStats />

        {/* Tasks Grid */}
        <SEOTasksGrid />
      </div>
  )
}
