import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { trackUsage } from '@/lib/limit-middleware'
import connectDB from '@/lib/mongodb'
import SeoToolUsage from '@/models/SeoToolUsage'
import { logActivity } from '@/lib/activity-logger'
import mongoose from 'mongoose'
import { 
  analyzeMetaTags, 
  analyzePageSpeed, 
  analyzeKeywordDensity, 
  analyzeBrokenLinks, 
  analyzeMobileFriendly,
  analyzeKeywordResearch,
  analyzeSitemapRobots,
  analyzeBacklinks,
  analyzeKeywordTracking,
  analyzeCompetitors,
  analyzeTechnicalSEO,
  analyzeSchemaValidation,
  analyzeAltText,
  analyzeCanonical
} from '@/lib/seo-analysis'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { toolId, url, projectId } = body

    if (!toolId || !url) {
      return NextResponse.json(
        { error: 'Tool ID and URL are required' },
        { status: 400 }
      )
    }

    // Check if user can use SEO tools
    console.log('Checking SEO tools limit for user:', session.user.id)
    const canUse = await trackUsage(session.user.id, 'seoTools', 1)
    console.log('Can use SEO tools result:', canUse)
    
    if (!canUse) {
      console.log('SEO tools limit exceeded for user:', session.user.id)
      return NextResponse.json(
        { 
          error: 'SEO tools limit exceeded',
          limitType: 'seoTools',
          message: 'You have reached your SEO tools limit. Please upgrade your plan to continue.'
        },
        { status: 403 }
      )
    }

    await connectDB()

    // Get tool name from toolId
    const toolName = getToolName(toolId)
    
    // Generate real analysis results
    const analysisResults = await getRealAnalysisForTool(toolId, url)
    
    // Save usage to database
    const userId = new mongoose.Types.ObjectId(session.user.id)
    const projectObjectId = projectId ? new mongoose.Types.ObjectId(projectId) : null
    
    const seoToolUsage = new SeoToolUsage({
      userId: userId,
      projectId: projectObjectId,
      toolId: toolId,
      toolName: toolName,
      url: url,
      results: {
        score: analysisResults.score || analysisResults.overallScore || 0,
        issues: analysisResults.issues?.length || 0,
        recommendations: analysisResults.recommendations?.length || 0,
        data: analysisResults
      }
    })
    
    await seoToolUsage.save()

    // Log SEO tool usage activity
    await logActivity({
      userId: session.user.id,
      userEmail: session.user.email || 'unknown',
      userName: session.user.name || session.user.username || 'unknown',
      action: 'seo_tool_used',
      resource: 'seo_tool',
      resourceId: seoToolUsage._id.toString(),
      details: {
        metadata: {
          toolId: toolId,
          toolName: toolName,
          url: url,
          projectId: projectId || null,
          score: analysisResults.score || analysisResults.overallScore || 0,
          issuesFound: analysisResults.issues?.length || 0
        }
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      results: analysisResults,
      toolId,
      url,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('SEO tool analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getToolName(toolId: string): string {
  const toolNames: Record<string, string> = {
    'meta-tag-analyzer': 'Meta Tag Analyzer',
    'keyword-density-checker': 'Keyword Density Checker',
    'page-speed-analyzer': 'Page Speed Analyzer',
    'keyword-researcher': 'Keyword Researcher',
    'broken-link-scanner': 'Broken Link Scanner',
    'sitemap-robots-checker': 'Sitemap & Robots Checker',
    'backlink-scanner': 'Backlink Scanner',
    'keyword-tracker': 'Keyword Tracker',
    'mobile-checker': 'Mobile Checker',
    'competitor-analyzer': 'Competitor Analyzer',
    'technical-seo-auditor': 'Technical SEO Auditor',
    'schema-validator': 'Schema Validator',
    'alt-text-checker': 'Alt Text Checker',
    'canonical-checker': 'Canonical Checker'
  }
  
  return toolNames[toolId] || toolId
}

async function getRealAnalysisForTool(toolId: string, url: string) {
  try {
    switch (toolId) {
      case 'meta-tag-analyzer':
        return await analyzeMetaTags(url)

      case 'keyword-density-checker':
        return await analyzeKeywordDensity(url)

      case 'page-speed-analyzer':
        return await analyzePageSpeed(url)

      case 'broken-link-scanner':
        return await analyzeBrokenLinks(url)

      case 'mobile-checker':
        return await analyzeMobileFriendly(url)

      case 'keyword-researcher':
        return await analyzeKeywordResearch(url)

      case 'sitemap-robots-checker':
        return await analyzeSitemapRobots(url)

      case 'backlink-scanner':
        return await analyzeBacklinks(url)

      case 'keyword-tracker':
        return await analyzeKeywordTracking(url)

      case 'competitor-analyzer':
        return await analyzeCompetitors(url)

      case 'technical-seo-auditor':
        return await analyzeTechnicalSEO(url)

      case 'schema-validator':
        return await analyzeSchemaValidation(url)

      case 'alt-text-checker':
        return await analyzeAltText(url)

      case 'canonical-checker':
        return await analyzeCanonical(url)

      default:
        throw new Error(`Analysis not available for tool: ${toolId}`)
    }
  } catch (error) {
    console.error(`Error analyzing ${toolId} for ${url}:`, error)
    throw new Error(`Failed to analyze ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
