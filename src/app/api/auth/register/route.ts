import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { sendVerificationEmail } from '@/lib/email'
import { logActivity } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, companyName } = await request.json()

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      companyName: companyName || '',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      // Auto-verify in production to avoid email issues
      verified: process.env.NODE_ENV === 'production'
    })

    await user.save()

    // Log user creation activity
    await logActivity({
      userId: user._id.toString(),
      userEmail: user.email,
      userName: user.username,
      action: 'user_created',
      resource: 'user',
      resourceId: user._id.toString(),
      details: {
        metadata: {
          companyName: companyName || '',
          emailVerified: false
        }
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken, username)
    
    if (!emailResult.success) {
      // If email fails, we still create the user but log the error
      console.error('Failed to send verification email:', emailResult.error)
    }

    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        success: true 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
