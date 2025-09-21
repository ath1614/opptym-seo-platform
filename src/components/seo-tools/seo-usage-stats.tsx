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
  }
  isAtLimit: {
    seoTools: boolean
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
            SEO tool analyses left
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
              Upgrade Plan
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
