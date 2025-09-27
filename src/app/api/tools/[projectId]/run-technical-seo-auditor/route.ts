import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { analyzeTechnicalSEO } from '@/lib/seo-analysis'
import { trackUsage } from '@/lib/limit-middleware'

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

    // Run technical SEO analysis
    const analysisResult = await analyzeTechnicalSEO(project.websiteURL)
    
    // Save usage to database
    const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
    const seoToolUsage = new SeoToolUsage({
      userId: session.user.id,
      projectId: projectId,
      toolId: 'technical-seo-auditor',
      toolName: 'Technical SEO Auditor',
      url: project.websiteURL,
      results: analysisResult,
      createdAt: new Date()
    })

    await seoToolUsage.save()

    return NextResponse.json({
      success: true,
      data: analysisResult,
      message: 'Technical SEO analysis completed successfully'
    })

  } catch (error) {
    console.error('Technical SEO auditor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
