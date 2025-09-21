import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import ActivityLog from '@/models/ActivityLog'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const projectId = params.id

    // Find the project to get its details for logging
    const project = await Project.findById(projectId).populate('userId', 'username email')
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Delete the project
    await Project.findByIdAndDelete(projectId)

    // Log the activity
    await ActivityLog.create({
      action: 'project_deleted',
      userId: session.user.id,
      userName: (session.user as { username?: string }).username || 'Admin',
      resource: 'project',
      resourceId: projectId,
      details: {
        projectName: project.projectName,
        deletedBy: (session.user as { username?: string }).username || 'Admin'
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Admin project delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const projectId = params.id
    const updateData = await request.json()

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true }
    ).populate('userId', 'username email')

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Log the activity
    await ActivityLog.create({
      action: 'project_updated',
      userId: session.user.id,
      userName: (session.user as { username?: string }).username || 'Admin',
      resource: 'project',
      resourceId: projectId,
      details: {
        projectName: updatedProject.projectName,
        updatedBy: (session.user as { username?: string }).username || 'Admin'
      }
    })

    return NextResponse.json({ success: true, project: updatedProject })

  } catch (error) {
    console.error('Admin project update error:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}
