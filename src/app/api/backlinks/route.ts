import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Backlink from '@/models/Backlink'
import { trackUsage } from '@/lib/limit-middleware'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status') || 'active'
    const quality = searchParams.get('quality')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    // Build query
    const query: any = { 
      userId: session.user.id,
      status: status
    }
    
    if (projectId) {
      query.projectId = projectId
    }
    
    if (quality) {
      query.linkQuality = quality
    }
    
    if (search) {
      query.$or = [
        { sourceDomain: { $regex: search, $options: 'i' } },
        { targetUrl: { $regex: search, $options: 'i' } },
        { anchorText: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit
    
    const [backlinks, total] = await Promise.all([
      Backlink.find(query)
        .sort({ discoveredAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Backlink.countDocuments(query)
    ])

    // Get summary statistics
    const stats = await Backlink.aggregate([
      { $match: { userId: session.user.id, status: 'active' } },
      {
        $group: {
          _id: null,
          totalBacklinks: { $sum: 1 },
          highQuality: { $sum: { $cond: [{ $eq: ['$linkQuality', 'high'] }, 1, 0] } },
          mediumQuality: { $sum: { $cond: [{ $eq: ['$linkQuality', 'medium'] }, 1, 0] } },
          lowQuality: { $sum: { $cond: [{ $eq: ['$linkQuality', 'low'] }, 1, 0] } },
          toxicLinks: { $sum: { $cond: [{ $eq: ['$linkQuality', 'toxic'] }, 1, 0] } },
          avgDomainAuthority: { $avg: '$domainAuthority' },
          uniqueDomains: { $addToSet: '$sourceDomain' }
        }
      },
      {
        $project: {
          totalBacklinks: 1,
          highQuality: 1,
          mediumQuality: 1,
          lowQuality: 1,
          toxicLinks: 1,
          avgDomainAuthority: { $round: ['$avgDomainAuthority', 1] },
          uniqueDomains: { $size: '$uniqueDomains' }
        }
      }
    ])

    return NextResponse.json({
      backlinks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: stats[0] || {
        totalBacklinks: 0,
        highQuality: 0,
        mediumQuality: 0,
        lowQuality: 0,
        toxicLinks: 0,
        avgDomainAuthority: 0,
        uniqueDomains: 0
      }
    })

  } catch (error) {
    console.error('Backlinks fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backlinks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check backlink usage limit
    const canTrack = await trackUsage(session.user.id, 'backlinks', 1)
    if (!canTrack) {
      return NextResponse.json(
        { error: 'Backlink limit exceeded' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const backlinkData = await request.json()
    
    // Validate required fields
    if (!backlinkData.sourceUrl || !backlinkData.targetUrl) {
      return NextResponse.json(
        { error: 'Source URL and target URL are required' },
        { status: 400 }
      )
    }

    // Extract domain from URLs
    const sourceDomain = new URL(backlinkData.sourceUrl).hostname
    const targetDomain = new URL(backlinkData.targetUrl).hostname

    // Check if backlink already exists
    const existingBacklink = await Backlink.findOne({
      userId: session.user.id,
      sourceUrl: backlinkData.sourceUrl,
      targetUrl: backlinkData.targetUrl
    })

    if (existingBacklink) {
      return NextResponse.json(
        { error: 'Backlink already exists' },
        { status: 409 }
      )
    }

    // Create new backlink
    const newBacklink = new Backlink({
      ...backlinkData,
      userId: session.user.id,
      sourceDomain,
      targetDomain,
      discoveredAt: new Date(),
      lastCheckedAt: new Date()
    })

    await newBacklink.save()

    return NextResponse.json({
      success: true,
      backlink: newBacklink
    })

  } catch (error) {
    console.error('Backlink creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create backlink' },
      { status: 500 }
    )
  }
}
