import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Submission from '@/models/Submission'
import { getPlanLimits, isLimitExceeded, getPlanLimitsWithCustom, isLimitExceededWithCustom } from '@/lib/subscription-limits'
import { validateToken, incrementTokenUsage } from '@/lib/bookmarklet-tokens'
import { trackUsage } from '@/lib/limit-middleware'
import { logActivity } from '@/lib/activity-logger'
import mongoose from 'mongoose'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { token, projectId, linkId, url, title, description } = await request.json()

    if (!token || !projectId || !linkId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Validate token
    const tokenData = validateToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Check if token has expired
    if (new Date() > tokenData.expiresAt) {
      return NextResponse.json({ error: 'Token has expired' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Check usage limits
    if (tokenData.usageCount >= tokenData.maxUsage) {
      return NextResponse.json({ 
        error: 'Usage limit exceeded for this bookmarklet',
        limitType: 'bookmarklet_usage',
        currentUsage: tokenData.usageCount,
        maxUsage: tokenData.maxUsage
      }, { 
        status: 429,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Check if this is the correct link and project
    if (tokenData.linkId !== linkId || tokenData.projectId !== projectId) {
      return NextResponse.json({ error: 'Token does not match request parameters' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Increment usage count using shared function
    const success = incrementTokenUsage(token)
    if (!success) {
      return NextResponse.json({ error: 'Token not found or expired' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    
    // Get updated token data
    const { bookmarkletTokens } = await import('@/lib/bookmarklet-tokens')
    const updatedTokenData = bookmarkletTokens.get(token)
    if (!updatedTokenData) {
      return NextResponse.json({ error: 'Token expired after usage' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Record the submission
    await connectDB()
    
    // Get link details to extract directory and category
    const db = (await connectDB()).connection.db
    const directoriesCollection = db.collection('directories')
    const link = await directoriesCollection.findOne({ _id: new mongoose.Types.ObjectId(linkId) })
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    
    // Track usage before creating submission
    console.log('Tracking submission usage for user:', tokenData.userId)
    const canSubmit = await trackUsage(tokenData.userId, 'submissions', 1)
    console.log('Can submit result:', canSubmit)
    if (!canSubmit) {
      // Get current usage for better error message
      const currentSubmissions = await Submission.countDocuments({ 
        userId: tokenData.userId,
        status: 'success'
      })
        const user = await User.findById(tokenData.userId)
        const planLimits = await getPlanLimitsWithCustom(user?.plan || 'free')
        const limit = planLimits.submissions === -1 ? 'unlimited' : planLimits.submissions
      
      return new NextResponse(JSON.stringify({ 
        error: 'Submission limit exceeded',
        limitType: 'submissions',
        message: `You have used ${currentSubmissions}/${limit} submissions. Upgrade your plan to continue.`,
        currentUsage: currentSubmissions,
        limit: limit
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    
    const submission = new Submission({
      userId: tokenData.userId,
      projectId: projectId,
      linkId: linkId,
      directory: link.name || link.url || 'Unknown Directory',
      category: link.category || 'directory',
      status: 'success',
      submittedAt: new Date(),
      completedAt: new Date(),
      notes: `Bookmarklet submission - Usage: ${updatedTokenData.usageCount}/${updatedTokenData.maxUsage}
URL: ${url || 'N/A'}
Title: ${title || 'N/A'}
Description: ${description || 'N/A'}`
    })

    console.log('Creating submission:', {
      userId: tokenData.userId,
      projectId: projectId,
      linkId: linkId,
      directory: link.name || link.url || 'Unknown Directory',
      url: url,
      title: title,
      description: description
    })
    
    await submission.save()
    console.log('Submission saved successfully:', submission._id)

    // Get user for logging
    const user = await User.findById(tokenData.userId)
    
    // Log submission activity
    await logActivity({
      userId: tokenData.userId,
      userEmail: user?.email || 'unknown',
      userName: user?.name || user?.username || 'unknown',
      action: 'submission_created',
      resource: 'submission',
      resourceId: submission._id.toString(),
      details: {
        metadata: {
          directory: link.name || link.url || 'Unknown Directory',
          category: link.category || 'directory',
          projectId: projectId,
          linkId: linkId,
          method: 'bookmarklet'
        }
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // Get updated submission count
    const totalSubmissions = await Submission.countDocuments({ 
      userId: tokenData.userId,
      status: 'success'
    })
    
    console.log('Updated submission count:', {
      userId: tokenData.userId,
      totalSubmissions: totalSubmissions,
      submissionId: submission._id
    })

    // Get user's plan limits (user already fetched above)
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
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Bookmarklet submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }
}
