"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Link, CheckCircle, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react'

interface UsageStats {
  plan: string
  limits: {
    submissions: number | 'unlimited'
  }
  usage: {
    submissions: number
  }
  isAtLimit: {
    submissions: boolean
  }
}

export function SEOTasksStats() {
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
    
    // Add periodic refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUsageStats()
    }, 30000)

    return () => clearInterval(interval)
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

  const usagePercentage = stats.limits.submissions === 'unlimited' 
    ? 0 
    : (stats.usage.submissions / (stats.limits.submissions as number)) * 100

  const remainingUses = stats.limits.submissions === 'unlimited' 
    ? 'Unlimited' 
    : (stats.limits.submissions as number) - stats.usage.submissions

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Submissions Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Submissions Used</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchUsageStats}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Link className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.usage.submissions}</div>
          <p className="text-xs text-muted-foreground">
            of {stats.limits.submissions === 'unlimited' ? '∞' : stats.limits.submissions} submissions
          </p>
          {stats.limits.submissions !== 'unlimited' && (
            <div className="mt-2">
              <Progress value={usagePercentage} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remaining Uses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining Uses</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {remainingUses}
          </div>
          <p className="text-xs text-muted-foreground">
            submissions left this month
          </p>
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
            {stats.isAtLimit.submissions ? (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Limit reached</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Active</span>
              </>
            )}
          </div>
          {stats.plan === 'free' && (
            <Button 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => showToast({
                title: 'Upgrade Required',
                description: 'Upgrade to Pro or higher for more submissions.',
                variant: 'default'
              })}
            >
              Upgrade Plan
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button size="sm" className="w-full" variant="outline">
              View All Links
            </Button>
            <Button size="sm" className="w-full" variant="outline">
              Generate Bookmarklet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
