/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { logActivity } from '@/lib/activity-logger'

export async function PATCH(
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

    // Check if user is admin
    if ((session.user as any).role !== 'admin') {
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
      userEmail: (session.user as any).email,
      userName: (session.user as any).name,
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
      userEmail: (session.user as any).email,
      userName: (session.user as any).name,
      action: 'user_deleted',
      resource: 'user',
      resourceId: id,
      details: {
        oldValue: user,
        metadata: {
          deletedBy: 'admin',
          deletedUser: {
            username: (user as any).username,
            email: (user as any).email
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
