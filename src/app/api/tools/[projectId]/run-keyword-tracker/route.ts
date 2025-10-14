import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { analyzeKeywordTracking } from '@/lib/seo-analysis'
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

    // Try simplified SEO tool project first
    const toolProject = await SeoToolProject.findById(id)
    if (toolProject) {
      if (toolProject.userId.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      websiteURL = toolProject.websiteURL
    } else {
      // Fallback to full project
      const project = await Project.findById(id)
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      if (project.userId.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      websiteURL = project.websiteURL
    }

    // Track usage
    const usageResult = await trackUsage(session.user.id, 'seoTools', 1, { projectId })
    if (!usageResult.success) {
      return NextResponse.json({ 
        error: usageResult.message,
        currentUsage: usageResult.currentUsage,
        limit: usageResult.limit
      }, { status: 429 })
    }

    // Run keyword tracking analysis
    console.log(`🔍 Starting analysis for project: ${projectId}, URL: ${websiteURL}`)
    
    // Validate URL
    if (!websiteURL) {
      throw new Error('Project website URL is not set')
    }
    
    try {
      new URL(websiteURL)
    } catch (urlError) {
      throw new Error(`Invalid project URL: ${websiteURL}`)
    }
    
    try {
      // Run keyword tracking analysis
    const analysisResult = await analyzeKeywordTracking(websiteURL)
      
      // Only save usage to database AFTER successful analysis
      const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
      const seoToolUsage = new SeoToolUsage({
        userId: session.user.id,
        projectId: projectId,
        toolId: 'keyword-tracker',
        toolName: 'Keyword Tracker',
      url: websiteURL,
        results: analysisResult,
        createdAt: new Date()
      })

      await seoToolUsage.save()

      return NextResponse.json({
        success: true,
        data: analysisResult,
        message: 'Keyword tracking analysis completed successfully'
      })
    } catch (analysisError) {
      console.error('Keyword tracking analysis failed:', analysisError)
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
    console.error('Keyword tracker error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
