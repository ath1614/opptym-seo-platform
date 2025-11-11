import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { analyzeMetaTags } from '@/lib/seo-analysis'
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
    const accessCheck = await checkSeoToolAccess('meta-tag-analyzer')
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
      // Run meta tag analysis
      const analysisResult = await analyzeMetaTags(project.websiteURL)
      
      // Only save usage to database AFTER successful analysis
      const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
      const seoToolUsage = new SeoToolUsage({
        userId: session.user.id,
        projectId: projectId,
        toolId: 'meta-tag-analyzer',
        toolName: 'Meta Tag Analyzer',
        url: project.websiteURL,
        results: analysisResult,
        createdAt: new Date()
      })

      await seoToolUsage.save()

      return NextResponse.json({
        success: true,
        data: analysisResult,
        message: 'Meta tag analysis completed successfully'
      })
    } catch (analysisError) {
      console.error('Meta tag analysis failed:', analysisError)
      
      // Return fallback response
      const fallbackResult = {
        url: project.websiteURL,
        title: { content: 'Analysis unavailable', length: 0, status: 'error' as const, recommendation: 'Unable to analyze - check URL accessibility' },
        description: { content: 'Analysis unavailable', length: 0, status: 'error' as const, recommendation: 'Unable to analyze - check URL accessibility' },
        keywords: { content: '', status: 'good' as const, recommendation: 'Meta keywords not recommended' },
        viewport: { content: '', status: 'error' as const, recommendation: 'Unable to check viewport' },
        robots: { content: '', status: 'error' as const, recommendation: 'Unable to check robots meta tag' },
        openGraph: { title: '', description: '', image: '', url: project.websiteURL, status: 'error' as const, recommendation: 'Unable to check Open Graph tags' },
        twitter: { card: '', title: '', description: '', image: '', status: 'error' as const, recommendation: 'Unable to check Twitter Card tags' },
        canonical: { content: '', status: 'error' as const, recommendation: 'Unable to check canonical URL' },
        hreflang: { content: '', status: 'good' as const, recommendation: 'Hreflang is optional' },
        score: 0,
        issues: [{ type: 'error' as const, message: 'Unable to fetch webpage for analysis', severity: 'high' as const }],
        recommendations: ['Check URL accessibility', 'Ensure website is online', 'Try again later']
      }
      
      return NextResponse.json({
        success: true,
        data: fallbackResult,
        message: 'Analysis completed with fallback data due to accessibility issues',
        isFallback: true
      })
    }

  } catch (error) {
    console.error('Meta tag analyzer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}