import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import PricingPlan from '@/models/PricingPlan'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const planData = await request.json()

    await connectDB()

    const updatedPlan = await PricingPlan.findByIdAndUpdate(
      id,
      planData,
      { new: true, runValidators: true }
    )

    if (!updatedPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Plan updated successfully',
      plan: updatedPlan
    })

  } catch (error) {
    console.error('Pricing plan update error:', error)
    return NextResponse.json({ error: 'Failed to update pricing plan' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = await params

    await connectDB()

    const deletedPlan = await PricingPlan.findByIdAndDelete(id)

    if (!deletedPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Plan deleted successfully'
    })

  } catch (error) {
    console.error('Pricing plan delete error:', error)
    return NextResponse.json({ error: 'Failed to delete pricing plan' }, { status: 500 })
  }
}