import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { trackUsage } from '@/lib/limit-middleware'
import { logActivity } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url, analysisSummary } = body || {}
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const usageResult = await trackUsage(session.user.id, 'reports', 1)
    if (!usageResult.success) {
      return NextResponse.json({
        error: 'Reports limit exceeded',
        limitType: 'reports',
        currentUsage: usageResult.currentUsage,
        limit: usageResult.limit,
        message: usageResult.message || 'Daily reports limit reached.'
      }, { status: 403 })
    }

    // Log report generation for audit and daily counting
    try {
      const userNameCandidate = (session.user as Record<string, unknown>)['username']
      const userNameResolved =
        typeof userNameCandidate === 'string'
          ? userNameCandidate
          : (session.user.name || 'unknown')

      await logActivity({
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        userName: userNameResolved,
        action: 'report_generated',
        resource: 'report',
        details: {
          metadata: {
            url,
            analysisSummary: analysisSummary || null,
            generatedAt: new Date().toISOString()
          }
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    } catch (e) {
      // Non-fatal
      console.warn('Failed to log report generation:', e)
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Analyze Website report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}