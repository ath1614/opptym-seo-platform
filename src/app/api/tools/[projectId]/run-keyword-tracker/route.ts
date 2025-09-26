import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { analyzeKeywordTracking } from '@/lib/seo-analysis'
import { trackUsage } from '@/lib/limit-middleware'

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

    // Get project details
    const { default: Project } = await import('@/models/Project')
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if user owns the project
    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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

    // Run keyword tracking analysis
    console.log(`🔍 Starting analysis for project: ${projectId}, URL: ${project.websiteURL}`)
    
    // Validate URL
    if (!project.websiteURL) {
      throw new Error('Project website URL is not set')
    }
    
    try {
      new URL(project.websiteURL)
    } catch (urlError) {
      throw new Error(`Invalid project URL: ${project.websiteURL}`)
    }
    
    const analysisResult = await analyzeKeywordTracking(project.websiteURL)
    console.log(`✅ Analysis completed for project: ${projectId}`)
    
    // Save usage to database
    const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
    const seoToolUsage = new SeoToolUsage({
      userId: session.user.id,
      projectId: projectId,
      toolId: 'keyword-tracker',
      toolName: 'Keyword Tracker',
      url: project.websiteURL,
      results: analysisResult,
      createdAt: new Date()
    })

    await seoToolUsage.save()

    return NextResponse.json({
      success: true,
      data: analysisResult,
      message: 'Keyword tracking analysis completed successfully'
    })

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
