"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'
import { 
  Check, 
  Star, 
  Zap, 
  Building, 
  Crown,
  Loader2,
  ArrowRight,
  X
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  limits: {
    projects: number | string
    submissions: number | string
    seoTools: number | string
    backlinks: number | string
    reports: number | string
  }
  popular?: boolean
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: string
  limitType: string
  currentUsage: number
}

export function UpgradeModal({ isOpen, onClose, currentPlan, limitType, currentUsage }: UpgradeModalProps) {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchPlans()
      checkStripeConfiguration()
    }
  }, [isOpen])

  const checkStripeConfiguration = async () => {
    try {
      const response = await fetch('/api/stripe/test', {
        credentials: 'include'
      })
      const data = await response.json()
      setStripeConfigured(data.configured)
    } catch (error) {
      console.error('Failed to check Stripe configuration:', error)
      setStripeConfigured(false)
    }
  }

  const fetchPlans = async () => {
    try {
      setLoading(true)
      console.log('Fetching pricing plans for upgrade modal...')
      const response = await fetch('/api/pricing', {
        credentials: 'include'
      })
      console.log('Pricing API response:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Pricing data received:', data)
        // Transform database plans to component format
        const transformedPlans = data.plans.map((plan: { _id: string; name: string; description?: string; price: number; features: string[]; maxProjects: number; maxSubmissions: number; maxSeoTools: number }, index: number) => ({
          id: plan.name.toLowerCase(), // Use plan name instead of MongoDB ObjectId
          name: plan.name,
          description: plan.description || `Perfect for ${plan.name.toLowerCase()} users`,
          monthlyPrice: plan.price,
          yearlyPrice: Math.round(plan.price * 12 * 0.9), // 10% discount
          features: plan.features,
          limits: {
            projects: plan.maxProjects === -1 ? 'Unlimited' : plan.maxProjects,
            submissions: plan.maxSubmissions === -1 ? 'Unlimited' : plan.maxSubmissions,
            seoTools: plan.maxSeoTools === -1 ? 'Unlimited' : plan.maxSeoTools,
            backlinks: 0, // Not in current schema
            reports: 1 // Not in current schema
          },
          popular: index === 1, // Make second plan popular
          icon: [Star, Zap, Building, Crown][index] || Star,
          color: ['text-gray-600', 'text-blue-600', 'text-purple-600', 'text-yellow-600'][index] || 'text-gray-600'
        }))
        setPlans(transformedPlans)
      }
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error)
      showToast({
        title: 'Error',
        description: 'Failed to load pricing plans',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string, planName: string) => {
    console.log('UpgradeModal handleUpgrade called:', { planId, planName, currentPlan, stripeConfigured })
    
    if (planName.toLowerCase() === 'free') {
      showToast({
        title: 'Free Plan',
        description: 'You are already on the free plan.',
        variant: 'default'
      })
      return
    }

    if (planName.toLowerCase() === currentPlan.toLowerCase()) {
      showToast({
        title: 'Current Plan',
        description: 'You are already on this plan.',
        variant: 'default'
      })
      return
    }

    // Check if Stripe is configured
    if (stripeConfigured === false) {
      console.log('Stripe not configured, showing error message')
      showToast({
        title: 'Payment System Not Available',
        description: 'Payment processing is currently not configured. Please contact support for manual upgrades.',
        variant: 'destructive'
      })
      return
    }

    setLoadingPlan(planId)
    
    console.log('Creating checkout session for:', { planId, planName, billingCycle: isYearly ? 'yearly' : 'monthly' })
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          planId,
          billingCycle: isYearly ? 'yearly' : 'monthly'
        }),
      })

      const data = await response.json()

      console.log('Checkout response:', { status: response.status, data })

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        console.error('Checkout failed:', { status: response.status, error: data })
        showToast({
          title: 'Error',
          description: data.error || data.message || 'Failed to create checkout session.',
          variant: 'destructive'
        })
      }
    } catch {
      showToast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoadingPlan(null)
    }
  }

  const getPrice = (plan: Plan) => {
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
    if (price === 0) return 'Free'
    
    const monthlyEquivalent = isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice
    return (
      <div className="text-center">
        <div className="text-4xl font-bold">₹{monthlyEquivalent.toLocaleString('en-IN')}</div>
        <div className="text-sm text-muted-foreground">
          {isYearly ? 'per month, billed yearly' : 'per month'}
        </div>
        {isYearly && plan.monthlyPrice > 0 && (
          <div className="text-xs text-green-600 mt-1">
            Save ₹{((plan.monthlyPrice * 12) - plan.yearlyPrice).toLocaleString('en-IN')} per year
          </div>
        )}
      </div>
    )
  }

  // Filter out current plan and free plan for upgrade options
  const upgradePlans = plans.filter(plan => 
    plan.name.toLowerCase() !== currentPlan.toLowerCase() && 
    plan.name.toLowerCase() !== 'free'
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Upgrade Your Plan</DialogTitle>
              <DialogDescription className="text-base">
                {limitType === 'plan' 
                  ? 'Choose a plan that fits your needs better'
                  : `You're running low on ${limitType}. Upgrade to get more capacity.`
                }
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stripe Configuration Warning */}
          {stripeConfigured === false && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="text-yellow-600">⚠️</div>
                <div>
                  <h3 className="font-semibold text-yellow-800">Payment System Not Configured</h3>
                  <p className="text-sm text-yellow-700">
                    Payment processing is currently not available. Please contact support for manual plan upgrades.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2">
                Save 10%
              </Badge>
            )}
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upgradePlans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full bg-muted ${plan.color}`}>
                        <plan.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      {getPrice(plan)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Limits */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Plan Limits</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Projects: {plan.limits.projects}</div>
                        <div>Submissions: {plan.limits.submissions}</div>
                        <div>SEO Tools: {plan.limits.seoTools}</div>
                        <div>Reports: {plan.limits.reports}</div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Features</h4>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{plan.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.id, plan.name)}
                      disabled={loadingPlan === plan.id || stripeConfigured === false}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : stripeConfigured === false ? (
                        'Contact Support'
                      ) : (
                        <>
                          Upgrade to {plan.name}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Current Usage Info */}
          {limitType !== 'plan' && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Current Usage</h4>
              <p className="text-sm text-muted-foreground">
                You've used {currentUsage} out of your current plan's limit for {limitType}.
                Upgrade to get more capacity and continue growing your SEO campaigns.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}