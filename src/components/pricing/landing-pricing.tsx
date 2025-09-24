"use client"

import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

interface PricingPlan {
  _id: string
  name: string
  price: number
  features: string[]
  active: boolean
  description?: string
  maxProjects: number
  maxSubmissions: number
  maxSeoTools: number
  popular?: boolean
}

const getDefaultPlans = (): PricingPlan[] => [
  {
    _id: 'default-free',
    name: 'Free',
    price: 0,
    features: ['Basic SEO analysis', 'Meta tag analyzer', 'Keyword density checker', 'Broken link scanner', 'Sitemap & robots checker', 'Page speed analyzer', 'Mobile checker', 'Schema validator', 'Alt text checker', 'Canonical checker'],
    active: true,
    description: 'Perfect for getting started',
    maxProjects: 1,
    maxSubmissions: 3,
    maxSeoTools: 5
  },
  {
    _id: 'default-pro',
    name: 'Pro',
    price: 999,
    features: ['Everything in Free', '5 submissions per project per day', '4 SEO tools per day', 'Keyword researcher', 'Backlink scanner', 'Keyword tracker', 'Competitor analyzer', 'Technical SEO auditor', 'Advanced analytics', 'Priority support', 'Custom reports', 'API access'],
    active: true,
    description: 'Advanced SEO tools for growing businesses',
    maxProjects: 1,
    maxSubmissions: 150,
    maxSeoTools: 140,
    popular: true
  },
  {
    _id: 'default-business',
    name: 'Business',
    price: 3999,
    features: ['Everything in Pro', '10 submissions per project per day', 'Unlimited SEO tools per project', 'White-label reports', 'Team collaboration', 'Advanced competitor analysis', 'Custom integrations', 'Dedicated account manager', 'Priority processing', 'Custom branding', 'Advanced API limits'],
    active: true,
    description: 'Complete SEO solution for established businesses',
    maxProjects: 5,
    maxSubmissions: 1500,
    maxSeoTools: -1
  },
  {
    _id: 'default-enterprise',
    name: 'Enterprise',
    price: 8999,
    features: ['Everything in Business', '20 submissions per project', 'Unlimited SEO tools', 'Custom development', 'On-premise deployment', 'Advanced security', 'Custom integrations', 'Dedicated infrastructure', '24/7 phone support', 'Custom training', 'SLA guarantees'],
    active: true,
    description: 'Enterprise-grade SEO platform with custom solutions',
    maxProjects: 10,
    maxSubmissions: 6000,
    maxSeoTools: -1
  }
]

export function LandingPricing() {
  const [plans, setPlans] = useState<PricingPlan[]>(getDefaultPlans())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Try to fetch dynamic plans, but start with defaults
    fetchPricingPlans()
  }, [])

  const fetchPricingPlans = async () => {
    try {
      console.log('Fetching pricing plans...')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('/api/pricing', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Pricing data received:', data)
        
        if (data.plans && data.plans.length > 0) {
          setPlans(data.plans)
          console.log('Plans set successfully:', data.plans.length)
        } else {
          console.log('No plans in response, keeping defaults')
        }
      } else {
        console.log('Response not ok, keeping defaults')
      }
    } catch (err) {
      console.error('Error fetching pricing plans:', err)
      
      // Retry up to 2 times (since we start with defaults)
      if (retryCount < 2) {
        console.log(`Retrying... attempt ${retryCount + 1}`)
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          fetchPricingPlans()
        }, 2000 * (retryCount + 1)) // Exponential backoff
        return
      }
      
      // Keep default plans if API fails after retries
      console.log('Keeping default plans after retries failed')
    }
  }


  const formatPrice = (price: number) => {
    if (price === 0) return "₹0"
    return `₹${price.toLocaleString()}`
  }

  const getPlanColor = (index: number, isPopular?: boolean) => {
    if (isPopular) return "border-primary"
    
    const colors = [
      "border-gray-200",
      "border-blue-200", 
      "border-green-200",
      "border-purple-200",
      "border-orange-200",
      "border-pink-200"
    ]
    return colors[index % colors.length]
  }

  const getPlanFeatures = (plan: PricingPlan) => {
    const features = []
    
    // Projects
    if (plan.maxProjects === -1) {
      features.push("Unlimited Projects")
    } else {
      features.push(`${plan.maxProjects} Project${plan.maxProjects !== 1 ? 's' : ''}`)
    }
    
    // Submissions
    if (plan.maxSubmissions === -1) {
      features.push("Unlimited Submissions")
    } else {
      features.push(`${plan.maxSubmissions} Submission${plan.maxSubmissions !== 1 ? 's' : ''} per month`)
    }
    
    // SEO Tools
    if (plan.maxSeoTools === -1) {
      features.push("Unlimited SEO Tools")
    } else {
      features.push(`${plan.maxSeoTools} SEO Tool use${plan.maxSeoTools !== 1 ? 's' : ''}`)
    }
    
    // Add custom features from the plan
    if (plan.features && plan.features.length > 0) {
      features.push(...plan.features)
    }
    
    return features
  }

  const getPlanCTA = (plan: PricingPlan) => {
    if (plan.name.toLowerCase() === 'free') {
      return "Get Started Free"
    } else if (plan.name.toLowerCase() === 'enterprise') {
      return "Contact Sales"
    } else {
      return `Start ${plan.name} Trial`
    }
  }


  if (error) {
    return (
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchPricingPlans} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            💰 Simple Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free and scale as you grow. All plans include our complete suite of SEO tools 
            and automated submission tasks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`relative h-full transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : getPlanColor(index, plan.popular)
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {plan.price === 0 ? 'forever' : 'per month'}
                    </span>
                  </div>
                  {plan.description && (
                    <CardDescription className="mt-2 text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {getPlanFeatures(plan).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/auth/register" className="block">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                          : 'bg-foreground hover:bg-foreground/90 text-background'
                      }`}
                      variant={plan.popular ? "default" : "secondary"}
                    >
                      {getPlanCTA(plan)}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            Need a custom plan? We offer tailored solutions for enterprise needs.
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Contact Sales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
