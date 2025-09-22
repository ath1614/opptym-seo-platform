import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Test endpoint to check Stripe configuration
export async function GET() {
  try {
    // Check if Stripe keys are configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        configured: false,
        error: 'STRIPE_SECRET_KEY is not defined',
        message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.'
      }, { status: 500 })
    }

    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json({
        configured: false,
        error: 'STRIPE_PUBLISHABLE_KEY is not defined',
        message: 'Stripe publishable key is not configured.'
      }, { status: 500 })
    }

    // Try to initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })

    // Test Stripe connection by listing products
    const products = await stripe.products.list({ limit: 1 })
    
    return NextResponse.json({
      configured: true,
      message: 'Stripe is properly configured',
      productsCount: products.data.length,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not set'
    })

  } catch (error) {
    console.error('Stripe test error:', error)
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Stripe configuration test failed'
    }, { status: 500 })
  }
}
