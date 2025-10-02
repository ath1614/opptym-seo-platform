import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'
import SeoToolUsage from '@/models/SeoToolUsage'
import Submission from '@/models/Submission'
import mongoose from 'mongoose'
import { 
  analyzeMetaTags, 
  analyzePageSpeed, 
  analyzeMobileFriendly, 
  analyzeCompetitors,
  analyzeTechnicalSEO,
  analyzeBacklinks
} from '@/lib/seo-analysis'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    
    const { projectId } = await params
    
    const userId = new mongoose.Types.ObjectId(session.user.id)
    const projectObjectId = new mongoose.Types.ObjectId(projectId)
    
    // Verify project belongs to user
    const project = await Project.findOne({ 
      _id: projectObjectId, 
      userId: userId 
    }).select('-__v')

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get user data for plan information
    const user = await User.findById(userId).select('plan usage')
    
    // Get real SEO tool usage data
    const seoToolUsages = await SeoToolUsage.find({ 
      userId: userId, 
      projectId: projectObjectId 
    }).sort({ createdAt: -1 })
    
    // Get real submission data
    const submissions = await Submission.find({ 
      userId: userId, 
      projectId: projectObjectId 
    }).sort({ submittedAt: -1 })
    
    // Process real SEO tool usage data
    const seoToolsUsageMap = new Map()
    
    seoToolUsages.forEach(usage => {
      const key = usage.toolId
      if (!seoToolsUsageMap.has(key)) {
        seoToolsUsageMap.set(key, {
          toolId: usage.toolId,
          toolName: usage.toolName,
          usageCount: 0,
          lastUsed: usage.createdAt || new Date(),
          results: [],
          latestResult: null as any
        })
      }
      
      const toolData = seoToolsUsageMap.get(key)
      toolData.usageCount++
      if (usage.createdAt && usage.createdAt > toolData.lastUsed) {
        toolData.lastUsed = usage.createdAt
      }
      // Extract real data from analysisResults
      const analysisResults = usage.analysisResults || {} as Record<string, unknown> // Use Record type for stored analysis results
      const score = analysisResults.score || 0
      const issues = Array.isArray(analysisResults.issues) ? analysisResults.issues.length : 0
      const recommendations = Array.isArray(analysisResults.recommendations) ? analysisResults.recommendations.length : 0
      
      const resultEntry = {
        url: usage.url,
        date: usage.createdAt || new Date(),
        score: score,
        issues: issues,
        recommendations: recommendations,
        analysisResults: analysisResults // Include full analysis results for detailed display
      }

      toolData.results.push(resultEntry)

      // Track latest result per tool by createdAt
      if (!toolData.latestResult) {
        toolData.latestResult = resultEntry
      } else {
        const currentLatest = toolData.latestResult.date instanceof Date 
          ? toolData.latestResult.date.getTime() 
          : new Date(toolData.latestResult.date as any).getTime()
        const candidate = (resultEntry.date instanceof Date ? resultEntry.date : new Date(resultEntry.date as any)).getTime()
        if (candidate > currentLatest) {
          toolData.latestResult = resultEntry
        }
      }
    })
    
    const seoToolsUsage = Array.from(seoToolsUsageMap.values()).map(tool => {
      // Ensure lastUsed is the latest date and normalize types
      const sorted = [...tool.results].sort((a, b) => {
        const ta = (a.date instanceof Date ? a.date : new Date(a.date as any)).getTime()
        const tb = (b.date instanceof Date ? b.date : new Date(b.date as any)).getTime()
        return tb - ta
      })
      const latest = tool.latestResult || sorted[0] || null
      return {
        toolId: tool.toolId,
        toolName: tool.toolName,
        usageCount: tool.usageCount,
        lastUsed: tool.lastUsed,
        results: tool.results,
        latestResult: latest
      }
    })
    
    // Process real submission data
    const submissionsData = submissions.map(submission => ({
      date: submission.submittedAt || new Date(),
      directory: submission.directory,
      status: submission.status,
      category: submission.category
    }))

    // Calculate analytics
    const totalSeoToolsUsed = seoToolsUsage.reduce((sum, tool) => sum + tool.usageCount, 0)
    const totalSubmissions = submissionsData.length
    const successfulSubmissions = submissionsData.filter(s => s.status === 'success').length
    const submissionSuccessRate = totalSubmissions > 0 ? (successfulSubmissions / totalSubmissions) * 100 : 0
    
    // Calculate SEO Health Score based on actual SEO tool results
    let seoHealthScore = 100 // Start with perfect score
    let totalSeoAnalyses = 0
    
    seoToolUsages.forEach(usage => {
      const analysisResults = usage.analysisResults || {} as Record<string, unknown>
      totalSeoAnalyses++
      
      // Deduct points for issues found
      if (analysisResults.issues && Array.isArray(analysisResults.issues)) {
        seoHealthScore -= Math.min(analysisResults.issues.length * 5, 20) // Max 20 points deduction per tool
      }
      
      // Deduct points for low scores
      if (analysisResults.score !== undefined) {
        const score = parseInt(analysisResults.score) || 0
        if (score < 80) {
          seoHealthScore -= (80 - score) * 0.5 // Deduct 0.5 points for each point below 80
        }
      }
      
      // Deduct points for specific issues
      if (analysisResults.brokenLinks > 0) {
        seoHealthScore -= Math.min(analysisResults.brokenLinks * 2, 15) // Max 15 points for broken links
      }
      
      if (analysisResults.isMobileFriendly === false) {
        seoHealthScore -= 10 // 10 points for not mobile friendly
      }
      
      if (analysisResults.metaTags && !analysisResults.metaTags.title) {
        seoHealthScore -= 5 // 5 points for missing title
      }
      
      if (analysisResults.metaTags && !analysisResults.metaTags.description) {
        seoHealthScore -= 5 // 5 points for missing description
      }
    })
    
    // Ensure score doesn't go below 0
    seoHealthScore = Math.max(0, seoHealthScore)
    
    // Use SEO health score as the main success rate for the report
    const successRate = totalSeoAnalyses > 0 ? seoHealthScore : submissionSuccessRate

    // Category breakdown
    const categoryBreakdown = submissionsData.reduce((acc, submission) => {
      acc[submission.category] = (acc[submission.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Status breakdown
    const statusBreakdown = submissionsData.reduce((acc, submission) => {
      acc[submission.status] = (acc[submission.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate monthly trend data from real data
    const monthlyTrendMap = new Map()
    
    // Process submissions by month
    submissions.forEach(submission => {
      // Skip if submittedAt is undefined or null
      if (!submission.submittedAt) {
        console.warn('Submission record missing submittedAt:', submission._id)
        return
      }
      
      const monthKey = submission.submittedAt.toISOString().substring(0, 7) // YYYY-MM
      const monthName = submission.submittedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      
      if (!monthlyTrendMap.has(monthKey)) {
        monthlyTrendMap.set(monthKey, {
          month: monthName,
          submissions: 0,
          seoTools: 0
        })
      }
      
      monthlyTrendMap.get(monthKey).submissions++
    })
    
    // Process SEO tool usage by month
    seoToolUsages.forEach(usage => {
      // Skip if createdAt is undefined or null
      if (!usage.createdAt) {
        console.warn('SeoToolUsage record missing createdAt:', usage._id)
        return
      }
      
      const monthKey = usage.createdAt.toISOString().substring(0, 7) // YYYY-MM
      const monthName = usage.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      
      if (!monthlyTrendMap.has(monthKey)) {
        monthlyTrendMap.set(monthKey, {
          month: monthName,
          submissions: 0,
          seoTools: 0
        })
      }
      
      monthlyTrendMap.get(monthKey).seoTools++
    })
    
    // Convert to array and sort by month
    const monthlyTrend = Array.from(monthlyTrendMap.values())
      .sort((a, b) => {
        const dateA = new Date(a.month + ' 01')
        const dateB = new Date(b.month + ' 01')
        return dateA.getTime() - dateB.getTime()
      })
      .slice(-6) // Show last 6 months

    // Generate comprehensive SEO analysis if website URL is available
    let comprehensiveSeoAnalysis = null
    if (project.websiteURL) {
      try {
        comprehensiveSeoAnalysis = {
          metaTags: await analyzeMetaTags(project.websiteURL),
          performance: await analyzePageSpeed(project.websiteURL),
          mobileFriendliness: await analyzeMobileFriendly(project.websiteURL),
          technicalSEO: await analyzeTechnicalSEO(project.websiteURL),
          backlinks: await analyzeBacklinks(project.websiteURL),
          competitors: await analyzeCompetitors(project.websiteURL)
        }
      } catch (analysisError) {
        console.error('SEO analysis error:', analysisError)
        // Continue without comprehensive analysis if it fails
      }
    }

    const reportData = {
      project: {
        id: project._id,
        projectName: project.projectName,
        name: project.projectName, // Keep both for compatibility
        websiteURL: project.websiteURL,
        category: project.category,
        status: project.status,
        createdAt: project.createdAt || new Date(),
        updatedAt: project.updatedAt || new Date()
      },
      user: {
        plan: user?.plan || 'free',
        usage: user?.usage || {}
      },
      analytics: {
        totalSeoToolsUsed,
        totalSubmissions,
        successfulSubmissions,
        successRate: Math.round(successRate * 100) / 100,
        categoryBreakdown,
        statusBreakdown
      },
      seoToolsUsage,
      submissionsData,
      monthlyTrend,
      comprehensiveSeoAnalysis,
      generatedAt: new Date()
    }

    return NextResponse.json({ reportData })
  } catch (error) {
    console.error('Get project report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
