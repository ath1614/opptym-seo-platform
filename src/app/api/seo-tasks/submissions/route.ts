import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { trackUsage } from '@/lib/limit-middleware'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { linkId, projectId, action } = body

    if (!linkId || !action) {
      return NextResponse.json(
        { error: 'Link ID and action are required' },
        { status: 400 }
      )
    }

    // Check if user can make a submission
    const canSubmit = await trackUsage(session.user.id, 'submissions', 1)
    
    if (!canSubmit) {
      return NextResponse.json(
        { 
          error: 'Submissions limit exceeded',
          limitType: 'submissions',
          message: 'You have reached your submissions limit. Please upgrade your plan to continue.'
        },
        { status: 403 }
      )
    }

    // Log the submission (in a real app, you might want to store this in a database)
    console.log('SEO Task Submission:', {
      userId: session.user.id,
      linkId,
      projectId,
      action,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Submission tracked successfully',
      data: {
        linkId,
        projectId,
        action,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('SEO task submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
