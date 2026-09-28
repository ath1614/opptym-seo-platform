import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { trackUsage } from '@/lib/limit-middleware'
import connectDB from '@/lib/mongodb'
import SeoToolUsage from '@/models/SeoToolUsage'
import mongoose from 'mongoose'

interface AnalysisResult {
  url: string
  timestamp: string
  overallScore: number
  brokenLinks: {
    total: number
    broken: number
    working: number
    redirects: number
    healthScore: number
    links: Array<{
      url: string
      status: number
      type: 'internal' | 'external'
      foundOn: string
      impact: 'high' | 'medium' | 'low'
    }>
  }
  metaTags: {
    title: {
      content: string
      length: number
      status: 'good' | 'warning' | 'error'
      recommendation: string
    }
    description: {
      content: string
      length: number
      status: 'good' | 'warning' | 'error'
      recommendation: string
    }
    keywords: {
      content: string
      status: 'good' | 'warning' | 'error'
      recommendation: string
    }
    viewport: {
      content: string
      status: 'good' | 'warning' | 'error'
      recommendation: string
    }
    robots: {
      content: string
      status: 'good' | 'warning' | 'error'
      recommendation: string
    }
    openGraph: {
      title: string
      description: string
      image: string
      url: string
      status: 'good' | 'warning' | 'error'
      recommendation: string
    }
    canonical: {
      content: string
      status: 'good' | 'warning' | 'error'
      recommendation: string
    }
  }
  altText: {
    totalImages: number
    missingAlt: number
    duplicateAlt: number
    healthScore: number
    images: Array<{
      src: string
      alt: string
      status: 'good' | 'warning' | 'error'
      recommendation: string
    }>
  }
  pageSpeed: {
    overallScore: number
    performance: {
      score: number
      status: 'good' | 'warning' | 'error'
      metrics: {
        firstContentfulPaint: number
        largestContentfulPaint: number
        firstInputDelay: number
        cumulativeLayoutShift: number
      }
    }
    accessibility: {
      score: number
      status: 'good' | 'warning' | 'error'
      issues: Array<{
        type: 'error' | 'warning' | 'info'
        message: string
        severity: 'high' | 'medium' | 'low'
      }>
    }
    bestPractices: {
      score: number
      status: 'good' | 'warning' | 'error'
      issues: Array<{
        type: 'error' | 'warning' | 'info'
        message: string
        severity: 'high' | 'medium' | 'low'
      }>
    }
    seo: {
      score: number
      status: 'good' | 'warning' | 'error'
      issues: Array<{
        type: 'error' | 'warning' | 'info'
        message: string
        severity: 'high' | 'medium' | 'low'
      }>
    }
  }
  recommendations: Array<{
    category: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: string
  }>
}

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
    const { url, toolType, selectedTools } = body

    if (!url || !toolType) {
      return NextResponse.json(
        { error: 'URL and tool type are required' },
        { status: 400 }
      )
    }

    // Check if user can use SEO tools
    const canUse = await trackUsage(session.user.id, 'seoTools', 1)

    if (!canUse?.success) {
      return NextResponse.json(
        {
          error: 'SEO tools limit exceeded',
          limitType: 'seoTools',
          currentUsage: canUse?.currentUsage,
          limit: canUse?.limit,
          message: canUse?.message || 'You have reached your SEO tools limit. Please upgrade your plan to continue.'
        },
        { status: 403 }
      )
    }

    // Perform real SEO analysis
    const analysisResult = await performSEOAnalysis(url, toolType, selectedTools)

    // Save the analysis result
    await connectDB()

    const toolNameMap: Record<string, string> = {
      'website-analyzer': 'Website Analyzer',
      'meta-tag-checker': 'Meta Tag Checker',
      'alt-text-checker': 'Alt Text Checker',
      'canonical-checker': 'Canonical Checker',
      'broken-link-scanner': 'Broken Link Scanner',
      'technical-seo-auditor': 'Technical SEO Auditor',
      'sitemap-robots-checker': 'Sitemap & Robots Checker'
    }
    const ar = analysisResult as { overallScore?: number; brokenLinks?: { broken?: number }; recommendations?: Array<{ title?: string }> }
    const recommendations = Array.isArray(ar.recommendations)
      ? ar.recommendations.map((r) => r?.title ? r.title : '')
      : []
    const issuesCount = ar?.brokenLinks?.broken

    const seoToolUsage = new SeoToolUsage({
      userId: new mongoose.Types.ObjectId(session.user.id),
      toolId: toolType,
      toolName: toolNameMap[toolType] || toolType,
      url,
      results: {
        score: ar?.overallScore ?? 0,
        issues: typeof issuesCount === 'number' ? issuesCount : undefined,
        recommendations,
        data: analysisResult
      }
    })

    await seoToolUsage.save()

    return NextResponse.json({
      success: true,
      data: analysisResult,
      usage: {
        toolType,
        url,
        score: analysisResult.overallScore,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('SEO analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function performSEOAnalysis(url: string, toolType: string, selectedTools?: string[]): Promise<AnalysisResult> {
  try {
    // Validate URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    // Import actual analysis functions from the library
    const { analyzeMetaTags, analyzePageSpeed, analyzeBrokenLinks, analyzeAltText, analyzeCanonical } = await import('@/lib/seo-analysis');

    // Default tools if none selected
    const tools = selectedTools || ['meta-tags', 'broken-links', 'alt-text', 'page-speed', 'canonical']

    // Run analyses in parallel where possible, with fallbacks
    const results = await Promise.allSettled([
      tools.includes('meta-tags') ? analyzeMetaTags(url) : Promise.resolve(null),
      tools.includes('page-speed') ? analyzePageSpeed(url) : Promise.resolve(null),
      tools.includes('broken-links') ? analyzeBrokenLinks(url) : Promise.resolve(null),
      tools.includes('alt-text') ? analyzeAltText(url) : Promise.resolve(null),
      tools.includes('canonical') ? analyzeCanonical(url) : Promise.resolve(null)
    ]);

    const metaResult = results[0].status === 'fulfilled' ? results[0].value as any : null;
    const speedResult = results[1].status === 'fulfilled' ? results[1].value as any : null;
    const linksResult = results[2].status === 'fulfilled' ? results[2].value as any : null;
    const altResult = results[3].status === 'fulfilled' ? results[3].value as any : null;
    const canonicalResult = results[4].status === 'fulfilled' ? results[4].value as any : null;

    let overallScore = 0;
    let scoreCount = 0;

    if (metaResult) { overallScore += metaResult.score; scoreCount++; }
    if (speedResult) { overallScore += speedResult.overallScore; scoreCount++; }
    if (linksResult) { overallScore += linksResult.score; scoreCount++; }
    if (altResult) { overallScore += altResult.score; scoreCount++; }

    overallScore = scoreCount > 0 ? Math.round(overallScore / scoreCount) : 0;

    // Combine recommendations
    const recommendations: any[] = [];
    if (metaResult) recommendations.push(...metaResult.recommendations.map(r => ({ category: 'Meta Tags', priority: 'high', title: r, description: r, impact: 'High' })));
    if (speedResult) recommendations.push(...speedResult.recommendations.map(r => ({ category: 'Performance', priority: 'high', title: r, description: r, impact: 'High' })));
    if (linksResult) recommendations.push(...linksResult.recommendations.map(r => ({ category: 'Links', priority: 'medium', title: r, description: r, impact: 'Medium' })));
    if (altResult) recommendations.push(...altResult.recommendations.map(r => ({ category: 'Accessibility', priority: 'medium', title: r, description: r, impact: 'Medium' })));

    // Map back to expected interface
    return {
      url,
      timestamp: new Date().toISOString(),
      overallScore,
      brokenLinks: linksResult ? {
        total: linksResult.totalLinks,
        broken: linksResult.brokenLinks.length,
        working: linksResult.workingLinks,
        redirects: 0,
        healthScore: linksResult.score,
        links: linksResult.brokenLinks.map((l: any) => ({ url: l.url, status: l.status, type: 'external', foundOn: url, impact: 'medium' as const }))
      } : { total: 0, broken: 0, working: 0, redirects: 0, healthScore: 0, links: [] },
      metaTags: metaResult ? {
        title: metaResult.title,
        description: metaResult.description,
        keywords: metaResult.keywords,
        viewport: metaResult.viewport,
        robots: metaResult.robots,
        openGraph: metaResult.openGraph,
        canonical: metaResult.canonical
      } : {
        title: { content: '', length: 0, status: 'error', recommendation: 'Not analyzed' },
        description: { content: '', length: 0, status: 'error', recommendation: 'Not analyzed' },
        keywords: { content: '', status: 'error', recommendation: 'Not analyzed' },
        viewport: { content: '', status: 'error', recommendation: 'Not analyzed' },
        robots: { content: '', status: 'error', recommendation: 'Not analyzed' },
        openGraph: { title: '', description: '', image: '', url: '', status: 'error', recommendation: 'Not analyzed' },
        canonical: { content: '', status: 'error', recommendation: 'Not analyzed' }
      },
      altText: altResult ? {
        totalImages: altResult.totalImages,
        missingAlt: altResult.imagesWithoutAlt,
        duplicateAlt: 0,
        healthScore: altResult.score,
        images: altResult.images.map((img: any) => ({ src: img.src, alt: img.alt, status: img.status, recommendation: img.recommendation }))
      } : { totalImages: 0, missingAlt: 0, duplicateAlt: 0, healthScore: 0, images: [] },
      pageSpeed: speedResult ? {
        overallScore: speedResult.overallScore,
        performance: speedResult.performance,
        accessibility: speedResult.accessibility,
        bestPractices: speedResult.bestPractices,
        seo: speedResult.seo
      } : {
        overallScore: 0,
        performance: { score: 0, status: 'error', metrics: { firstContentfulPaint: 0, largestContentfulPaint: 0, firstInputDelay: 0, cumulativeLayoutShift: 0 } },
        accessibility: { score: 0, status: 'error', issues: [] },
        bestPractices: { score: 0, status: 'error', issues: [] },
        seo: { score: 0, status: 'error', issues: [] }
      },
      recommendations: recommendations.slice(0, 10) // Limit to top 10
    }

  } catch (error) {
    console.error('Analysis error:', error)
    // Return a basic analysis with error information
    return {
      url,
      timestamp: new Date().toISOString(),
      overallScore: 0,
      brokenLinks: { total: 0, broken: 0, working: 0, redirects: 0, healthScore: 0, links: [] },
      metaTags: {
        title: { content: '', length: 0, status: 'error', recommendation: 'Unable to analyze' },
        description: { content: '', length: 0, status: 'error', recommendation: 'Unable to analyze' },
        keywords: { content: '', status: 'error', recommendation: 'Unable to analyze' },
        viewport: { content: '', status: 'error', recommendation: 'Unable to analyze' },
        robots: { content: '', status: 'error', recommendation: 'Unable to analyze' },
        openGraph: { title: '', description: '', image: '', url: '', status: 'error', recommendation: 'Unable to analyze' },
        canonical: { content: '', status: 'error', recommendation: 'Unable to analyze' }
      },
      altText: { totalImages: 0, missingAlt: 0, duplicateAlt: 0, healthScore: 0, images: [] },
      pageSpeed: {
        overallScore: 0,
        performance: { score: 0, status: 'error', metrics: { firstContentfulPaint: 0, largestContentfulPaint: 0, firstInputDelay: 0, cumulativeLayoutShift: 0 } },
        accessibility: { score: 0, status: 'error', issues: [] },
        bestPractices: { score: 0, status: 'error', issues: [] },
        seo: { score: 0, status: 'error', issues: [] }
      },
      recommendations: [{ category: 'Error', priority: 'high', title: 'URL Analysis Failed', description: 'Unable to analyze the provided URL. Please check if the URL is accessible and try again.', impact: 'High - Analysis cannot be completed' }]
    }
  }
}
