import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PricingPlan from '@/models/PricingPlan'

export async function GET() {
  try {
    console.log('Pricing API called - connecting to database...')
    await connectDB()

    // Get all active pricing plans from database
    const plans = await PricingPlan.find({ active: true })
      .sort({ price: 1 })
      .lean()

    console.log(`Found ${plans.length} pricing plans in database:`, plans.map(p => ({ name: p.name, price: p.price })))

    // If no plans exist, return empty array
    if (plans.length === 0) {
      console.log('No active pricing plans found')
      return NextResponse.json({ plans: [] })
    }

    console.log('Returning pricing plans:', plans)
    return NextResponse.json({ plans })

  } catch (error) {
    console.error('Pricing fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    )
  }
}
