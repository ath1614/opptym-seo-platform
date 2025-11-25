import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { logActivity } from '@/lib/activity-logger'

interface ExtendedUser {
  id: string
  email?: string
  name?: string
  role?: string
}

interface ExtendedSession {
  user?: ExtendedUser
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const { id } = await params
    const updates = await request.json()

    // Get the user before updating
    const oldUser = await User.findById(id).lean()
    if (!oldUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Handle ban/unban logic
    if (updates.banned !== undefined) {
      if (updates.banned) {
        updates.bannedAt = new Date()
        updates.bannedReason = updates.bannedReason || 'No reason provided'
      } else {
        updates.bannedAt = null
        updates.bannedReason = ''
      }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -emailVerificationExpires')

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Log the activity
    await logActivity({
      userId: session.user.id,
      userEmail: session.user.email || '',
      userName: session.user.name || '',
      action: 'user_updated',
      resource: 'user',
      resourceId: id,
      details: {
        oldValue: oldUser,
        newValue: updatedUser,
        metadata: {
          updatedBy: 'admin',
          updatedFields: Object.keys(updates)
        }
      }
    })

    return NextResponse.json({ user: updatedUser })

  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const { id } = await params

    // Get the user before deleting
    const user = await User.findById(id).lean()
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete the user
    await User.findByIdAndDelete(id)

    // Log the activity
    await logActivity({
      userId: session.user.id,
      userEmail: session.user.email || '',
      userName: session.user.name || '',
      action: 'user_deleted',
      resource: 'user',
      resourceId: id,
      details: {
        oldValue: user,
        metadata: {
          deletedBy: 'admin',
          deletedUser: {
            username: (user as Record<string, unknown>).username as string,
            email: (user as Record<string, unknown>).email as string
          }
        }
      }
    })

    return NextResponse.json({ message: 'User deleted successfully' })

  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
