import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getUsageStats } from '@/lib/limit-middleware'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const usageStats = await getUsageStats(session.user.id)
    
    if (!usageStats) {
      return NextResponse.json(
        { error: 'Failed to get usage stats' },
        { status: 500 }
      )
    }

    // Transform -1 limits to 'unlimited' for frontend
    const transformedLimits = {
      projects: usageStats.limits.projects === -1 ? 'unlimited' : usageStats.limits.projects,
      submissions: usageStats.limits.submissions === -1 ? 'unlimited' : usageStats.limits.submissions,
      seoTools: usageStats.limits.seoTools === -1 ? 'unlimited' : usageStats.limits.seoTools,
      backlinks: usageStats.limits.backlinks === -1 ? 'unlimited' : usageStats.limits.backlinks,
      reports: usageStats.limits.reports === -1 ? 'unlimited' : usageStats.limits.reports
    }

    const transformedDailyLimits = usageStats.dailyLimits ? {
      submissionsPerProjectPerDay: usageStats.dailyLimits.submissionsPerProjectPerDay === -1 ? 'unlimited' : usageStats.dailyLimits.submissionsPerProjectPerDay,
      seoToolsPerDay: usageStats.dailyLimits.seoToolsPerDay === -1 ? 'unlimited' : usageStats.dailyLimits.seoToolsPerDay
    } : undefined

    return NextResponse.json({
      ...usageStats,
      limits: transformedLimits,
      dailyLimits: transformedDailyLimits || usageStats.dailyLimits,
      todayUsage: usageStats.todayUsage
    })
  } catch (error) {
    console.error('Usage stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}