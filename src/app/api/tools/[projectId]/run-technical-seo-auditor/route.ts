import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { analyzeTechnicalSEO } from '@/lib/seo-analysis'
import { trackUsage } from '@/lib/limit-middleware'
import mongoose from 'mongoose'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    await connectDB()

    // Resolve website URL from simplified tool project or full project
    const id = new mongoose.Types.ObjectId(projectId)
    const { default: SeoToolProject } = await import('@/models/SeoToolProject')
    const { default: Project } = await import('@/models/Project')
    let websiteURL: string | null = null

    const toolProject = await SeoToolProject.findById(id)
    if (toolProject) {
      if (toolProject.userId.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      websiteURL = toolProject.websiteURL
    } else {
      const project = await Project.findById(id)
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      if (project.userId.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      websiteURL = project.websiteURL
    }

    // Ensure a valid website URL was resolved
    if (!websiteURL) {
      return NextResponse.json({ error: 'Website URL not found for project' }, { status: 400 })
    }

    // websiteURL has been resolved above with ownership validated

    // Track usage
    const usageResult = await trackUsage(session.user.id, 'seoTools', 1, { projectId })
    if (!usageResult.success) {
      return NextResponse.json({ 
        error: usageResult.message,
        currentUsage: usageResult.currentUsage,
        limit: usageResult.limit
      }, { status: 429 })
    }

    // Run technical SEO analysis
    try {
      // Run technical SEO audit
      const analysisResult = await analyzeTechnicalSEO(websiteURL)
      
      // Only save usage to database AFTER successful analysis
      const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
      const seoToolUsage = new SeoToolUsage({
        userId: session.user.id,
        projectId: projectId,
        toolId: 'technical-seo-auditor',
        toolName: 'Technical SEO Auditor',
        url: websiteURL,
        results: analysisResult,
        createdAt: new Date()
      })

      await seoToolUsage.save()

      return NextResponse.json({
        success: true,
        data: analysisResult,
        message: 'Technical SEO audit completed successfully'
      })
    } catch (analysisError) {
      console.error('Technical SEO audit failed:', analysisError)
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
    console.error('Technical SEO auditor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
