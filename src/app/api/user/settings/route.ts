import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { notifications, privacy } = body

    // Update user settings
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        notificationSettings: notifications,
        privacySettings: privacy,
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: {
        notifications: updatedUser.notificationSettings,
        privacy: updatedUser.privacySettings
      }
    })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id).select('-password')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      settings: {
        notifications: user.notificationSettings || {
          emailNotifications: true,
          projectUpdates: true,
          seoToolResults: true,
          systemAlerts: true,
          marketingEmails: false,
          weeklyReports: true
        },
        privacy: user.privacySettings || {
          profileVisibility: 'private',
          dataSharing: false,
          analyticsTracking: true
        }
      }
    })

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
