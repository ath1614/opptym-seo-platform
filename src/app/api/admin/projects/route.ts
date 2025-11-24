/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const query: Record<string, any> = {}
    
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { websiteURL: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate({ path: 'userId', select: 'username email name', model: 'User' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query)
    ])

    // Transform the data to match component expectations
    const transformedProjects = projects.map(project => ({
      ...project,
      user: project.userId
    }))

    return NextResponse.json({
      projects: transformedProjects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Admin projects fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
