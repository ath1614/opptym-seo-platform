import { NextRequest, NextResponse } from 'next/server'
import connectDB from './mongodb'
import User from '@/models/User'
import Project from '@/models/Project'
import Submission from '@/models/Submission'
import { isLimitExceeded, getPlanLimits, getPlanLimitsWithCustom, isLimitExceededWithCustom } from './subscription-limits'

interface LimitCheckOptions {
  limitType: 'projects' | 'submissions' | 'seoTools' | 'backlinks' | 'reports'
  increment?: number
}

export async function checkSubscriptionLimits(
  request: NextRequest,
  options: LimitCheckOptions
): Promise<NextResponse | null> {
  try {
    // For now, we'll use a simple approach without getToken
    // In a real app, you'd extract the user ID from the session
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const plan = user.plan || 'free'
    const limits = await getPlanLimitsWithCustom(plan)
    
    // Get current usage from user's usage tracking
    const currentUsage = user.usage?.[options.limitType] || 0
    const newUsage = currentUsage + (options.increment || 1)

    // Check if the new usage would exceed the limit
    if (isLimitExceededWithCustom(limits, options.limitType, newUsage)) {
      return NextResponse.json(
        { 
          error: 'Subscription limit exceeded',
          limitType: options.limitType,
          currentUsage: newUsage,
          limit: limits[options.limitType],
          plan: plan
        },
        { status: 403 }
      )
    }

    // If we're just checking (not incrementing), return null to continue
    if (!options.increment) {
      return null
    }

    // Update usage in database
    if (!user.usage) {
      user.usage = {
        projects: 0,
        submissions: 0,
        seoTools: 0,
        backlinks: 0,
        reports: 0
      }
    }
    
    user.usage[options.limitType] = newUsage
    await user.save()

    return null // Continue with the request
  } catch (error) {
    console.error('Limit check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to create limit checking middleware
export function createLimitMiddleware(options: LimitCheckOptions) {
  return async (request: NextRequest) => {
    return await checkSubscriptionLimits(request, options)
  }
}

// Usage tracking functions
export async function trackUsage(
  userId: string,
  limitType: 'projects' | 'submissions' | 'seoTools' | 'backlinks' | 'reports',
  increment: number = 1
): Promise<boolean> {
  try {
    await connectDB()
    
    const user = await User.findById(userId)
    if (!user) return false

    const plan = user.plan || 'free'
    
    if (!user.usage) {
      user.usage = {
        projects: 0,
        submissions: 0,
        seoTools: 0,
        backlinks: 0,
        reports: 0
      }
    }

    const currentUsage = user.usage[limitType] || 0
    const newUsage = currentUsage + increment

    // Check if this would exceed the limit
    const limits = await getPlanLimitsWithCustom(plan)
    if (isLimitExceededWithCustom(limits, limitType, newUsage)) {
      return false
    }

    // Update usage
    user.usage[limitType] = newUsage
    await user.save()
    
    return true
  } catch (error) {
    console.error('Usage tracking error:', error)
    return false
  }
}

export async function getUsageStats(userId: string) {
  try {
    await connectDB()
    
    const user = await User.findById(userId)
    if (!user) return null

    const plan = user.plan || 'free'
    const limits = await getPlanLimitsWithCustom(plan)
    
    const usage = user.usage || {
      projects: 0,
      submissions: 0,
      seoTools: 0,
      backlinks: 0,
      reports: 0
    }

    return {
      plan,
      limits,
      usage: usage,
      isAtLimit: {
        projects: isLimitExceededWithCustom(limits, 'projects', usage.projects),
        submissions: isLimitExceededWithCustom(limits, 'submissions', usage.submissions),
        seoTools: isLimitExceededWithCustom(limits, 'seoTools', usage.seoTools),
        backlinks: isLimitExceededWithCustom(limits, 'backlinks', usage.backlinks),
        reports: isLimitExceededWithCustom(limits, 'reports', usage.reports)
      }
    }
  } catch (error) {
    console.error('Get usage stats error:', error)
    return null
  }
}
