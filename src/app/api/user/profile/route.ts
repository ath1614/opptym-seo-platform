import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { logActivity } from '@/lib/activity-logger'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { name, email, companyName, bio, phone, website, location } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: session.user.id } 
    })
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already taken' }, { status: 400 })
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        companyName: companyName?.trim() || '',
        bio: bio?.trim() || '',
        phone: phone?.trim() || '',
        website: website?.trim() || '',
        location: location?.trim() || '',
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Log profile update activity
    await logActivity({
      userId: session.user.id,
      userEmail: updatedUser.email,
      userName: updatedUser.name || updatedUser.username,
      action: 'user_updated',
      resource: 'user',
      resourceId: session.user.id,
      details: {
        metadata: {
          fieldsUpdated: ['name', 'email', 'companyName', 'bio', 'phone', 'website', 'location']
        }
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.profileImage || updatedUser.image,
        profileImage: updatedUser.profileImage,
        companyName: updatedUser.companyName,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        website: updatedUser.website,
        location: updatedUser.location,
        role: updatedUser.role,
        plan: updatedUser.plan,
        verified: updatedUser.verified,
        lastLogin: updatedUser.lastLogin,
        notificationSettings: updatedUser.notificationSettings,
        privacySettings: updatedUser.privacySettings,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.profileImage || user.image,
        profileImage: user.profileImage,
        companyName: user.companyName,
        bio: user.bio,
        phone: user.phone,
        website: user.website,
        location: user.location,
        role: user.role,
        plan: user.plan,
        verified: user.verified,
        lastLogin: user.lastLogin,
        notificationSettings: user.notificationSettings,
        privacySettings: user.privacySettings,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
