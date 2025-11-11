import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { analyzeKeywordTracking } from '@/lib/seo-analysis'
import { trackUsage } from '@/lib/limit-middleware'
// mongoose import not required when using Project.findById with string id

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

    // Resolve website URL from full Project model
    const { default: Project } = await import('@/models/Project')
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    const websiteURL: string | null = project.websiteURL

    // Check if tool is enabled
    const { checkSeoToolAccess } = await import('@/lib/seo-tool-middleware')
    const accessCheck = await checkSeoToolAccess('keyword-tracker')
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
      // Prepare project data for keyword tracking
    const projectKeywordData = {
      keywords: (project.keywords || []).filter((k: any) => k && typeof k === 'string'),
      targetKeywords: (project.targetKeywords || []).filter((k: any) => k && typeof k === 'string'),
      seoKeywords: project.seoMetadata?.keywords && typeof project.seoMetadata.keywords === 'string' ? [project.seoMetadata.keywords] : [],
      businessDescription: project.businessDescription || project.projectDescription || ''
    }
    
    // Run keyword tracking analysis with project data
    const analysisResult = await analyzeKeywordTracking(websiteURL, projectKeywordData)
      
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
      
      // Return fallback response
      const fallbackResult = {
        url: websiteURL,
        trackedKeywords: [],
        rankingChanges: { improved: 0, declined: 0, new: 0, lost: 0 },
        recommendations: [
          'Unable to track keywords - check URL accessibility',
          'Add target keywords to your project for better tracking',
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
