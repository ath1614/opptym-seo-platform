import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { SeoToolUsage } from '@/models/SeoToolUsage'
import { analyzeMetaTags } from '@/lib/seo-analysis'
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

    // Run meta tag analysis
    const analysisResult = await analyzeMetaTags(project.websiteURL)
    
    // Save usage to database
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

  } catch (error) {
    console.error('Meta tag analyzer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}