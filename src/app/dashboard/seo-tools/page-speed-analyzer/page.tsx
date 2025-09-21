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

  const mockData = {
    url: 'https://example.com',
    overallScore: 78,
    performance: {
      score: 78,
      status: 'good',
      metrics: {
        firstContentfulPaint: 1.2,
        largestContentfulPaint: 2.1,
        firstInputDelay: 45,
        cumulativeLayoutShift: 0.08
      }
    },
    accessibility: {
      score: 92,
      status: 'excellent',
      issues: [
        {
          type: 'warning',
          message: 'Some images may not have alt text',
          severity: 'low'
        }
      ]
    },
    bestPractices: {
      score: 85,
      status: 'good',
      issues: [
        {
          type: 'warning',
          message: 'Consider using HTTPS for all resources',
          severity: 'medium'
        }
      ]
    },
    seo: {
      score: 88,
      status: 'good',
      issues: [
        {
          type: 'info',
          message: 'Consider adding more structured data',
          severity: 'low'
        }
      ]
    },
    recommendations: [
      'Optimize images to reduce file sizes',
      'Enable compression for text resources',
      'Minify CSS and JavaScript files',
      'Use a Content Delivery Network (CDN)',
      'Implement lazy loading for images'
    ],
    opportunities: [
      {
        name: 'Optimize Images',
        savings: '2.1s',
        description: 'Optimizing images could save 2.1 seconds of load time'
      },
      {
        name: 'Enable Compression',
        savings: '1.8s',
        description: 'Enabling compression could save 1.8 seconds of load time'
      },
      {
        name: 'Minify CSS',
        savings: '0.9s',
        description: 'Minifying CSS could save 0.9 seconds of load time'
      }
    ]
  }


  return (
    <DashboardLayout>
      <SEOToolLayout
        toolId="page-speed-analyzer"
        toolName="Page Speed Analyzer"
        toolDescription="Analyze page loading speed and performance metrics"
        mockData={mockData}
      >
        <PageSpeedResults />
      </SEOToolLayout>
    </DashboardLayout>
  )
}
