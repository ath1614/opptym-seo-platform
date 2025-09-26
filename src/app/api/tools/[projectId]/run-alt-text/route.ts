import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
const { default: Project } = await import('@/models/Project')
const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
import { analyzeAltText } from '@/lib/seo-analysis'
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

    // Run alt text analysis
    const analysisResult = await analyzeAltText(project.websiteURL)
    
    // Save usage to database
    const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
    const seoToolUsage = new SeoToolUsage({
      userId: session.user.id,
      projectId: projectId,
      toolId: 'alt-text-checker',
      toolName: 'Alt Text Checker',
      url: project.websiteURL,
      results: analysisResult,
      createdAt: new Date()
    })

    await seoToolUsage.save()

    return NextResponse.json({
      success: true,
      data: analysisResult,
      message: 'Alt text analysis completed successfully'
    })

  } catch (error) {
    console.error('Alt text checker error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
