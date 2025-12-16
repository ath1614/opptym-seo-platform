import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
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

    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    await connectDB()
    
    // Check if URL exists in any project for this user
    const existingProject = await Project.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      websiteURL: url
    }).select('projectName createdAt')

    if (existingProject) {
      return NextResponse.json({
        exists: true,
        project: {
          name: existingProject.projectName,
          createdAt: existingProject.createdAt
        }
      })
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    console.error('Check URL error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}