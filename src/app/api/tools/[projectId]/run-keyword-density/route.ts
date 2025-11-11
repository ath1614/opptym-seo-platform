import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
const { default: Project } = await import('@/models/Project')
const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
import { analyzeKeywordDensity } from '@/lib/seo-analysis'
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
    const accessCheck = await checkSeoToolAccess('keyword-density-checker')
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

    // Prepare project keywords for density analysis
    const projectKeywords = [
      ...(project.keywords || []),
      ...(project.targetKeywords || []),
      ...(project.seoMetadata?.keywords ? [project.seoMetadata.keywords] : [])
    ].filter(k => k && typeof k === 'string' && k.trim().length > 0)
    
    // Run keyword density analysis
    try {
      // Run keyword density analysis with project keywords
      const analysisResult = await analyzeKeywordDensity(project.websiteURL, projectKeywords)
      
      // Only save usage to database AFTER successful analysis
      const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
      const seoToolUsage = new SeoToolUsage({
        userId: session.user.id,
        projectId: projectId,
        toolId: 'keyword-density-checker',
        toolName: 'Keyword Density Checker',
        url: project.websiteURL,
        results: analysisResult,
        createdAt: new Date()
      })

      await seoToolUsage.save()

      return NextResponse.json({
        success: true,
        data: analysisResult,
        message: 'Keyword density analysis completed successfully'
      })
    } catch (analysisError) {
      console.error('Keyword density analysis failed:', analysisError)
      
      // Return fallback response instead of error
      const fallbackResult = {
        url: project.websiteURL,
        totalWords: 0,
        keywords: [],
        recommendations: [
          'Unable to analyze webpage content - check URL accessibility',
          'Ensure website allows automated requests',
          'Try again later or contact support'
        ],
        score: 0
      }
      
      return NextResponse.json({
        success: true,
        data: fallbackResult,
        message: 'Analysis completed with fallback data due to accessibility issues',
        isFallback: true
      })
    }

  } catch (error) {
    console.error('Keyword density analyzer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}