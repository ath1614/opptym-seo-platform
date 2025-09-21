import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import PricingPlan from '@/models/PricingPlan'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    // Get all pricing plans from database
    const plans = await PricingPlan.find({})
      .sort({ price: 1 })
      .lean()

    // If no plans exist, create default plans
    if (plans.length === 0) {
      console.log('No pricing plans found, creating default plans...')
      const defaultPlans = [
        {
          name: 'Free',
          price: 0,
          features: ['5 SEO tools', '1 project', '1 submission', '1 report'],
          active: true,
          description: 'Perfect for getting started',
          maxProjects: 1,
          maxSubmissions: 1,
          maxSeoTools: 5
        },
        {
          name: 'Pro',
          price: 1999,
          features: ['1000 SEO tools', '15 projects', '750 submissions', '50 reports'],
          active: true,
          description: 'For growing businesses',
          maxProjects: 15,
          maxSubmissions: 750,
          maxSeoTools: 1000
        },
        {
          name: 'Business',
          price: 3999,
          features: ['5000 SEO tools', '50 projects', '1500 submissions', '200 reports'],
          active: true,
          description: 'For established businesses',
          maxProjects: 50,
          maxSubmissions: 1500,
          maxSeoTools: 5000
        },
        {
          name: 'Enterprise',
          price: 9999,
          features: ['Unlimited SEO tools', 'Unlimited projects', 'Unlimited submissions', 'Unlimited reports'],
          active: true,
          description: 'For large organizations',
          maxProjects: -1,
          maxSubmissions: -1,
          maxSeoTools: -1
        }
      ]

      try {
        await PricingPlan.insertMany(defaultPlans)
        console.log('Default pricing plans created successfully')
        const newPlans = await PricingPlan.find({}).sort({ price: 1 }).lean()
        return NextResponse.json({ plans: newPlans })
      } catch (insertError) {
        console.error('Error creating default plans:', insertError)
        // Return the default plans even if database insert fails
        return NextResponse.json({ plans: defaultPlans })
      }
    }

    return NextResponse.json({ plans })

  } catch (error) {
    console.error('Admin pricing fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const planData = await request.json()

    await connectDB()

    // Create new pricing plan
    const newPlan = new PricingPlan(planData)
    const savedPlan = await newPlan.save()

    console.log('Created new pricing plan:', savedPlan)

    return NextResponse.json({ 
      success: true, 
      message: 'Plan created successfully',
      plan: savedPlan
    })

  } catch (error) {
    console.error('Admin pricing create error:', error)
    return NextResponse.json(
      { error: 'Failed to create pricing plan' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const planData = await request.json()

    await connectDB()

    // Update pricing plan
    const updatedPlan = await PricingPlan.findByIdAndUpdate(
      planData._id,
      planData,
      { new: true, runValidators: true }
    )

    if (!updatedPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    console.log('Updated pricing plan:', updatedPlan)

    return NextResponse.json({ 
      success: true, 
      message: 'Plan updated successfully',
      plan: updatedPlan
    })

  } catch (error) {
    console.error('Admin pricing update error:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing plan' },
      { status: 500 }
    )
  }
}
