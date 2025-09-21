"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { MetaTagResults } from '@/components/seo-tools/meta-tag-analyzer'

export default function MetaTagAnalyzerPage() {
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
    title: {
      content: 'Example Website - Your Trusted Partner',
      length: 42,
      status: 'good',
      recommendation: 'Title length is optimal for SEO'
    },
    description: {
      content: 'We provide excellent services to help your business grow. Contact us today for a free consultation.',
      length: 98,
      status: 'good',
      recommendation: 'Description length is within optimal range'
    },
    keywords: {
      content: 'business, services, consultation, growth',
      status: 'warning',
      recommendation: 'Meta keywords are not recommended for SEO. Consider removing them.'
    },
    viewport: {
      content: 'width=device-width, initial-scale=1.0',
      status: 'good',
      recommendation: 'Viewport meta tag is properly configured for mobile'
    },
    robots: {
      content: 'index, follow',
      status: 'good',
      recommendation: 'Robots meta tag allows search engine indexing'
    },
    openGraph: {
      title: 'Example Website - Your Trusted Partner',
      description: 'We provide excellent services to help your business grow.',
      image: 'https://example.com/og-image.jpg',
      url: 'https://example.com',
      status: 'good',
      recommendation: 'Open Graph tags are properly configured for social sharing'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Example Website - Your Trusted Partner',
      description: 'We provide excellent services to help your business grow.',
      image: 'https://example.com/twitter-image.jpg',
      status: 'good',
      recommendation: 'Twitter Card tags are properly configured'
    },
    canonical: {
      content: 'https://example.com',
      status: 'good',
      recommendation: 'Canonical URL is properly set'
    },
    hreflang: {
      content: 'en-US',
      status: 'good',
      recommendation: 'Hreflang is properly configured for language targeting'
    },
    score: 85,
    issues: [
      {
        type: 'warning',
        message: 'Meta keywords tag is present but not recommended for SEO',
        severity: 'low'
      }
    ],
    recommendations: [
      'Remove the meta keywords tag as it is not used by search engines',
      'Consider adding structured data markup for better search results',
      'Add more specific Open Graph images for different page types'
    ]
  }


  return (
    <DashboardLayout>
      <SEOToolLayout
        toolId="meta-tag-analyzer"
        toolName="Meta Tag Analyzer"
        toolDescription="Analyze meta titles, descriptions, and other meta tags for SEO optimization"
        mockData={mockData}
      >
        <MetaTagResults />
      </SEOToolLayout>
    </DashboardLayout>
  )
}
