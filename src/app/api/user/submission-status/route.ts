import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Submission from '@/models/Submission'
import { getPlanLimitsWithCustom, isLimitExceededWithCustom, getRemainingUsage } from '@/lib/subscription-limits'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Get user data
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get current submission count
    const currentSubmissions = await Submission.countDocuments({ 
      userId: new mongoose.Types.ObjectId(session.user.id),
      status: 'success'
    })

    // Get plan limits from database (consistent with dashboard usage API)
    const planLimits = await getPlanLimitsWithCustom(user.plan)
    const isLimitReached = isLimitExceededWithCustom(planLimits, 'submissions', currentSubmissions)
    const remainingUsage = planLimits.submissions === -1 ? -1 : Math.max(0, planLimits.submissions - currentSubmissions)

    // Transform -1 limits to 'unlimited' for frontend
    const transformedPlanLimits = {
      projects: planLimits.projects === -1 ? 'unlimited' : planLimits.projects,
      submissions: planLimits.submissions === -1 ? 'unlimited' : planLimits.submissions,
      seoTools: planLimits.seoTools === -1 ? 'unlimited' : planLimits.seoTools,
      backlinks: planLimits.backlinks === -1 ? 'unlimited' : planLimits.backlinks,
      reports: planLimits.reports === -1 ? 'unlimited' : planLimits.reports
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        plan: user.plan,
        email: user.email
      },
      submissions: {
        current: currentSubmissions,
        limit: transformedPlanLimits.submissions,
        remaining: remainingUsage === -1 ? 'unlimited' : remainingUsage,
        isLimitReached: isLimitReached,
        isUnlimited: planLimits.submissions === -1
      },
      planLimits: transformedPlanLimits
    })

  } catch (error) {
    console.error('Submission status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
