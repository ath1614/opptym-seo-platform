"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { 
  Plus, 
  Search, 
  FileText, 
  BarChart3, 
  Target,
  Upload,
  Download,
  Lock
} from 'lucide-react'

interface UsageStats {
  plan: string
  limits: {
    projects: number | 'unlimited'
    submissions: number | 'unlimited'
    seoTools: number | 'unlimited'
    backlinks: number | 'unlimited'
    reports: number | 'unlimited'
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

const quickActions = [
  {
    id: 'create-project',
    title: 'Create Project',
    description: 'Start a new SEO project',
    icon: Plus,
    href: '/dashboard/projects/new',
    color: 'bg-blue-500 hover:bg-blue-600',
    limitType: 'projects' as const,
    requiresPlan: 'free' as const
  },
  {
    id: 'seo-analysis',
    title: 'SEO Analysis',
    description: 'Analyze your website',
    icon: Search,
    href: '/dashboard/seo-tools',
    color: 'bg-green-500 hover:bg-green-600',
    limitType: 'seoTools' as const,
    requiresPlan: 'free' as const
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Create SEO report',
    icon: FileText,
    href: '/dashboard/reports',
    color: 'bg-purple-500 hover:bg-purple-600',
    limitType: 'reports' as const,
    requiresPlan: 'free' as const
  },
  {
    id: 'track-rankings',
    title: 'Track Rankings',
    description: 'Monitor keyword positions',
    icon: BarChart3,
    href: '/dashboard/seo-tools/keyword-tracker',
    color: 'bg-orange-500 hover:bg-orange-600',
    limitType: 'seoTools' as const,
    requiresPlan: 'pro' as const
  },
  {
    id: 'keyword-research',
    title: 'Keyword Research',
    description: 'Discover new keywords',
    icon: Target,
    href: '/dashboard/seo-tools/keyword-researcher',
    color: 'bg-indigo-500 hover:bg-indigo-600',
    limitType: 'seoTools' as const,
    requiresPlan: 'pro' as const
  }
]

// Recent Actions section removed as per request

export function QuickActions() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchUsageStats = async () => {
      try {
        const response = await fetch('/api/dashboard/usage', {
          credentials: 'include' // Include cookies for authentication
        })
        const data = await response.json()
        
        if (response.ok) {
          setUsageStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch usage stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsageStats()
  }, [])

  const getPlanLevel = (plan: string) => {
    const levels = { free: 0, pro: 1, business: 2, enterprise: 3 }
    return levels[plan as keyof typeof levels] || 0
  }

  const isActionAvailable = (action: typeof quickActions[0]) => {
    if (!usageStats) return false
    
    const userPlanLevel = getPlanLevel(usageStats.plan)
    const requiredPlanLevel = getPlanLevel(action.requiresPlan)
    
    // Check if user's plan level meets the requirement
    if (userPlanLevel < requiredPlanLevel) return false
    
    // Check if user has reached the limit for this action type
    if (usageStats.isAtLimit[action.limitType]) return false
    
    return true
  }

  const handleActionClick = (action: typeof quickActions[0]) => {
    if (!usageStats) return

    if (!isActionAvailable(action)) {
      const userPlanLevel = getPlanLevel(usageStats.plan)
      const requiredPlanLevel = getPlanLevel(action.requiresPlan)
      
      if (userPlanLevel < requiredPlanLevel) {
        showToast({
          title: 'Upgrade Required',
          description: `This feature is available for ${action.requiresPlan} and higher plans.`,
          variant: 'destructive'
        })
        return
      }
      
      if (usageStats.isAtLimit[action.limitType]) {
        showToast({
          title: 'Limit Reached',
          description: `You have reached your ${action.limitType} limit. Upgrade your plan to continue.`,
          variant: 'destructive'
        })
        return
      }
    }

    // Navigate to the action
    window.location.href = action.href
  }

  const availableActions = quickActions.filter(action => isActionAvailable(action))
  const restrictedActions = quickActions.filter(action => !isActionAvailable(action))

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardHeader className="pb-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Quick Actions */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Get started with common SEO tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {availableActions.map((action, index) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex items-start space-x-3 hover:bg-muted hover:border-primary/20 transition-all duration-200 text-left w-full"
                onClick={() => handleActionClick(action)}
              >
                <div className={`p-2.5 rounded-lg ${action.color} text-white flex-shrink-0`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="text-left flex-1 min-w-0 overflow-hidden">
                  <div className="font-semibold text-sm leading-tight mb-1 truncate">
                    {action.title}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
            
            {/* Show restricted actions with lock icon */}
            {restrictedActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                disabled
                className="h-auto p-4 flex items-start space-x-3 opacity-50 cursor-not-allowed text-left w-full"
                onClick={() => handleActionClick(action)}
              >
                <div className="p-2.5 rounded-lg bg-gray-400 text-white flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-left flex-1 min-w-0 overflow-hidden">
                  <div className="font-semibold text-sm leading-tight mb-1 truncate">
                    {action.title}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
