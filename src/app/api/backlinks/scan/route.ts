import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Backlink from '@/models/Backlink'
import { trackUsage } from '@/lib/limit-middleware'

// Simple backlink discovery function
async function discoverBacklinks(targetUrl: string, userId: string): Promise<any[]> {
  try {
    // This is a simplified implementation
    // In a real scenario, you would use services like Ahrefs, Moz, or SEMrush APIs
    // For now, we'll simulate backlink discovery based on common patterns
    
    const targetDomain = new URL(targetUrl).hostname
    const discoveredBacklinks = []
    
    // Simulate finding backlinks from directory submissions
    const commonDirectories = [
      'directory1.com',
      'directory2.com', 
      'directory3.com',
      'business-directory.com',
      'local-directory.net'
    ]
    
    // Simulate finding backlinks from social media and other sources
    const socialSources = [
      'linkedin.com',
      'facebook.com',
      'twitter.com',
      'reddit.com',
      'medium.com'
    ]
    
    // Generate simulated backlinks
    for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
      const isDirectory = Math.random() > 0.5
      const sourceDomain = isDirectory 
        ? commonDirectories[Math.floor(Math.random() * commonDirectories.length)]
        : socialSources[Math.floor(Math.random() * socialSources.length)]
      
      const sourceUrl = `https://${sourceDomain}/page-${i + 1}`
      
      // Simulate link quality based on domain
      let linkQuality = 'medium'
      let domainAuthority = Math.floor(Math.random() * 50) + 20
      
      if (sourceDomain.includes('linkedin') || sourceDomain.includes('medium')) {
        linkQuality = 'high'
        domainAuthority = Math.floor(Math.random() * 30) + 70
      } else if (sourceDomain.includes('directory')) {
        linkQuality = 'low'
        domainAuthority = Math.floor(Math.random() * 20) + 10
      }
      
      discoveredBacklinks.push({
        sourceUrl,
        targetUrl,
        sourceDomain,
        targetDomain,
        anchorText: `Visit ${targetDomain}`,
        linkType: 'dofollow',
        linkPosition: 'content',
        domainAuthority,
        pageAuthority: Math.floor(Math.random() * 20) + domainAuthority - 10,
        linkQuality,
        linkSource: 'submission',
        status: 'active',
        discoveredAt: new Date(),
        lastCheckedAt: new Date(),
        title: `Page about ${targetDomain}`,
        description: `Directory listing for ${targetDomain}`,
        isIndexed: true,
        isRedirect: false
      })
    }
    
    return discoveredBacklinks
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
