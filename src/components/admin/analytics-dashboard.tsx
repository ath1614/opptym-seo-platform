"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  FolderOpen, 
  Activity, 
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

interface AnalyticsData {
  userGrowth: Array<{
    month: string
    users: number
  }>
  projectGrowth: Array<{
    month: string
    projects: number
  }>
  submissionTrends: Array<{
    month: string
    submissions: number
  }>
  planDistribution: Array<{
    plan: string
    count: number
    percentage: number
  }>
  topCategories: Array<{
    category: string
    count: number
  }>
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 300000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        setError(null)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const isLoading = loading && !analytics

  // Helpers
  const computePercentChange = (current: number, previous: number) => {
    if (!isFinite(current) || !isFinite(previous) || previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const userGrowthMoM = useMemo(() => {
    const arr = analytics?.userGrowth || []
    if (arr.length < 2) return 0
    const current = arr[arr.length - 1]?.users || 0
    const prev = arr[arr.length - 2]?.users || 0
    return computePercentChange(current, prev)
  }, [analytics])

  const projectGrowthMoM = useMemo(() => {
    const arr = analytics?.projectGrowth || []
    if (arr.length < 2) return 0
    const current = arr[arr.length - 1]?.projects || 0
    const prev = arr[arr.length - 2]?.projects || 0
    return computePercentChange(current, prev)
  }, [analytics])

  const toMiniSeries = (series: Array<{ month: string; value: number }>) => {
    const max = Math.max(1, ...series.map(s => s.value))
    return series.map(s => ({ label: s.month, pct: Math.round((s.value / max) * 100), value: s.value }))
  }

  const userSeries = useMemo(() => {
    const arr = (analytics?.userGrowth || []).slice(-12)
    return toMiniSeries(arr.map(a => ({ month: a.month, value: a.users })))
  }, [analytics])

  const projectSeries = useMemo(() => {
    const arr = (analytics?.projectGrowth || []).slice(-12)
    return toMiniSeries(arr.map(a => ({ month: a.month, value: a.projects })))
  }, [analytics])

  const submissionSeries = useMemo(() => {
    const arr = (analytics?.submissionTrends || []).slice(-12)
    return toMiniSeries(arr.map(a => ({ month: a.month, value: a.submissions })))
  }, [analytics])

  const formatMonthShort = (monthStr: string) => {
    // monthStr expected format 'YYYY-MM'
    const [year, month] = monthStr.split('-').map(Number)
    const d = new Date(year, (month || 1) - 1, 1)
    return d.toLocaleString(undefined, { month: 'short' })
  }

  const GrowthRateDisplay = ({ value }: { value: number }) => {
    const sign = value >= 0 ? '+' : ''
    const color = value >= 0 ? 'text-green-600' : 'text-red-600'
    return <span className={`text-2xl font-bold ${color}`}>{sign}{value.toFixed(1)}%</span>
  }

  const MiniBarChart = ({ data, label }: { data: Array<{ label: string; pct: number; value: number }>; label: string }) => {
    if (!data || data.length === 0) {
      return (
        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <div className="h-40 flex items-center justify-center border border-dashed rounded bg-muted/20">
            No data available
          </div>
          <div>We’ll show charts when enough activity is recorded.</div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-end gap-1 h-40">
          {data.map((d, idx) => (
            <div key={`${label}-${idx}`} className="flex flex-col items-center justify-end">
              <div className="w-4 bg-primary/30 hover:bg-primary transition-colors rounded-t" style={{ height: `${d.pct}%` }}></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          {data.map((d, idx) => (
            <span key={`${label}-m-${idx}`}>{formatMonthShort(d.label)}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform insights and trends</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Growth</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.userGrowth?.slice(-1)[0]?.users ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Project Growth</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.projectGrowth?.slice(-1)[0]?.projects ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total projects created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submission Trends</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.submissionTrends?.slice(-1)[0]?.submissions ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                This month's submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <GrowthRateDisplay value={userGrowthMoM} />
              <p className="text-xs text-muted-foreground">vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Project Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <GrowthRateDisplay value={projectGrowthMoM} />
              <p className="text-xs text-muted-foreground">vs last month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>User subscription plan breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.planDistribution?.length ? (
                  analytics?.planDistribution?.map((plan) => (
                    <div key={plan.plan} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="font-medium capitalize">{plan.plan}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{plan.count}</div>
                        <div className="text-xs text-muted-foreground">{plan.percentage}%</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No plan data available yet.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
              <CardDescription>Most popular project categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topCategories?.length ? (
                  analytics?.topCategories?.slice(0, 5).map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <span className="font-medium capitalize">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(category.count / (analytics?.topCategories?.[0]?.count || 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{category.count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No category data available yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trends */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
              <CardDescription>Monthly user registration trends</CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart data={userSeries} label="users" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Growth Trend</CardTitle>
              <CardDescription>Monthly project creation trends</CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart data={projectSeries} label="projects" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission Analytics</CardTitle>
              <CardDescription>Monthly submission trends</CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart data={submissionSeries} label="submissions" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
