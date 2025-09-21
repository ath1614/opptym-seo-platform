"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Building, Zap } from 'lucide-react'
import { SUBSCRIPTION_LIMITS } from '@/lib/subscription-limits'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: string
  limitType: string
  currentUsage: number
}

const plans = [
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    icon: Crown,
    color: 'bg-blue-100 text-blue-800',
    features: [
      '15 Projects',
      '750 Submissions/month',
      '1,000 SEO Tool uses',
      '100 Backlinks',
      '50 Reports',
      'Email Support'
    ],
    limits: SUBSCRIPTION_LIMITS.pro
  },
  {
    name: 'Business',
    price: '$79',
    period: '/month',
    icon: Building,
    color: 'bg-purple-100 text-purple-800',
    features: [
      '50 Projects',
      '1,500 Submissions/month',
      '5,000 SEO Tool uses',
      '500 Backlinks',
      '200 Reports',
      'Priority Support',
      'API Access'
    ],
    limits: SUBSCRIPTION_LIMITS.business
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    icon: Zap,
    color: 'bg-gold-100 text-gold-800',
    features: [
      'Unlimited Projects',
      'Unlimited Submissions',
      'Unlimited SEO Tools',
      'Unlimited Backlinks',
      'Unlimited Reports',
      'Dedicated Support',
      'Custom Integrations',
      'White-label Options'
    ],
    limits: SUBSCRIPTION_LIMITS.enterprise
  }
]

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  currentPlan, 
  limitType, 
  currentUsage 
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('pro')


  const handleUpgrade = () => {
    // Here you would integrate with your payment processor
    console.log(`Upgrading to ${selectedPlan} plan`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            You&apos;ve reached your {currentPlan} plan limit for {limitType}. 
            Upgrade to continue using Opptym SEO Platform.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative cursor-pointer transition-all ${
                selectedPlan === plan.name.toLowerCase() 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedPlan(plan.name.toLowerCase())}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <plan.icon className="w-6 h-6" />
                </div>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <span>{plan.name}</span>
                  <Badge className={plan.color}>
                    {plan.name}
                  </Badge>
                </CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            Current usage: {currentUsage.toLocaleString()} {limitType}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade}>
              Upgrade to {plans.find(p => p.name.toLowerCase() === selectedPlan)?.name}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
