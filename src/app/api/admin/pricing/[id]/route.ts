import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import PricingPlan from '@/models/PricingPlan'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if plan exists
    const existingPlan = await PricingPlan.findById(id)
    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Pricing plan not found' },
        { status: 404 }
      )
    }

    // Delete the plan
    await PricingPlan.findByIdAndDelete(id)

    return NextResponse.json({
      message: 'Pricing plan deleted successfully'
    })

  } catch (error) {
    console.error('Delete pricing plan error:', error)
    return NextResponse.json(
      { error: 'Failed to delete pricing plan' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if plan exists
    const existingPlan = await PricingPlan.findById(id)
    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Pricing plan not found' },
        { status: 404 }
      )
    }

    // Update the plan
    const updatedPlan = await PricingPlan.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      message: 'Pricing plan updated successfully',
      plan: updatedPlan
    })

  } catch (error) {
    console.error('Update pricing plan error:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing plan' },
      { status: 500 }
    )
  }
}
