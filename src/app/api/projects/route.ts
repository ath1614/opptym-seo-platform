import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'
import { trackUsage } from '@/lib/limit-middleware'
import { getPlanLimitsWithCustom } from '@/lib/subscription-limits'
import { logActivity } from '@/lib/activity-logger'
import mongoose from 'mongoose'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    
    const projects = await Project.find({ userId: new mongoose.Types.ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .select('-__v')

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const body = await request.json()
    
    // Check current project count first
    await connectDB()
    const existingProjects = await Project.countDocuments({ 
      userId: new mongoose.Types.ObjectId(session.user.id) 
    })
    
    // Get user's plan limits
    const user = await User.findById(session.user.id)
    const plan = user?.plan || 'free'
    const limits = await getPlanLimitsWithCustom(plan)
    
    // Check if user can create a new project
    if (existingProjects >= limits.projects && limits.projects !== -1) {
      return NextResponse.json(
        { 
          error: 'Project limit exceeded',
          limitType: 'projects',
          currentUsage: existingProjects,
          limit: limits.projects,
          plan: plan,
          message: `You have reached your project limit (${existingProjects}/${limits.projects}). Please upgrade your plan to create more projects.`
        },
        { status: 403 }
      )
    }

    await connectDB()
    
    // Create new project
    const project = new Project({
      ...body,
      userId: new mongoose.Types.ObjectId(session.user.id)
    })

    await project.save()

    // Update usage tracking after successful creation
    console.log('Updating usage tracking for project creation...')
    const usageUpdated = await trackUsage(session.user.id, 'projects', 1)
    console.log('Usage tracking result:', usageUpdated)

    // Log project creation activity
    await logActivity({
      userId: session.user.id,
      userEmail: session.user.email || 'unknown',
      userName: session.user.name || session.user.username || 'unknown',
      action: 'project_created',
      resource: 'project',
      resourceId: project._id.toString(),
      details: {
        metadata: {
          projectName: project.projectName,
          category: project.category,
          websiteUrl: project.websiteUrl
        }
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json(
      { 
        message: 'Project created successfully',
        project 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create project error:', error)
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}