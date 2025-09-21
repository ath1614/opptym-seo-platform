import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token to user using direct MongoDB collection update
    const db = (await connectDB()).connection.db
    const usersCollection = db.collection('users')
    
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetTokenExpires
        }
      }
    )
    
    console.log('Direct MongoDB update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged
    })

    console.log('Reset token saved:', {
      email: user.email,
      token: resetToken.substring(0, 10) + '...',
      expires: resetTokenExpires,
      userId: user._id
    })

    // Verify the token was saved by querying the database directly
    const savedUserDirect = await usersCollection.findOne({ _id: user._id })
    console.log('Verification - Direct MongoDB query:', {
      found: !!savedUserDirect,
      hasToken: !!savedUserDirect?.passwordResetToken,
      tokenMatch: savedUserDirect?.passwordResetToken === resetToken,
      tokenExpiry: savedUserDirect?.passwordResetExpires
    })
    
    // Also verify using Mongoose
    const savedUserMongoose = await User.findById(user._id)
    console.log('Verification - Mongoose query:', {
      found: !!savedUserMongoose,
      hasToken: !!savedUserMongoose?.passwordResetToken,
      tokenMatch: savedUserMongoose?.passwordResetToken === resetToken,
      tokenExpiry: savedUserMongoose?.passwordResetExpires
    })

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name || user.username)
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      message: 'If an account with that email exists, we have sent a password reset link.' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
