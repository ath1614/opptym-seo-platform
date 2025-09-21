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

  const mockData = {
    url: 'https://example.com',
    totalWords: 1250,
    totalKeywords: 45,
    keywordDensity: [
      {
        keyword: 'SEO',
        count: 12,
        density: 0.96,
        status: 'good',
        recommendation: 'Good keyword density for SEO'
      },
      {
        keyword: 'marketing',
        count: 8,
        density: 0.64,
        status: 'good',
        recommendation: 'Optimal density for marketing keyword'
      },
      {
        keyword: 'digital',
        count: 15,
        density: 1.2,
        status: 'warning',
        recommendation: 'Slightly high density, consider reducing usage'
      },
      {
        keyword: 'strategy',
        count: 6,
        density: 0.48,
        status: 'good',
        recommendation: 'Good keyword density for strategy'
      },
      {
        keyword: 'content',
        count: 20,
        density: 1.6,
        status: 'error',
        recommendation: 'Keyword density too high, risk of keyword stuffing'
      }
    ],
    keywordDistribution: {
      title: ['SEO', 'marketing'],
      headings: ['digital', 'strategy', 'content'],
      body: ['SEO', 'marketing', 'digital', 'strategy', 'content'],
      meta: ['SEO', 'marketing']
    },
    recommendations: [
      'Reduce the density of "content" keyword to avoid keyword stuffing',
      'Consider using "digital" keyword more naturally in the content',
      'Add more semantic variations of your primary keywords',
      'Ensure keywords appear naturally in headings and subheadings'
    ],
    score: 78
  }


  return (
    <DashboardLayout>
      <SEOToolLayout
        toolId="keyword-density-checker"
        toolName="Keyword Density Checker"
        toolDescription="Check keyword density and distribution across your content"
        mockData={mockData}
      >
        <KeywordDensityResults />
      </SEOToolLayout>
    </DashboardLayout>
  )
}
