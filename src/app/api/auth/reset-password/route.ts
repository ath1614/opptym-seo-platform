import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    await connectDB()

    // Use direct MongoDB collection to find user with valid reset token
    const db = (await connectDB()).connection.db
    const usersCollection = db.collection('users')
    
    const user = await usersCollection.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    })

    console.log('Reset password attempt:', {
      token: token.substring(0, 10) + '...',
      userFound: !!user,
      currentTime: new Date(),
      tokenExpiry: user?.passwordResetExpires
    })

    // Also try to find any user with this token (regardless of expiry) using direct MongoDB
    const userWithToken = await usersCollection.findOne({ passwordResetToken: token })
    console.log('Debug - Any user with this token:', {
      found: !!userWithToken,
      email: userWithToken?.email,
      tokenExpiry: userWithToken?.passwordResetExpires,
      isExpired: userWithToken?.passwordResetExpires ? userWithToken.passwordResetExpires < new Date() : 'no expiry'
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Hash new password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Update user password and clear reset token using direct MongoDB
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      message: 'Password has been reset successfully' 
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
