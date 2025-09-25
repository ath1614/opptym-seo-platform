"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { CurrentPlanCard } from '@/components/dashboard/current-plan-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { OnboardingTutorial } from '@/components/onboarding/onboarding-tutorial'
import { useOnboarding } from '@/hooks/use-onboarding'
import { Button } from '@/components/ui/button'
import { RefreshCw, HelpCircle } from 'lucide-react'

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
  const [refreshing, setRefreshing] = useState(false)
  const { showOnboarding, hideOnboarding, markOnboardingAsSeen, showOnboardingAgain } = useOnboarding()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      // Set loading to false immediately to prevent infinite loading
      setLoading(false)
      
      // Try to fetch data in background
      fetchData()
    }
  }, [status])

  // Add periodic refresh for submission counter
  useEffect(() => {
    if (status === 'authenticated') {
      const interval = setInterval(() => {
        fetchData(true) // Refresh data every 10 seconds for real-time updates
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [status])

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      }
      console.log('Fetching dashboard data...')
      
      // Fetch both usage stats and analytics in parallel
      const [usageResponse, analyticsResponse] = await Promise.all([
        fetch('/api/dashboard/usage', { credentials: 'include' }),
        fetch('/api/dashboard/analytics', { credentials: 'include' })
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
        // Set default usage stats if API fails
        setUsageStats({
          plan: 'free',
          limits: { projects: 1, submissions: 1, seoTools: 5, backlinks: 0, reports: 1 },
          usage: { projects: 0, submissions: 0, seoTools: 0, backlinks: 0, reports: 0 },
          isAtLimit: { projects: false, submissions: false, seoTools: false, backlinks: false, reports: false }
        })
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        console.log('Analytics data:', analyticsData)
        setAnalytics(analyticsData)
      } else {
        const errorText = await analyticsResponse.text()
        console.error('Failed to fetch analytics:', errorText)
        // Set default analytics if API fails
        setAnalytics({
          projects: 0,
          submissions: 0,
          backlinks: 0,
          successRate: 0,
          ranking: 0,
          trends: { projects: 0, submissions: 0, backlinks: 0, successRate: 0, ranking: 0 },
          activeProjects: 0,
          completedProjects: 0
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // Set default data if all fails
      setUsageStats({
        plan: 'free',
        limits: { projects: 1, submissions: 1, seoTools: 5, backlinks: 0, reports: 1 },
        usage: { projects: 0, submissions: 0, seoTools: 0, backlinks: 0, reports: 0 },
        isAtLimit: { projects: false, submissions: false, seoTools: false, backlinks: false, reports: false }
      })
      setAnalytics({
        projects: 0,
        submissions: 0,
        backlinks: 0,
        successRate: 0,
        ranking: 0,
        trends: { projects: 0, submissions: 0, backlinks: 0, successRate: 0, ranking: 0 },
        activeProjects: 0,
        completedProjects: 0
      })
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
      if (isRefresh) {
        setRefreshing(false)
      }
    }
  }

  const handleRefresh = () => {
    fetchData(true)
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

  // Use real data from analytics API with fallbacks
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

  // Show a message if data is still loading
  const isDataLoading = !usageStats && !analytics

  return (
    <DashboardLayout>
      {/* Onboarding Tutorial */}
      <OnboardingTutorial 
        isOpen={showOnboarding}
        onClose={() => {
          hideOnboarding()
          markOnboardingAsSeen()
        }}
        userPlan={usageStats?.plan || 'free'}
      />
      
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your SEO command center</p>
          </div>
                 <div className="flex items-center space-x-3">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={showOnboardingAgain}
                   >
                     <HelpCircle className="h-4 w-4 mr-2" />
                     Tutorial
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={handleRefresh}
                     disabled={refreshing}
                   >
                     <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                     Refresh
                   </Button>
            {!isDataLoading && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg px-3 py-2">
                <span className="text-green-800 dark:text-green-200 text-sm font-medium">✅ Dashboard Loaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Data Loading Indicator */}
        {isDataLoading && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="text-blue-800 dark:text-blue-200 text-sm">Loading dashboard data...</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <StatsCards stats={stats} trends={trends} />
        </div>

        {/* Quick Actions - Made More Prominent */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Quick Actions</h2>
              <p className="text-blue-700 dark:text-blue-300">Get started with your SEO tasks right away</p>
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <QuickActions />
        </div>

        {/* Current Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
            <CurrentPlanCard plan={currentPlan} usage={usage} />
          </div>

          {/* Additional Info */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <div className="bg-card border rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Your First Project</h3>
                    <p className="text-sm text-muted-foreground">Set up a project to start tracking your website's SEO performance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Run SEO Analysis</h3>
                    <p className="text-sm text-muted-foreground">Use our comprehensive SEO tools to analyze your website</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Generate Reports</h3>
                    <p className="text-sm text-muted-foreground">Create detailed SEO reports to track your progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
