"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { KeywordDensityResults } from '@/components/seo-tools/keyword-density-checker'

export default function KeywordDensityCheckerPage() {
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
        toolId="keyword-density-checker"
        toolName="Keyword Density Checker"
        toolDescription="Check keyword density and distribution across your content"
        mockData={null}
      >
        <KeywordDensityResults />
      </SEOToolLayout>
    </DashboardLayout>
  )
}
