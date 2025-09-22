"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { 
  Lock, 
  ArrowUpRight, 
  Crown, 
  Building, 
  Zap, 
  User,
  X
} from 'lucide-react'

interface LimitExceededPopupProps {
  isOpen: boolean
  onClose: () => void
  limitType: 'projects' | 'submissions' | 'seoTools' | 'backlinks' | 'reports'
  currentUsage: number
  limit: number | string
  plan: string
  featureName: string
}

export function LimitExceededPopup({ 
  isOpen, 
  onClose, 
  limitType, 
  currentUsage, 
  limit, 
  plan,
  featureName 
}: LimitExceededPopupProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const { showToast } = useToast()

  const getLimitTypeDisplay = (type: string) => {
    switch (type) {
      case 'projects': return 'Projects'
      case 'submissions': return 'Submissions'
      case 'seoTools': return 'SEO Tools'
      case 'backlinks': return 'Backlinks'
      case 'reports': return 'Reports'
      default: return type
    }
  }

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
      case 'enterprise': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      // Redirect to pricing page
      window.location.href = '/dashboard/pricing'
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to redirect to pricing page.',
        variant: 'destructive'
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  const limitDisplay = limit === 'unlimited' ? 'Unlimited' : limit
  const usageDisplay = limit === 'unlimited' ? currentUsage : `${currentUsage}/${limit}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-6 w-6 text-red-500" />
              <DialogTitle>Limit Exceeded</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            You've reached your {getLimitTypeDisplay(limitType)} limit for your current plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Usage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <span>Current Usage</span>
                <Badge className={getPlanColor(plan)}>
                  {getPlanIcon(plan)}
                  <span className="ml-1 capitalize">{plan}</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {getLimitTypeDisplay(limitType)} Used
                  </span>
                  <span className="font-semibold">{usageDisplay}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {featureName} requires {getLimitTypeDisplay(limitType)} usage
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Upgrade Your Plan</CardTitle>
              <CardDescription className="text-xs">
                Get more {getLimitTypeDisplay(limitType)} and unlock premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium mb-1">Benefits of upgrading:</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• More {getLimitTypeDisplay(limitType)} per month</li>
                    <li>• Advanced SEO tools and features</li>
                    <li>• Priority support</li>
                    <li>• Detailed analytics and reports</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full"
                >
                  {isUpgrading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      View Pricing Plans
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
