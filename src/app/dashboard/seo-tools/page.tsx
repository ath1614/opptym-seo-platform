"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SEOToolsGrid } from '@/components/seo-tools/seo-tools-grid'
import { SEOUsageStats } from '@/components/seo-tools/seo-usage-stats'

export default function SEOToolsPage() {
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
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">SEO Tools</h1>
          <p className="text-muted-foreground">
            Analyze and optimize your website with our comprehensive SEO toolkit
          </p>
        </div>

        {/* Usage Statistics Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-1 w-8 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground">Usage Statistics</h2>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          <div className="bg-muted/30 rounded-lg p-6">
            <SEOUsageStats />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* SEO Tools Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-1 w-8 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground">Available Tools</h2>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          <SEOToolsGrid />
        </div>
      </div>
    </DashboardLayout>
  )
}
