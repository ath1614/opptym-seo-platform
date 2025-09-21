import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Submission from '@/models/Submission'
import { getPlanLimits, isLimitExceeded } from '@/lib/subscription-limits'
import { bookmarkletTokens, rateLimitStore, createToken, validateToken, incrementTokenUsage } from '@/lib/bookmarklet-tokens'
import { trackUsage } from '@/lib/limit-middleware'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token, linkId, projectId } = await request.json()

    if (!token || !linkId || !projectId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Rate limiting: max 5 requests per minute per user
    const now = Date.now()
    const rateLimitKey = `user_${session.user.id}`
    const rateLimit = rateLimitStore.get(rateLimitKey)
    
    if (rateLimit) {
      if (now - rateLimit.lastReset > 60000) { // Reset after 1 minute
        rateLimit.count = 0
        rateLimit.lastReset = now
      }
      
      if (rateLimit.count >= 5) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please wait before trying again.',
          retryAfter: Math.ceil((60000 - (now - rateLimit.lastReset)) / 1000)
        }, { status: 429 })
      }
      
      rateLimit.count++
    } else {
      rateLimitStore.set(rateLimitKey, { count: 1, lastReset: now })
    }

    // Validate token
    const tokenData = bookmarkletTokens.get(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // Check if token belongs to the current user
    if (tokenData.userId !== session.user.id) {
      return NextResponse.json({ error: 'Token does not belong to current user' }, { status: 403 })
    }

    // Check if token has expired
    if (new Date() > tokenData.expiresAt) {
      bookmarkletTokens.delete(token)
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
    }

    // Check usage limits
    if (tokenData.usageCount >= tokenData.maxUsage) {
      // Remove expired token
      bookmarkletTokens.delete(token)
      return NextResponse.json({ 
        error: 'Usage limit exceeded for this bookmarklet',
        limitType: 'bookmarklet_usage',
        currentUsage: tokenData.usageCount,
        maxUsage: tokenData.maxUsage
      }, { status: 429 })
    }

    // Check if this is the correct link and project
    if (tokenData.linkId !== linkId || tokenData.projectId !== projectId) {
      return NextResponse.json({ error: 'Token does not match request parameters' }, { status: 400 })
    }

    // Increment usage count using shared function
    const success = incrementTokenUsage(token)
    if (!success) {
      return NextResponse.json({ error: 'Token not found or expired' }, { status: 400 })
    }
    
    // Get updated token data
    const updatedTokenData = bookmarkletTokens.get(token)
    if (!updatedTokenData) {
      return NextResponse.json({ error: 'Token expired after usage' }, { status: 400 })
    }

    // Record the submission
    await connectDB()
    
    // Get link details to extract directory and category
    const db = (await connectDB()).connection.db
    const directoriesCollection = db.collection('directories')
    const link = await directoriesCollection.findOne({ _id: new mongoose.Types.ObjectId(linkId) })
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }
    
    // Track usage before creating submission
    const canSubmit = await trackUsage(session.user.id, 'submissions', 1)
    if (!canSubmit) {
      return NextResponse.json({ 
        error: 'Submission limit exceeded',
        limitType: 'submissions',
        message: 'You have reached your submissions limit. Please upgrade your plan to continue.'
      }, { status: 403 })
    }
    
    const submission = new Submission({
      userId: session.user.id,
      projectId: projectId,
      linkId: linkId,
      directory: link.name || link.url || 'Unknown Directory',
      category: link.category || 'directory',
      status: 'success',
      submittedAt: new Date(),
      completedAt: new Date(),
      notes: `Bookmarklet submission - Usage: ${tokenData.usageCount}/${tokenData.maxUsage}`
    })

    await submission.save()

    // Get updated submission count
    const totalSubmissions = await Submission.countDocuments({ 
      userId: session.user.id,
      status: 'success'
    })

    // Get user's plan limits
    const user = await User.findById(session.user.id)
    const planLimits = getPlanLimits(user?.plan || 'free')

    // Transform -1 limits to 'unlimited' for frontend
    const transformedPlanLimits = {
      projects: planLimits.projects === -1 ? 'unlimited' : planLimits.projects,
      submissions: planLimits.submissions === -1 ? 'unlimited' : planLimits.submissions,
      seoTools: planLimits.seoTools === -1 ? 'unlimited' : planLimits.seoTools,
      backlinks: planLimits.backlinks === -1 ? 'unlimited' : planLimits.backlinks,
      reports: planLimits.reports === -1 ? 'unlimited' : planLimits.reports
    }

    return NextResponse.json({ 
      success: true, 
      usageCount: updatedTokenData.usageCount,
      maxUsage: updatedTokenData.maxUsage,
      remainingUsage: updatedTokenData.maxUsage - updatedTokenData.usageCount,
      totalSubmissions: totalSubmissions,
      planLimits: transformedPlanLimits,
      submissionLimitReached: isLimitExceeded(user?.plan || 'free', 'submissions', totalSubmissions)
    })

  } catch (error) {
    console.error('Bookmarklet validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Generate a new bookmarklet token
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, linkId } = await request.json()

    if (!projectId || !linkId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Check user's plan and usage limits
    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get current submission count for the user
    const currentSubmissions = await Submission.countDocuments({ 
      userId: session.user.id,
      status: 'success'
    })

    // Check if user has exceeded their submission limit
    if (isLimitExceeded(user.plan, 'submissions', currentSubmissions)) {
      return NextResponse.json({ 
        error: 'Submission limit exceeded for your plan',
        limitType: 'submissions',
        currentUsage: currentSubmissions,
        planLimits: getPlanLimits(user.plan)
      }, { status: 429 })
    }

    // Determine usage limits based on plan
    const planLimits = getPlanLimits(user.plan)
    let maxUsage = 1 // Default for free plan
    
    if (user.plan === 'pro') {
      maxUsage = 5
    } else if (user.plan === 'business') {
      maxUsage = 10
    } else if (user.plan === 'enterprise') {
      maxUsage = 25
    }

    // For free plan, check if they have any submissions left
    if (user.plan === 'free' && currentSubmissions >= planLimits.submissions) {
      return NextResponse.json({ 
        error: 'Free plan submission limit reached. Upgrade to continue.',
        limitType: 'submissions',
        currentUsage: currentSubmissions,
        planLimits: planLimits
      }, { status: 429 })
    }

    // Generate unique token using shared function
    const tokenData = createToken(session.user.id, projectId, linkId, maxUsage)
    
    console.log('Token created:', { 
      token: tokenData.token.substring(0, 10) + '...', 
      userId: session.user.id, 
      projectId, 
      linkId, 
      maxUsage,
      tokenStoreSize: bookmarkletTokens.size
    })

    return NextResponse.json({ 
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      maxUsage: tokenData.maxUsage,
      usageCount: tokenData.usageCount
    })

  } catch (error) {
    console.error('Bookmarklet token generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
