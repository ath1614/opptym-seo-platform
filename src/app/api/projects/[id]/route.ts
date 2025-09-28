import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    
    const { id } = await params
    const project = await Project.findOne({ 
      _id: id, 
      userId: session.user.id 
    }).select('-__v')

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    await connectDB()
    
    const { id } = await params
    const project = await Project.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-__v')

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Project updated successfully',
      project
    })
  } catch (error) {
    console.error('Update project error:', error)
    
    if (error instanceof Error && error.name === 'ValidationError') {
      // Parse Mongoose validation errors to provide detailed field-specific messages
      const validationErrors: Record<string, string> = {}
      
      if (error.message) {
        // Handle Mongoose validation error format
        const errorMessages = error.message.split(', ')
        errorMessages.forEach(msg => {
          const match = msg.match(/^(.+): (.+)$/)
          if (match) {
            const field = match[1].trim()
            const message = match[2].trim()
            validationErrors[field] = message
          }
        })
      }
      
      // Create detailed error summary
      const errorCount = Object.keys(validationErrors).length
      const errorSummary = Object.entries(validationErrors)
        .map(([field, message], index) => `${index + 1}. ${field}: ${message}`)
        .join('\n')
      
      return NextResponse.json(
        { 
          error: 'Validation failed',
          validationErrors,
          message: `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''}:\n\n${errorSummary}`,
          errorCount
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'You must be logged in to delete a project'
        },
        { status: 401 }
      )
    }

    await connectDB()
    
    const { id } = await params
    
    // Validate project ID format
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { 
          error: 'Invalid project ID',
          message: 'The provided project ID is not valid'
        },
        { status: 400 }
      )
    }

    // First check if project exists and belongs to user
    const project = await Project.findOne({
      _id: id,
      userId: session.user.id
    })

    if (!project) {
      return NextResponse.json(
        { 
          error: 'Project not found',
          message: 'The project does not exist or you do not have permission to delete it'
        },
        { status: 404 }
      )
    }

    // Delete the project
    await Project.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
      projectName: project.projectName
    })
  } catch (error) {
    console.error('Delete project error:', error)
    
    // Handle specific MongoDB errors
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { 
          error: 'Invalid project ID',
          message: 'The provided project ID format is invalid'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting the project. Please try again.'
      },
      { status: 500 }
    )
  }
}
