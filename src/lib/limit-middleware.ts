import { NextRequest, NextResponse } from 'next/server'
import connectDB from './mongodb'
import User from '@/models/User'
import Project from '@/models/Project'
import Submission from '@/models/Submission'
import { isLimitExceeded, getPlanLimits, getPlanLimitsWithCustom, isLimitExceededWithCustom, getDailyLimitsWithCustom } from './subscription-limits'
import mongoose from 'mongoose'

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
    const limits = await getPlanLimitsWithCustom(plan, user.role)
    
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
function getTodayRange() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export async function trackUsage(
  userId: string,
  limitType: 'projects' | 'submissions' | 'seoTools' | 'backlinks' | 'reports',
  increment: number = 1,
  context?: { projectId?: string }
): Promise<{ success: boolean; message?: string; currentUsage?: number; limit?: number }> {
  try {
    console.log(`Tracking usage: ${limitType} +${increment} for user ${userId}`)
    await connectDB()
    
    const user = await User.findById(userId)
    if (!user) {
      console.log('User not found for usage tracking')
      return { success: false, message: 'User not found' }
    }

    const plan = user.plan || 'free'
    console.log(`User plan: ${plan}`)
    const dailyLimits = await getDailyLimitsWithCustom(plan, user.role)
    
    // Get actual current usage from database instead of cached counter
    let actualCurrentUsage = 0
    
    if (limitType === 'projects') {
      actualCurrentUsage = await Project.countDocuments({ userId: new mongoose.Types.ObjectId(userId) })
    } else if (limitType === 'submissions') {
      actualCurrentUsage = await Submission.countDocuments({ 
        userId: new mongoose.Types.ObjectId(userId),
        status: 'success'
      })
      // Additional per-day, per-project check
      const { start, end } = getTodayRange()
      if (dailyLimits.submissionsPerProjectPerDay !== -1 && context?.projectId) {
        const todayProjectSubmissions = await Submission.countDocuments({
          userId: new mongoose.Types.ObjectId(userId),
          projectId: new mongoose.Types.ObjectId(context.projectId),
          status: 'success',
          submittedAt: { $gte: start, $lte: end }
        })
        const projected = todayProjectSubmissions + increment
        if (projected > dailyLimits.submissionsPerProjectPerDay) {
          console.log(`❌ Daily per-project submissions limit exceeded: ${projected} > ${dailyLimits.submissionsPerProjectPerDay}`)
          return {
            success: false,
            message: `Daily submissions per project limit exceeded`,
            currentUsage: projected,
            limit: dailyLimits.submissionsPerProjectPerDay
          }
        }
      }
    } else if (limitType === 'seoTools') {
      const SeoToolUsage = (await import('@/models/SeoToolUsage')).default
      actualCurrentUsage = await SeoToolUsage.countDocuments({ 
        userId: new mongoose.Types.ObjectId(userId)
      })
      // Additional per-day check (per user)
      const { start, end } = getTodayRange()
      if (dailyLimits.seoToolsPerDay !== -1) {
        const todaySeoTools = await SeoToolUsage.countDocuments({
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: start, $lte: end }
        })
        const projected = todaySeoTools + increment
        if (projected > dailyLimits.seoToolsPerDay) {
          console.log(`❌ Daily SEO tools limit exceeded: ${projected} > ${dailyLimits.seoToolsPerDay}`)
          return {
            success: false,
            message: `Daily SEO tools limit exceeded`,
            currentUsage: projected,
            limit: dailyLimits.seoToolsPerDay
          }
        }
      }
    } else if (limitType === 'backlinks') {
      const Backlink = (await import('@/models/Backlink')).default
      actualCurrentUsage = await Backlink.countDocuments({ 
        userId: new mongoose.Types.ObjectId(userId),
        status: 'active'
      })
    } else {
      // For other types, use cached counter as fallback
      actualCurrentUsage = user.usage?.[limitType] || 0
    }
    
    const newUsage = actualCurrentUsage + increment
    console.log(`Actual current usage: ${actualCurrentUsage}, New usage: ${newUsage}`)

    // Check if this would exceed the limit
    const limits = await getPlanLimitsWithCustom(plan)
    console.log(`Plan limits for ${plan}:`, limits)
    console.log(`Checking ${limitType}: ${newUsage} vs limit ${limits[limitType]}`)
    
    if (isLimitExceededWithCustom(limits, limitType, newUsage)) {
      console.log(`❌ Usage would exceed limit: ${newUsage} > ${limits[limitType]}`)
      return { 
        success: false, 
        message: `${limitType} limit exceeded`, 
        currentUsage: newUsage, 
        limit: limits[limitType] 
      }
    } else {
      console.log(`✅ Usage is within limit: ${newUsage} <= ${limits[limitType]}`)
    }

    // Update cached usage counter for consistency
    if (!user.usage) {
      user.usage = {
        projects: 0,
        submissions: 0,
        seoTools: 0,
        backlinks: 0,
        reports: 0
      }
    }
    user.usage[limitType] = newUsage
    await user.save()
    console.log(`Usage updated successfully: ${limitType} = ${newUsage}`)
    // Auto-activate project on first usage
    if (context?.projectId && (limitType === 'submissions' || limitType === 'seoTools')) {
      try {
        const project = await Project.findById(context.projectId)
        if (project && project.status === 'draft') {
          project.status = 'active'
          await project.save()
          console.log(`Project ${context.projectId} set to active due to usage`)
        }
      } catch (e) {
        console.warn('Failed to auto-activate project:', e)
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Usage tracking error:', error)
    return { success: false, message: 'Internal server error' }
  }
}

export async function getUsageStats(userId: string) {
  try {
    console.log(`Getting usage stats for user: ${userId}`)
    await connectDB()
    
    const user = await User.findById(userId)
    if (!user) {
      console.log('User not found for usage stats')
      return null
    }

    const plan = user.plan || 'free'
    const limits = await getPlanLimitsWithCustom(plan, user.role)
    
    // Get actual project count from database
    const actualProjects = await Project.countDocuments({ userId: new mongoose.Types.ObjectId(userId) })
    console.log(`Actual projects in database: ${actualProjects}`)
    
    // Get actual submission count from database
    const actualSubmissions = await Submission.countDocuments({ 
      userId: new mongoose.Types.ObjectId(userId),
      status: 'success'
    })
    console.log(`Actual submissions in database for user ${userId}: ${actualSubmissions}`)
    
    // Also log all submissions for debugging
    const allSubmissions = await Submission.find({ 
      userId: new mongoose.Types.ObjectId(userId)
    }).select('status createdAt')
    console.log(`All submissions for user ${userId}:`, allSubmissions.map(s => ({ status: s.status, createdAt: s.createdAt })))
    
    // Get actual SEO tools usage count from database
    const SeoToolUsage = (await import('@/models/SeoToolUsage')).default
    const actualSeoTools = await SeoToolUsage.countDocuments({ 
      userId: new mongoose.Types.ObjectId(userId)
    })
    console.log(`Actual SEO tools usage in database: ${actualSeoTools}`)
    
    // Get actual backlinks count from database
    const Backlink = (await import('@/models/Backlink')).default
    const actualBacklinks = await Backlink.countDocuments({ 
      userId: new mongoose.Types.ObjectId(userId),
      status: 'active'
    })
    console.log(`Actual backlinks in database: ${actualBacklinks}`)
    
    const usage = user.usage || {
      projects: 0,
      submissions: 0,
      seoTools: 0,
      backlinks: 0,
      reports: 0
    }
    console.log(`Cached usage:`, usage)

    // Use actual counts instead of cached counters
    const realUsage = {
      ...usage,
      projects: actualProjects,
      submissions: actualSubmissions,
      seoTools: actualSeoTools,
      backlinks: actualBacklinks
    }
    console.log(`Real usage (with actual counts):`, realUsage)

    // Daily limits and today's usage
    const dailyLimits = await getDailyLimitsWithCustom(plan, user.role)
    const { start, end } = getTodayRange()
    // Count today's submissions (successful) across all projects
    const todaySubmissions = await Submission.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'success',
      submittedAt: { $gte: start, $lte: end }
    })
    // Count today's SEO tool runs
    const SeoToolUsageToday = (await import('@/models/SeoToolUsage')).default
    const todaySeoTools = await SeoToolUsageToday.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: start, $lte: end }
    })

    const result = {
      plan,
      limits,
      usage: realUsage,
      dailyLimits,
      todayUsage: {
        submissions: todaySubmissions,
        seoTools: todaySeoTools
      },
      isAtLimit: {
        projects: isLimitExceededWithCustom(limits, 'projects', realUsage.projects),
        submissions: isLimitExceededWithCustom(limits, 'submissions', realUsage.submissions),
        seoTools: isLimitExceededWithCustom(limits, 'seoTools', realUsage.seoTools),
        backlinks: isLimitExceededWithCustom(limits, 'backlinks', realUsage.backlinks),
        reports: isLimitExceededWithCustom(limits, 'reports', realUsage.reports)
      }
    }
    console.log('Usage stats result:', result)
    return result
  } catch (error) {
    console.error('Get usage stats error:', error)
    return null
  }
}
