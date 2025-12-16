"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  ArrowRight
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
    reports: number | string
  }
  popular?: boolean
  icon: React.ComponentType<{ className?: string }>
  color: string
}

// Plans will be fetched from API

export function PricingPlans() {
  const { data: session } = useSession()
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const checkStripeConfiguration = async () => {
      try {
        const response = await fetch('/api/stripe/test', {
          credentials: 'include' // Include cookies for authentication
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
        const response = await fetch('/api/pricing', {
          credentials: 'include' // Include cookies for authentication
        })
        if (response.ok) {
          const data = await response.json()
          // Transform database plans to component format
          const transformedPlans = data.plans.map((plan: { _id: string; name: string; description?: string; price: number; features: string[]; maxProjects: number; maxSubmissions: number; maxSeoTools: number; maxBacklinks?: number; maxReports?: number }, index: number) => ({
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
              reports: plan.maxReports === -1 ? 'Unlimited' : (plan.maxReports || 1)
            },
            popular: index === 1, // Make second plan popular
            icon: [Star, Zap, Building, Crown][index] || Star,
            color: ['text-gray-600', 'text-blue-600', 'text-purple-600', 'text-yellow-600'][index] || 'text-gray-600'
          }))
          console.log('Transformed plans:', transformedPlans)
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

    const fetchUserPlan = async () => {
      try {
        const response = await fetch('/api/dashboard/usage', {
          credentials: 'include' // Include cookies for authentication
        })
        if (response.ok) {
          const data = await response.json()
          console.log('User plan data from API:', data)
          setCurrentPlan(data.plan || 'free')
        }
      } catch (error) {
        console.error('Failed to fetch user plan:', error)
        // Fallback to session data
        setCurrentPlan((session?.user as { plan?: string })?.plan || 'free')
      }
    }

    fetchPlans()
    if (session?.user) {
      fetchUserPlan()
    }

    // Check Stripe configuration
    checkStripeConfiguration()
  }, [session?.user, showToast])

  const handleUpgrade = async (planId: string, planName: string) => {
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

  const getCurrentPlanBadge = (planId: string, planName: string) => {
    console.log(`Checking plan ${planName} (${planId}) against current plan ${currentPlan}`)
    // Compare by plan name instead of ID since user.plan stores the plan name
    if (planName.toLowerCase() === currentPlan.toLowerCase()) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Current Plan</Badge>
    }
    return null
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Loading pricing plans...
          </p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your SEO needs. All plans include our core features with different usage limits.
        </p>
        
        {/* Stripe Configuration Warning */}
        {stripeConfigured === false && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
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
        <div className="flex items-center justify-center space-x-4 mt-8">
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
              10% Discount
            </Badge>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${
              plan.name.toLowerCase() === currentPlan.toLowerCase() ? 'ring-2 ring-green-500' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full bg-gray-100 ${plan.color}`}>
                  <plan.icon className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm">
                {plan.description}
              </CardDescription>
              <div className="mt-4">
                {getPrice(plan)}
              </div>
              {getCurrentPlanBadge(plan.id, plan.name)}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Usage Limits */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Usage Limits
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Projects</span>
                    <span className="font-medium">{plan.limits.projects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Submissions</span>
                    <span className="font-medium">{plan.limits.submissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SEO Tools</span>
                    <span className="font-medium">{plan.limits.seoTools}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Reports</span>
                    <span className="font-medium">{plan.limits.reports}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Features
                </h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="break-words leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button
                className="w-full text-sm px-2 py-2 h-auto min-h-[40px]"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleUpgrade(plan.id, plan.name)}
                disabled={loadingPlan === plan.id || plan.name.toLowerCase() === currentPlan.toLowerCase()}
              >
                <div className="flex items-center justify-center w-full">
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
                      <span className="truncate">Processing...</span>
                    </>
                  ) : plan.id === currentPlan ? (
                    <span className="truncate">Current Plan</span>
                  ) : plan.id === 'free' ? (
                    <span className="truncate">Downgrade</span>
                  ) : stripeConfigured === false ? (
                    <span className="truncate">Contact Support</span>
                  ) : (
                    <>
                      <span className="truncate">Upgrade to {plan.name}</span>
                      <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                    </>
                  )}
                </div>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Plan Card */}
      <div className="mt-16">
        <Card className="max-w-2xl mx-auto border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Building className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Need a Custom Plan?</CardTitle>
            <CardDescription className="text-base">
              Have specific requirements? We can create a tailored solution for your business needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Custom Features
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Flexible projects, submissions, and tool usage limits</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Custom reports and SEO dashboards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Assisted onboarding and account setup</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Early access to new features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Consultation for tailored workflows</span>
                </li>
              </ul>
            </div>
            
            <Button
              className="w-full"
              onClick={() => {
                // Open contact form modal or redirect to contact page
                window.open('mailto:support@opptym.com?subject=Custom Plan Inquiry', '_blank')
              }}
            >
              Contact Support
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 space-y-8">
        <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Can I change plans anytime?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What happens to my data when I downgrade?</h3>
            <p className="text-muted-foreground">
              Your data is preserved, but you&apos;ll be limited to the features and usage limits of your new plan.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Do you offer refunds?</h3>
            <p className="text-muted-foreground">
              Refunds are not guaranteed. Please contact support for assistance with billing issues.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Is there a free trial?</h3>
            <p className="text-muted-foreground">
              Yes, our Free plan includes basic features. You can upgrade anytime to access advanced tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
