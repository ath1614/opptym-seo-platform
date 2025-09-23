import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    
    // Update user to mark onboarding as complete
    await User.findByIdAndUpdate(
      session.user.id,
      { 
        isNewUser: false,
        lastLogin: new Date()
      },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Onboarding marked as complete'
    })

  } catch (error) {
    console.error('Onboarding complete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
