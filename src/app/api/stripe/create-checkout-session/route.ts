import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import connectDB from '@/lib/mongodb'
import PricingPlan, { IPricingPlan } from '@/models/PricingPlan'

// Initialize Stripe only when needed (not at module level)
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  })
}

// Plan pricing configuration (in INR - Indian Rupees)
const planPricing = {
  pro: {
    monthly: 99900, // ₹999 in paise (Stripe uses smallest currency unit)
    yearly: 1078920, // ₹10789.20 in paise (10% discount)
  },
  business: {
    monthly: 399900, // ₹3999 in paise
    yearly: 4318920, // ₹43189.20 in paise (10% discount)
  },
  enterprise: {
    monthly: 899900, // ₹8999 in paise
    yearly: 9718920, // ₹97189.20 in paise (10% discount)
  },
}

export async function POST(request: NextRequest) {
  try {
    console.log('Creating Stripe checkout session...')
    
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const customerEmail = session?.user?.email ?? undefined
    
    if (!userId) {
      console.log('Unauthorized: No session or user ID')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId, billingCycle } = body

    console.log('Request body:', { planId, billingCycle })

    if (!planId || !billingCycle) {
      console.log('Missing required fields:', { planId, billingCycle })
      return NextResponse.json(
        { error: 'Plan ID and billing cycle are required' },
        { status: 400 }
      )
    }

    if (planId === 'free') {
      console.log('Cannot create checkout for free plan')
      return NextResponse.json(
        { error: 'Cannot create checkout session for free plan' },
        { status: 400 }
      )
    }

    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      console.log('Invalid billing cycle:', billingCycle)
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      )
    }

    // Resolve amount and product info from built-in config or DB custom plan
    let amount: number | null = null
    let productName = ''
    let productDescription = ''

    const builtInPricing = planPricing[planId as keyof typeof planPricing]
    if (builtInPricing) {
      amount = builtInPricing[billingCycle as keyof typeof builtInPricing]
      productName = `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`
      productDescription = `Opptym SEO Platform - ${productName}`
    } else {
      // Look up custom plan from DB by name (case-insensitive)
      await connectDB()
      const planDoc = await PricingPlan.findOne({ name: new RegExp(`^${planId}$`, 'i'), active: true }).lean<IPricingPlan>()
      if (!planDoc) {
        console.log('Invalid plan (not found in DB):', planId)
        return NextResponse.json(
          { error: 'Invalid plan' },
          { status: 400 }
        )
      }
      const monthlyPaise = Math.round((planDoc.price || 0) * 100)
      const yearlyPaise = Math.round((planDoc.price || 0) * 12 * 0.9 * 100) // 10% discount on yearly
      amount = billingCycle === 'yearly' ? yearlyPaise : monthlyPaise

      if (!amount || amount <= 0) {
        console.log('Invalid amount for plan:', { planId, planPrice: planDoc.price, computedAmount: amount })
        return NextResponse.json(
          { error: 'Plan price must be greater than 0' },
          { status: 400 }
        )
      }

      productName = `${planDoc.name} Plan`
      productDescription = planDoc.description ? planDoc.description : `Opptym SEO Platform - ${productName}`
    }

    console.log('Plan pricing:', { planId, billingCycle, amount })

    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not defined')
      return NextResponse.json(
        { 
          error: 'Payment system not configured',
          details: 'STRIPE_SECRET_KEY environment variable is missing',
          message: 'Please configure Stripe keys in your environment variables'
        },
        { status: 500 }
      )
    }

    if (!process.env.NEXTAUTH_URL) {
      console.error('NEXTAUTH_URL is not defined')
      return NextResponse.json(
        { 
          error: 'Configuration error',
          details: 'NEXTAUTH_URL environment variable is missing',
          message: 'Please set NEXTAUTH_URL in your environment variables'
        },
        { status: 500 }
      )
    }

    // Initialize Stripe
    const stripe = getStripe()
    console.log('Stripe initialized successfully')

    // Create or get product using resolved productName and productDescription
    let product: Stripe.Product
    try {
      // Try to find existing product first
      const products = await stripe.products.list({ limit: 100 })
      const existingProduct = products.data.find(p => p.name === productName)
      
      if (existingProduct) {
        product = existingProduct
      } else {
        // Create new product
        product = await stripe.products.create({
          name: productName,
          description: productDescription,
          metadata: {
            planId: planId,
          },
        })
      }
    } catch (error) {
      console.error('Error creating/finding product:', error)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    // Create price for the billing cycle
    const interval = billingCycle === 'yearly' ? 'year' : 'month'
    
    let price: Stripe.Price
    try {
      price = await stripe.prices.create({
        unit_amount: amount!,
        currency: 'inr',
        recurring: {
          interval: interval as 'month' | 'year',
        },
        product: product.id,
        metadata: {
          planId: planId,
          billingCycle: billingCycle,
        },
      })
    } catch (error) {
      console.error('Error creating price:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create price',
          details: error instanceof Error ? error.message : 'Unknown error',
          message: 'Unable to create pricing for the selected plan'
        },
        { status: 500 }
      )
    }

    // Create Stripe Checkout Session
    let checkoutSession: Stripe.Checkout.Session
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXTAUTH_URL}/dashboard/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/pricing?canceled=true`,
        customer_email: customerEmail,
        metadata: {
          userId: userId,
          planId: planId,
          billingCycle: billingCycle,
        },
        subscription_data: {
          metadata: {
            userId: userId,
            planId: planId,
            billingCycle: billingCycle,
          },
        },
      })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create checkout session',
          details: error instanceof Error ? error.message : 'Unknown error',
          message: 'Unable to create payment session. Please try again.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
