"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Zap, TrendingUp, AlertCircle } from 'lucide-react'

interface UsageStats {
  plan: string
  limits: {
    seoTools: number | 'unlimited'
  }
  usage: {
    seoTools: number
    dailyAverage: number
    weeklyTotal: number
    monthlyTotal: number
  }
  isAtLimit: {
    seoTools: boolean
  }
  trendData?: {
    dates: string[]
    values: number[]
    change: number
  }
  mostUsedTools?: {
    name: string
    count: number
  }[]
  dailyLimits?: {
    seoToolsPerDay: number | 'unlimited'
    submissionsPerProjectPerDay?: number | 'unlimited'
  }
  todayUsage?: {
    seoTools: number
    submissions?: number
  }
}

export function SEOUsageStats() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  const fetchUsageStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/usage')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data)
      } else {
        showToast({
          title: 'Error',
          description: 'Failed to fetch usage statistics',
          variant: 'destructive'
        })
      }
    } catch {
      showToast({
        title: 'Error',
        description: 'Network error while fetching usage stats',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchUsageStats()
  }, [fetchUsageStats])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const usagePercentage = stats.limits.seoTools === 'unlimited' 
    ? 0 
    : (stats.usage.seoTools / (stats.limits.seoTools as number)) * 100

  const remainingUses = stats.limits.seoTools === 'unlimited' 
    ? 'Unlimited' 
    : (stats.limits.seoTools as number) - stats.usage.seoTools

  const dailyLimit = stats.dailyLimits?.seoToolsPerDay ?? undefined
  const dailyUsed = stats.todayUsage?.seoTools ?? 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* SEO Tools Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SEO Tools Usage</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.usage.seoTools}</div>
          <p className="text-xs text-muted-foreground">
            of {stats.limits.seoTools === 'unlimited' ? '∞' : stats.limits.seoTools} tools used
          </p>
          {stats.limits.seoTools !== 'unlimited' && (
            <div className="mt-2">
              <Progress value={usagePercentage} className="h-2" />
            </div>
          )}
          <div className="mt-3 text-xs text-muted-foreground">
            Today: <span className="font-medium">{dailyUsed}</span>
            {dailyLimit !== undefined && (
              <>
                {' '}of{' '}
                <span className="font-medium">{dailyLimit === 'unlimited' ? '∞' : dailyLimit}</span>
              </>
            )} runs
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <div className="font-medium">{stats.usage.dailyAverage}</div>
              <div>Daily Avg</div>
            </div>
            <div>
              <div className="font-medium">{stats.usage.weeklyTotal}</div>
              <div>Weekly</div>
            </div>
            <div>
              <div className="font-medium">{stats.usage.monthlyTotal}</div>
              <div>Monthly</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Trends */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usage Trends</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {remainingUses}
            </div>
            <Badge variant={stats.trendData?.change && stats.trendData.change > 0 ? "default" : "secondary"}>
              {stats.trendData?.change && stats.trendData.change > 0 ? "+" : ""}{stats.trendData?.change}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            SEO tool analyses left
          </p>
          
          {stats.trendData && (
            <div className="h-16 flex items-end justify-between mt-2">
              {stats.trendData.values.map((value, i) => (
                <div 
                  key={i} 
                  className="w-[8%] bg-primary/80 rounded-sm"
                  style={{ 
                    height: `${(value / Math.max(...stats.trendData!.values)) * 100}%`,
                    opacity: 0.3 + ((i / stats.trendData!.values.length) * 0.7)
                  }}
                  title={`${stats.trendData!.dates[i]}: ${value} uses`}
                ></div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
          <Badge variant={stats.plan === 'free' ? 'secondary' : 'default'}>
            {stats.plan.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {stats.isAtLimit.seoTools ? (
              <>
                <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">Limit reached</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Active</span>
              </>
            )}
          </div>
          {stats.plan === 'free' && (
            <Button 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => showToast({
                title: 'Upgrade Required',
                description: 'Upgrade to Pro or higher to use more SEO tools.',
                variant: 'default'
              })}
            >
              Upgrade Now
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Most Used Tools */}
      {stats.mostUsedTools && stats.mostUsedTools.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.mostUsedTools.map((tool, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">{tool.name}</span>
                  <Badge variant="outline">{tool.count} uses</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
