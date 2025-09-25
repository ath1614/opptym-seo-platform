"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { PageSpeedResults } from '@/components/seo-tools/page-speed-analyzer'

export default function PageSpeedAnalyzerPage() {
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
      <SEOToolLayout
        toolId="page-speed-analyzer"
        toolName="Page Speed Analyzer"
        toolDescription="Analyze page loading speed and performance metrics"
        mockData={null}
      >
        <PageSpeedResults />
      </SEOToolLayout>
    </DashboardLayout>
  )
}
