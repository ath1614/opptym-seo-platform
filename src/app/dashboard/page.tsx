"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { CurrentPlanCard } from '@/components/dashboard/current-plan-card'
import { QuickActions } from '@/components/dashboard/quick-actions'

interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
  plan?: string
  companyName?: string
}

interface UsageStats {
  plan: string
  limits: {
    projects: number
    submissions: number
    seoTools: number
    backlinks: number
    reports: number
  }
  usage: {
    projects: number
    submissions: number
    seoTools: number
    backlinks: number
    reports: number
  }
  isAtLimit: {
    projects: boolean
    submissions: boolean
    seoTools: boolean
    backlinks: boolean
    reports: boolean
  }
}

interface AnalyticsData {
  projects: number
  submissions: number
  backlinks: number
  successRate: number
  ranking: number
  trends: {
    projects: number
    submissions: number
    backlinks: number
    successRate: number
    ranking: number
  }
  activeProjects: number
  completedProjects: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
      
      // Add a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('Dashboard loading timeout - forcing loading to false')
        setLoading(false)
      }, 10000) // 10 second timeout
      
      return () => clearTimeout(timeout)
    }
  }, [status])

  const fetchData = async () => {
    try {
      console.log('Fetching dashboard data...')
      
      // Fetch both usage stats and analytics in parallel
      const [usageResponse, analyticsResponse] = await Promise.all([
        fetch('/api/dashboard/usage'),
        fetch('/api/dashboard/analytics')
      ])

      console.log('Usage response status:', usageResponse.status)
      console.log('Analytics response status:', analyticsResponse.status)

      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        console.log('Usage data:', usageData)
        setUsageStats(usageData)
      } else {
        const errorText = await usageResponse.text()
        console.error('Failed to fetch usage stats:', errorText)
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        console.log('Analytics data:', analyticsData)
        setAnalytics(analyticsData)
      } else {
        const errorText = await analyticsResponse.text()
        console.error('Failed to fetch analytics:', errorText)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

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

  // Add a timeout to prevent infinite loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
          <p className="text-sm text-muted-foreground mt-2">If this takes too long, please refresh the page</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const user = session.user as ExtendedUser
  const currentPlan = usageStats?.plan || user?.plan || 'free'

  // Use real data from analytics API
  const stats = {
    projects: analytics?.projects || 0,
    submissions: analytics?.submissions || 0,
    backlinks: analytics?.backlinks || 0,
    successRate: analytics?.successRate || 0,
    ranking: analytics?.ranking || 0
  }

  // Pass trends data to StatsCards
  const trends = analytics?.trends || {
    projects: 0,
    submissions: 0,
    backlinks: 0,
    successRate: 0,
    ranking: 0
  }

  const usage = usageStats?.usage || {
    projects: 0,
    submissions: 0,
    seoTools: 0,
    backlinks: 0,
    reports: 0
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <StatsCards stats={stats} trends={trends} />

        {/* Current Plan and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-1">
            <CurrentPlanCard plan={currentPlan} usage={usage} />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
