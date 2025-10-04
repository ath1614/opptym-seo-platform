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
    
    // Handle optional request body
    let seedKeyword: string | undefined
    try {
      const body = await request.text()
      if (body.trim()) {
        const jsonBody = JSON.parse(body)
        seedKeyword = jsonBody.seedKeyword
      }
    } catch (error) {
      // If no body or invalid JSON, seedKeyword remains undefined
      console.log('No request body or invalid JSON, proceeding without seed keyword')
    }
    
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
       console.log(`🔍 Starting keyword research analysis for ${project.websiteURL}`)
       const analysisResult = await analyzeKeywordResearch(project.websiteURL)
       
       // Add seed keyword to results if provided
       if (seedKeyword) {
         analysisResult.seedKeyword = seedKeyword
         console.log(`📝 Added seed keyword: ${seedKeyword}`)
       }
       
       console.log(`✅ Keyword research analysis completed for ${project.websiteURL}`)
       
       // Always save results to database (even if it's fallback data)
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

       // Check if this is fallback data and adjust the response accordingly
       const isFallbackData = analysisResult.recommendations?.some(rec => 
         rec.includes('Unable to analyze website content') || rec.includes('fallback')
       ) || false

       return NextResponse.json({
         success: true,
         data: analysisResult,
         message: isFallbackData 
           ? 'Analysis completed with sample data. The website may be blocking automated requests or temporarily unavailable.'
           : 'Keyword research analysis completed successfully',
         isFallback: isFallbackData
       })
     } catch (analysisError) {
       console.error('❌ Keyword research analysis failed completely:', analysisError)
       
       // Even if analysis fails completely, try to provide fallback data
       try {
         const { getFallbackKeywordAnalysis } = await import('@/lib/seo-analysis')
         const fallbackResult = getFallbackKeywordAnalysis(project.websiteURL)
         
         if (seedKeyword) {
           fallbackResult.seedKeyword = seedKeyword
         }
         
         console.log(`🔄 Using fallback keyword analysis data`)
         
         // Save fallback results
         const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
         const seoToolUsage = new SeoToolUsage({
           userId: session.user.id,
           projectId: projectId,
           toolId: 'keyword-research',
           toolName: 'Keyword Research',
           url: project.websiteURL,
           results: fallbackResult,
           createdAt: new Date()
         })

         await seoToolUsage.save()
         
         return NextResponse.json({
           success: true,
           data: fallbackResult,
           message: 'Analysis completed with sample data due to website accessibility issues. Please verify your website URL and try again later.',
           isFallback: true,
           warning: 'This analysis uses sample data because the website could not be accessed.'
         })
       } catch (fallbackError) {
         console.error('❌ Even fallback analysis failed:', fallbackError)
         
         const errorMessage = analysisError instanceof Error ? analysisError.message : 'Unknown analysis error'
         
         return NextResponse.json(
           { 
             error: 'Keyword research analysis failed',
             message: 'Unable to analyze the website or provide fallback data. Please check your website URL and try again.',
             details: errorMessage,
             success: false,
             suggestions: [
               'Verify that your website URL is correct and accessible',
               'Check if your website is blocking automated requests',
               'Try again in a few minutes as this might be a temporary issue',
               'Contact support if the problem persists'
             ]
           },
           { status: 500 }
         )
       }
     }

  } catch (error) {
    console.error('Keyword research error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
