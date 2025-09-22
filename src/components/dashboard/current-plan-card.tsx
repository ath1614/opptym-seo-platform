"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Crown, Building, Zap, User, ArrowUpRight } from 'lucide-react'
import { getPlanLimits, getUsagePercentage, getRemainingUsage } from '@/lib/subscription-limits'
import { UpgradeModal } from './upgrade-modal'

interface CurrentPlanCardProps {
  plan: string
  usage: {
    projects: number
    submissions: number
    seoTools: number
    backlinks: number
    reports: number
  }
}

export function CurrentPlanCard({ plan, usage }: CurrentPlanCardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<{
    limitType: string
    currentUsage: number
  }>({ limitType: '', currentUsage: 0 })

  const limits = getPlanLimits(plan)
  
  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free': return <User className="w-5 h-5" />
      case 'pro': return <Crown className="w-5 h-5" />
      case 'business': return <Building className="w-5 h-5" />
      case 'enterprise': return <Zap className="w-5 h-5" />
      default: return <User className="w-5 h-5" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'pro': return 'bg-blue-100 text-blue-800'
      case 'business': return 'bg-purple-100 text-purple-800'
      case 'enterprise': return 'bg-gold-100 text-gold-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUpgradeClick = (limitType: string, currentUsage: number) => {
    console.log('Current plan card upgrade clicked:', { limitType, currentUsage, currentPlan: plan })
    setUpgradeReason({ limitType, currentUsage })
    setShowUpgradeModal(true)
  }

  const usageItems = [
    {
      label: 'Projects',
      used: usage.projects,
      limit: limits.projects,
      type: 'projects' as const
    },
    {
      label: 'Submissions',
      used: usage.submissions,
      limit: limits.submissions,
      type: 'submissions' as const
    },
    {
      label: 'SEO Tools',
      used: usage.seoTools,
      limit: limits.seoTools,
      type: 'seoTools' as const
    },
    {
      label: 'Backlinks',
      used: usage.backlinks,
      limit: limits.backlinks,
      type: 'backlinks' as const
    },
    {
      label: 'Reports',
      used: usage.reports,
      limit: limits.reports,
      type: 'reports' as const
    }
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Current Plan</span>
                <Badge className={getPlanColor(plan)}>
                  {getPlanIcon(plan)}
                  <span className="ml-1 capitalize">{plan}</span>
                </Badge>
              </CardTitle>
              <CardDescription>
                Your current subscription limits and usage
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUpgradeClick('plan', 0)}
            >
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageItems.map((item) => {
            const percentage = getUsagePercentage(plan, item.type, item.used)
            const remaining = getRemainingUsage(plan, item.type, item.used)
            const isNearLimit = percentage > 80
            const isAtLimit = percentage >= 100

            return (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">
                      {item.used} / {item.limit === -1 ? '∞' : item.limit}
                    </span>
                    {isAtLimit && (
                      <Badge variant="destructive" className="text-xs">
                        Limit Reached
                      </Badge>
                    )}
                    {isNearLimit && !isAtLimit && (
                      <Badge variant="secondary" className="text-xs">
                        Near Limit
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-2 ${
                    isAtLimit ? 'bg-red-100' : 
                    isNearLimit ? 'bg-yellow-100' : ''
                  }`}
                />
                {remaining !== -1 && remaining <= 5 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {remaining} remaining
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => handleUpgradeClick(item.label.toLowerCase(), item.used)}
                    >
                      Upgrade to get more
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={plan}
        limitType={upgradeReason.limitType}
        currentUsage={upgradeReason.currentUsage}
      />
    </>
  )
}
