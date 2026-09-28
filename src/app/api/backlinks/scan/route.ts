import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Backlink from '@/models/Backlink'
import { trackUsage } from '@/lib/limit-middleware'

import { analyzeBacklinks } from '@/lib/seo-analysis'

// Real backlink discovery function using public citation sources & search mentions
async function discoverBacklinks(targetUrl: string, userId: string): Promise<any[]> {
  try {
    const analysis = await analyzeBacklinks(targetUrl)
    const targetDomain = new URL(targetUrl).hostname

    return (analysis.backlinks || []).map((b) => {
      let linkQuality = 'medium'
      if (b.domainAuthority >= 70 && b.spamScore <= 3) {
        linkQuality = 'high'
      } else if (b.domainAuthority < 30 || b.spamScore > 7) {
        linkQuality = 'low'
      }

      return {
        sourceUrl: b.url,
        targetUrl,
        sourceDomain: b.domain,
        targetDomain,
        anchorText: b.anchorText || `Link to ${targetDomain}`,
        linkType: b.linkType || 'dofollow',
        linkPosition: 'content',
        domainAuthority: b.domainAuthority,
        pageAuthority: Math.max(1, b.domainAuthority - 5),
        linkQuality,
        linkSource: 'discovery',
        status: 'active',
        discoveredAt: new Date(),
        lastCheckedAt: new Date(),
        title: b.anchorText,
        description: `Backlink from ${b.domain}`,
        isIndexed: true,
        isRedirect: false
      }
    })
  } catch (error) {
    console.error('Backlink discovery error:', error)
    return []
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
        { error: 'Backlink scan limit exceeded' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const { targetUrl, projectId } = await request.json()
    
    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(targetUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Discover backlinks
    const discoveredBacklinks = await discoverBacklinks(targetUrl, session.user.id)
    
    if (discoveredBacklinks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No backlinks discovered for this URL',
        backlinks: [],
        stats: {
          totalBacklinks: 0,
          highQuality: 0,
          mediumQuality: 0,
          lowQuality: 0,
          toxicLinks: 0,
          avgDomainAuthority: 0,
          uniqueDomains: 0
        }
      })
    }

    // Save discovered backlinks
    const savedBacklinks = []
    for (const backlinkData of discoveredBacklinks) {
      // Check if backlink already exists
      const existingBacklink = await Backlink.findOne({
        userId: session.user.id,
        sourceUrl: backlinkData.sourceUrl,
        targetUrl: backlinkData.targetUrl
      })

      if (!existingBacklink) {
        const newBacklink = new Backlink({
          ...backlinkData,
          userId: session.user.id,
          projectId: projectId || null
        })
        
        await newBacklink.save()
        savedBacklinks.push(newBacklink)
      }
    }

    // Get updated stats
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
      success: true,
      message: `Discovered ${savedBacklinks.length} new backlinks`,
      backlinks: savedBacklinks,
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
    console.error('Backlink scan error:', error)
    return NextResponse.json(
      { error: 'Failed to scan backlinks' },
      { status: 500 }
    )
  }
}

