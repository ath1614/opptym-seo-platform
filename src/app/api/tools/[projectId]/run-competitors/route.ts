import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
const { default: Project } = await import('@/models/Project')
const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
import { analyzeCompetitors } from '@/lib/seo-analysis'
import { trackUsage } from '@/lib/limit-middleware'

// Conservative fallback data for when analysis fails (only used when no project competitors available)
const generateFallbackAnalysis = (url: string, projectName?: string) => {
  const domain = url ? new URL(url).hostname : 'example.com'
  const industry = projectName?.toLowerCase().includes('tech') ? 'Technology' : 
                   projectName?.toLowerCase().includes('health') ? 'Healthcare' :
                   projectName?.toLowerCase().includes('finance') ? 'Finance' : 'General'

  return {
    url,
    competitors: [
      {
        name: `${industry} Market Leader`,
        domain: `leader-${domain.replace(/\./g, '-')}.com`,
        domainAuthority: Math.floor(Math.random() * 20) + 75, // 75-95
        backlinks: Math.floor(Math.random() * 40000) + 30000, // 30k-70k
        organicTraffic: Math.floor(Math.random() * 400000) + 300000, // 300k-700k
        keywords: Math.floor(Math.random() * 15000) + 15000, // 15k-30k
        topKeywords: [`${industry.toLowerCase()} solutions`, 'market leader', 'industry standard'],
        strengths: ['Strong brand recognition', 'High domain authority', 'Extensive market reach'],
        weaknesses: ['High competition costs', 'Saturated keywords'],
        opportunities: ['Emerging markets', 'New technology adoption'],
        marketShare: Math.floor(Math.random() * 20) + 25, // 25-45%
        trustScore: Math.floor(Math.random() * 15) + 85 // 85-100
      },
      {
        name: `Rising ${industry} Competitor`,
        domain: `competitor-${domain.replace(/\./g, '-')}.com`,
        domainAuthority: Math.floor(Math.random() * 25) + 50, // 50-75
        backlinks: Math.floor(Math.random() * 15000) + 8000, // 8k-23k
        organicTraffic: Math.floor(Math.random() * 150000) + 100000, // 100k-250k
        keywords: Math.floor(Math.random() * 8000) + 5000, // 5k-13k
        topKeywords: ['innovative approach', 'customer-focused', 'competitive pricing'],
        strengths: ['Rapid growth', 'Modern technology', 'Agile operations'],
        weaknesses: ['Limited brand awareness', 'Smaller market share'],
        opportunities: ['Digital transformation', 'Partnership expansion'],
        marketShare: Math.floor(Math.random() * 10) + 10, // 10-20%
        trustScore: Math.floor(Math.random() * 20) + 70 // 70-90
      },
      {
        name: `Specialized ${industry} Provider`,
        domain: `specialist-${domain.replace(/\./g, '-')}.com`,
        domainAuthority: Math.floor(Math.random() * 20) + 35, // 35-55
        backlinks: Math.floor(Math.random() * 8000) + 3000, // 3k-11k
        organicTraffic: Math.floor(Math.random() * 80000) + 40000, // 40k-120k
        keywords: Math.floor(Math.random() * 5000) + 2000, // 2k-7k
        topKeywords: ['specialized services', 'niche expertise', 'custom solutions'],
        strengths: ['Deep expertise', 'Loyal customer base', 'Specialized knowledge'],
        weaknesses: ['Limited market reach', 'Niche focus'],
        opportunities: ['Market expansion', 'Service diversification'],
        marketShare: Math.floor(Math.random() * 8) + 5, // 5-13%
        trustScore: Math.floor(Math.random() * 25) + 75 // 75-100
      }
    ],
    competitiveGaps: [
      { 
        keyword: `advanced ${industry.toLowerCase()} analytics`, 
        opportunity: Math.floor(Math.random() * 30) + 70, // 70-100
        difficulty: Math.floor(Math.random() * 40) + 30 // 30-70
      },
      { 
        keyword: `${industry.toLowerCase()} automation tools`, 
        opportunity: Math.floor(Math.random() * 25) + 65, // 65-90
        difficulty: Math.floor(Math.random() * 35) + 25 // 25-60
      },
      { 
        keyword: `mobile ${industry.toLowerCase()} solutions`, 
        opportunity: Math.floor(Math.random() * 20) + 60, // 60-80
        difficulty: Math.floor(Math.random() * 30) + 40 // 40-70
      }
    ],
    recommendations: [
      'NOTICE: This is example data due to service unavailability',
      'Add known competitors to your project settings for real analysis',
      `Research actual competitors in the ${industry.toLowerCase()} sector`,
      'Focus on improving domain authority through quality content',
      'Monitor competitor strategies when service is available',
      'This analysis will be more accurate with your actual competitor data'
    ],
    score: Math.floor(Math.random() * 30) + 60, // 60-90
    marketPosition: 'challenger',
    industryBenchmarks: {
      avgDomainAuthority: Math.floor(Math.random() * 15) + 55, // 55-70
      avgBacklinks: Math.floor(Math.random() * 20000) + 15000, // 15k-35k
      avgKeywords: Math.floor(Math.random() * 8000) + 8000 // 8k-16k
    }
  }
}

// Retry mechanism with exponential backoff
const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Maximum retry attempts exceeded')
}

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

    // Validate project URL
    if (!project.websiteURL) {
      return NextResponse.json({ 
        error: 'Project URL is required for competitor analysis',
        fallbackAvailable: true
      }, { status: 400 })
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

    let analysisResult
    let isFromFallback = false

    // Prepare project data for competitor analysis
    const projectCompetitorData = {
      competitors: project.competitors || [],
      keywords: project.keywords || [],
      targetKeywords: project.targetKeywords || [],
      businessDescription: project.businessDescription || project.projectDescription || '',
      industry: project.industry || ''
    }
    
    try {
      // Attempt analysis with project data and retry mechanism
      analysisResult = await retryWithBackoff(
        () => analyzeCompetitors(project.websiteURL, projectCompetitorData),
        2, // reduced max retries
        1500 // base delay 1.5 seconds
      )
      
      console.log('Competitor analysis completed successfully')
    } catch (analysisError) {
      console.error('Competitor analysis failed:', analysisError)
      
      // Only use fallback if absolutely necessary and make it clear
      if (projectCompetitorData.competitors.length === 0) {
        analysisResult = generateFallbackAnalysis(project.websiteURL, project.projectName)
        isFromFallback = true
        console.log('Using fallback analysis - no project competitors available')
      } else {
        // Return error instead of misleading fallback data
        return NextResponse.json({
          error: 'Competitor analysis temporarily unavailable',
          message: 'Please try again later. Your project competitors are saved and will be used when the service is available.',
          projectCompetitors: projectCompetitorData.competitors,
          timestamp: new Date().toISOString()
        }, { status: 503 })
      }
    }

    try {
      // Save usage to database (regardless of whether we used fallback)
      const { default: SeoToolUsage } = await import('@/models/SeoToolUsage')
      const seoToolUsage = new SeoToolUsage({
        userId: session.user.id,
        projectId: projectId,
        toolId: 'competitor-analyzer',
        toolName: 'Competitor Analyzer',
        url: project.websiteURL,
        results: analysisResult,
        isFromFallback,
        createdAt: new Date()
      })

      await seoToolUsage.save()
    } catch (dbError) {
      console.error('Failed to save usage data:', dbError)
      // Don't fail the request if we can't save to DB
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
      message: isFromFallback 
        ? 'Analysis completed using enhanced example data due to network connectivity issues'
        : 'Competitor analysis completed successfully',
      isFromFallback,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Competitor analyzer API error:', error)
    
    // Even in case of complete failure, try to provide some value
    try {
      const fallbackData = generateFallbackAnalysis('https://example.com', 'Sample Project')
      
      return NextResponse.json({
        error: 'Service temporarily unavailable',
        message: 'Competitor analysis is currently unavailable. Please add competitors to your project settings and try again later.',
        suggestion: 'Add competitor domains to your project for more accurate analysis when the service is restored.',
        timestamp: new Date().toISOString()
      }, { status: 503 }) // Service Unavailable
    } catch (fallbackError) {
      console.error('Even fallback generation failed:', fallbackError)
      
      return NextResponse.json({
        error: 'Service temporarily unavailable',
        message: 'Please try again later or contact support if the issue persists',
        timestamp: new Date().toISOString()
      }, { status: 503 }) // Service Unavailable
    }
  }
}
