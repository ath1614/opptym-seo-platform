import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { trackUsage } from '@/lib/limit-middleware'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import mongoose from 'mongoose'

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

    // Create actual submission record in database
    await connectDB()
    
    const submission = new Submission({
      userId: new mongoose.Types.ObjectId(session.user.id),
      projectId: projectId ? new mongoose.Types.ObjectId(projectId) : undefined,
      linkId: new mongoose.Types.ObjectId(linkId),
      directory: `SEO Task - ${action}`,
      category: 'seo-task',
      status: 'success',
      submittedAt: new Date(),
      completedAt: new Date(),
      notes: `SEO Task submission - Action: ${action}`
    })

    console.log('Creating SEO task submission:', {
      userId: session.user.id,
      linkId,
      projectId,
      action
    })
    
    await submission.save()
    console.log('SEO task submission saved successfully:', submission._id)

    return NextResponse.json({
      success: true,
      message: 'Submission created and tracked successfully',
      data: {
        submissionId: submission._id,
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
