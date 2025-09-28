import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { analyzeKeywordTracking, analyzeKeywordResearch } from '@/lib/seo-analysis'
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
    const { seedKeyword } = await request.json()
    
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

    // Perform keyword research analysis
    try {
       console.log(`🔍 Starting keyword research for project: ${projectId}, URL: ${project.websiteURL}`)
       
       // Validate website URL
       if (!project.websiteURL) {
         console.log('⚠️ No website URL found for project')
         return NextResponse.json(
           { 
             error: 'No website URL found for this project',
             message: 'Please add a website URL to your project settings to use keyword research'
           },
           { status: 400 }
         )
       }

       // Run keyword research analysis
       const analysisResult = await analyzeKeywordResearch(project.websiteURL)
       
       // Add seed keyword to results if provided
       if (seedKeyword) {
         analysisResult.seedKeyword = seedKeyword
         console.log(`📝 Added seed keyword: ${seedKeyword}`)
       }
       
       console.log(`✅ Keyword research analysis completed successfully for ${project.websiteURL}`)
       
       // Only save usage to database AFTER successful analysis
       const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
       const seoToolUsage = new SeoToolUsage({
         userId: session.user.id,
         projectId: projectId,
         toolId: 'keyword-research',
         toolName: 'Keyword Research',
         url: project.websiteURL,
         results: analysisResult,
         createdAt: new Date()
       })

       await seoToolUsage.save()
       console.log(`💾 Saved keyword research results to database`)

       return NextResponse.json({
         success: true,
         data: analysisResult,
         message: 'Keyword research analysis completed successfully'
       })
     } catch (analysisError) {
       console.error('❌ Keyword research analysis failed:', analysisError)
       
       // Return a more user-friendly error response
       const errorMessage = analysisError instanceof Error ? analysisError.message : 'Unknown analysis error'
       
       return NextResponse.json(
         { 
           error: 'Keyword research analysis failed',
           message: 'Unable to analyze the website. This could be due to network issues or website accessibility problems.',
           details: errorMessage,
           success: false
         },
         { status: 500 }
       )
     }

  } catch (error) {
    console.error('Keyword researcher error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
