import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { analyzeSitemapAndRobots } from '@/lib/seo-analysis'
import { trackUsage } from '@/lib/limit-middleware'
import mongoose from 'mongoose'
import Project from '@/models/Project'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params
    await connectDB()

    // Resolve project and validate ownership
    const id = new mongoose.Types.ObjectId(projectId)
    const project = await Project.findById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const websiteURL = project.websiteURL
    if (!websiteURL) {
      return NextResponse.json({ error: 'Website URL not found for project' }, { status: 400 })
    }

    // Track usage
    const usageResult = await trackUsage(session.user.id, 'seoTools', 1)
    if (!usageResult.success) {
      return NextResponse.json({ 
        error: usageResult.message,
        currentUsage: usageResult.currentUsage,
        limit: usageResult.limit
      }, { status: 429 })
    }

    try {
      // Run sitemap and robots analysis
      const analysisResult = await analyzeSitemapAndRobots(websiteURL)
      
      // Only save usage to database AFTER successful analysis
      const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
      const seoToolUsage = new SeoToolUsage({
        userId: session.user.id,
        projectId: projectId,
        toolId: 'sitemap-robots-checker',
        toolName: 'Sitemap & Robots Checker',
        url: websiteURL,
        results: analysisResult,
        createdAt: new Date()
      })

      await seoToolUsage.save()

      return NextResponse.json({
        success: true,
        data: analysisResult,
        message: 'Sitemap and robots analysis completed successfully'
      })
    } catch (analysisError) {
      console.error('Sitemap and robots analysis failed:', analysisError)
      // Don't save stats if analysis fails
      return NextResponse.json(
        { 
          error: 'Analysis failed',
          details: analysisError instanceof Error ? analysisError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Sitemap robots checker error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
