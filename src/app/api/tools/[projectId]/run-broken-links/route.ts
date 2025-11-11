import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
const { default: Project } = await import('@/models/Project')
const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
import { analyzeBrokenLinks } from '@/lib/seo-analysis'
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

    // Check if tool is enabled
    const { checkSeoToolAccess } = await import('@/lib/seo-tool-middleware')
    const accessCheck = await checkSeoToolAccess('broken-link-scanner')
    if (!accessCheck.success) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status })
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

    try {
      // Run broken link analysis
      const analysisResult = await analyzeBrokenLinks(project.websiteURL)
      
      // Only save usage to database AFTER successful analysis
      const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
      const seoToolUsage = new SeoToolUsage({
        userId: session.user.id,
        projectId: projectId,
        toolId: 'broken-link-scanner',
        toolName: 'Broken Link Scanner',
        url: project.websiteURL,
        results: analysisResult,
        createdAt: new Date()
      })

      await seoToolUsage.save()

      return NextResponse.json({
        success: true,
        data: analysisResult,
        message: 'Broken link analysis completed successfully'
      })
    } catch (analysisError) {
      console.error('Broken link analysis failed:', analysisError)
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
    console.error('Broken link scanner error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
