import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import { trackUsage } from '@/lib/limit-middleware'

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
    const { projectId, reportData } = body

    if (!projectId || !reportData) {
      return NextResponse.json(
        { error: 'Project ID and report data are required' },
        { status: 400 }
      )
    }

    // Check if user can generate reports
    const canGenerate = await trackUsage(session.user.id, 'reports', 1)
    
    if (!canGenerate) {
      return NextResponse.json(
        { 
          error: 'Reports limit exceeded',
          limitType: 'reports',
          message: 'You have reached your reports limit. Please upgrade your plan to continue.'
        },
        { status: 403 }
      )
    }

    await connectDB()
    
    // Verify project belongs to user
    const project = await Project.findOne({ 
      _id: projectId, 
      userId: session.user.id 
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Generate HTML content for PDF
    const htmlContent = generateReportHTML(reportData)
    
    // Return HTML content that can be printed as PDF
    // This is more reliable than trying to generate PDF server-side
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="seo-report-${(project.projectName || project._id || 'project').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.html"`
      }
    })

  } catch (error) {
    console.error('PDF export error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF report',
        details: errorMessage,
        fallback: 'Try using the HTML version or contact support'
      },
      { status: 500 }
    )
  }
}


function generateReportHTML(reportData: {
  project: {
    projectName?: string
    websiteURL?: string
    _id?: string
    category?: string
    status?: string
  }
  analytics: {
    totalSeoToolsUsed: number
    totalSubmissions: number
    successfulSubmissions: number
    successRate: number
  }
  seoToolsUsage: Array<{
    toolName: string
    usageCount: number
    lastUsed: string | Date
    results: Array<{ score: number } & {
      url?: string
      date?: Date | string
      issues?: number
      recommendations?: number
      analysisResults?: {
        score?: number | string
        issues?: Array<string | number | Record<string, unknown>>
        recommendations?: Array<string | number | Record<string, unknown>>
        metaTags?: { title?: string; description?: string }
        performance?: { score?: number | string }
        mobileFriendliness?: { isMobileFriendly?: boolean }
        brokenLinks?: number
        totalLinks?: number
        isMobileFriendly?: boolean
      }
    }>
    latestResult?: {
      url?: string
      date?: Date | string
      score?: number
      issues?: number
      recommendations?: number
      analysisResults?: {
        score?: number | string
        issues?: Array<string | number | Record<string, unknown>>
        recommendations?: Array<string | number | Record<string, unknown>>
        metaTags?: { title?: string; description?: string }
        performance?: { score?: number | string }
        mobileFriendliness?: { isMobileFriendly?: boolean }
        brokenLinks?: number
        totalLinks?: number
        isMobileFriendly?: boolean
      }
    } | null
  }>
  submissionsData: Array<{
    date: string
    directory: string
    status: string
    category: string
  }>
  monthlyTrend: Array<{
    month: string
    submissions: number
    seoTools: number
  }>
}) {
  const { project, analytics, seoToolsUsage, submissionsData, monthlyTrend } = reportData
  
  // Build per-tool latest details section
  const toolDetailsHTML = (seoToolsUsage || []).map((tool) => {
    const latest = tool.latestResult || (tool.results && tool.results[0]) || null
    const ar = latest?.analysisResults || {}
    const meta = ar.metaTags || {}
    const perf = ar.performance || {}
    const mobile = ar.mobileFriendliness || {}
    const brokenLinks = ar.brokenLinks ?? ar.totalBrokenLinks ?? 0
    const totalLinks = ar.totalLinks ?? undefined
    const isMobileFriendly = ar.isMobileFriendly ?? mobile.isMobileFriendly ?? undefined
    const score = latest?.score ?? ar.score ?? undefined
    const issuesCount = Array.isArray(ar.issues) ? ar.issues.length : (latest?.issues ?? 0)
    const recsCount = Array.isArray(ar.recommendations) ? ar.recommendations.length : (latest?.recommendations ?? 0)
    const lastUsedStr = (tool.lastUsed ? new Date(tool.lastUsed).toLocaleString() : 'N/A')
    
    return `
      <div class="section">
        <h2>🔧 ${tool.toolName} — Latest Result</h2>
        <div><strong>Last Used:</strong> ${lastUsedStr}</div>
        ${score !== undefined ? `<div><strong>Score:</strong> ${Math.round(Number(score))}</div>` : ''}
        <div style="margin: 12px 0;">
          <div><strong>Issues Found:</strong> ${issuesCount}</div>
          <div><strong>Recommendations:</strong> ${recsCount}</div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="label">Meta Title</div>
            <div class="value">${meta.title || '—'}</div>
          </div>
          <div class="stat-card">
            <div class="label">Meta Description</div>
            <div class="value">${meta.description || '—'}</div>
          </div>
          <div class="stat-card">
            <div class="label">Mobile Friendly</div>
            <div class="value">${isMobileFriendly === undefined ? '—' : (isMobileFriendly ? 'Yes' : 'No')}</div>
          </div>
          <div class="stat-card">
            <div class="label">Broken Links</div>
            <div class="value">${brokenLinks}${totalLinks !== undefined ? ` / ${totalLinks}` : ''}</div>
          </div>
          <div class="stat-card">
            <div class="label">Page Speed</div>
            <div class="value">${perf.score !== undefined ? Math.round(Number(perf.score)) : '—'}</div>
          </div>
        </div>
        ${Array.isArray(ar.issues) && ar.issues.length ? `
          <div style="margin-top: 12px;">
            <strong>Key Issues:</strong>
            <ul>
              ${ar.issues.slice(0,5).map((i: unknown) => `<li>• ${String(i)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${Array.isArray(ar.recommendations) && ar.recommendations.length ? `
          <div style="margin-top: 12px;">
            <strong>Recommendations:</strong>
            <ul>
              ${ar.recommendations.slice(0,5).map((r: unknown) => `<li>• ${String(r)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `
  }).join('')
  
  // Calculate additional metrics
  const totalFailedSubmissions = analytics.totalSubmissions - analytics.successfulSubmissions
  const averageScore = seoToolsUsage.length > 0 ? 
    Math.round(seoToolsUsage.reduce((sum, tool) => 
      sum + (tool.results.length > 0 ? 
        tool.results.reduce((toolSum, r) => toolSum + r.score, 0) / tool.results.length : 0
      ), 0) / seoToolsUsage.length
    ) : 0
  
  const mostUsedTool = seoToolsUsage.length > 0 ? 
    seoToolsUsage.reduce((max, tool) => tool.usageCount > max.usageCount ? tool : max) : null
  
  const recentSubmissions = submissionsData.slice(0, 10) // Last 10 submissions
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Comprehensive SEO Report - ${project.projectName || project._id || 'Project'}</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          background: #ffffff;
          font-size: 14px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 30px;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          border-radius: 10px;
          margin: -20px -20px 40px -20px;
        }
        .header h1 {
          margin: 0;
          font-size: 36px;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header .subtitle {
          font-size: 18px;
          margin: 10px 0;
          opacity: 0.9;
        }
        .header .project-info {
          font-size: 16px;
          margin: 5px 0;
          opacity: 0.8;
        }
        .section {
          margin-bottom: 40px;
          background: #f8fafc;
          padding: 30px;
          border-radius: 12px;
          border-left: 5px solid #2563eb;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 {
          color: #1e40af;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 15px;
          margin-bottom: 25px;
          font-size: 24px;
          font-weight: 600;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          transition: transform 0.2s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .stat-card.primary {
          border-color: #2563eb;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }
        .stat-card.success {
          border-color: #10b981;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        .stat-card.warning {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }
        .stat-card.danger {
          border-color: #ef4444;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        }
        .stat-label {
          font-size: 16px;
          font-weight: 500;
          opacity: 0.9;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .table th,
        .table td {
          border: 1px solid #e5e7eb;
          padding: 15px;
          text-align: left;
        }
        .table th {
          background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
          color: white;
          font-weight: 600;
          font-size: 16px;
        }
        .table tr:nth-child(even) {
          background: #f8fafc;
        }
        .table tr:hover {
          background: #e0f2fe;
        }
        .status-success {
          color: #059669;
          font-weight: 600;
          background: #d1fae5;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .status-pending {
          color: #d97706;
          font-weight: 600;
          background: #fef3c7;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .status-rejected {
          color: #dc2626;
          font-weight: 600;
          background: #fee2e2;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          background: #f8fafc;
          padding: 30px;
          border-radius: 12px;
        }
        .print-instructions {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          color: #92400e;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .print-instructions h3 {
          margin: 0 0 15px 0;
          color: #92400e;
          font-size: 18px;
          font-weight: 600;
        }
        .print-instructions p {
          margin: 8px 0;
          font-size: 15px;
        }
        .insights {
          background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
          border: 2px solid #0288d1;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
        }
        .insights h3 {
          color: #01579b;
          margin: 0 0 15px 0;
          font-size: 20px;
        }
        .insights ul {
          margin: 0;
          padding-left: 20px;
        }
        .insights li {
          margin: 8px 0;
          font-size: 15px;
          color: #01579b;
        }
        .page-break {
          page-break-before: always;
        }
        @media print {
          body { 
            margin: 0; 
            font-size: 12px;
          }
          .print-instructions { display: none; }
          .no-print { display: none; }
          .section {
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
          .header {
            margin: 0 0 20px 0;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-instructions">
        <h3>📄 How to Save as PDF</h3>
        <p><strong>Windows:</strong> Press Ctrl+P → Select "Save as PDF" → Choose destination → Save</p>
        <p><strong>Mac:</strong> Press Cmd+P → Click "PDF" dropdown → Select "Save as PDF" → Choose destination → Save</p>
        <p><strong>Tip:</strong> Enable "Background graphics" in print settings for better formatting</p>
      </div>
      
      <div class="header">
        <h1>📊 Comprehensive SEO Performance Report</h1>
        <div class="subtitle">${project.projectName || project._id || 'Project'}</div>
        <div class="project-info">🌐 Website: ${project.websiteURL || 'No website URL'}</div>
        <div class="project-info">📅 Generated: ${new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
      </div>

      <div class="section">
        <h2>📈 Executive Summary</h2>
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-value">${analytics.totalSeoToolsUsed}</div>
            <div class="stat-label">SEO Tools Used</div>
          </div>
          <div class="stat-card success">
            <div class="stat-value">${analytics.totalSubmissions}</div>
            <div class="stat-label">Total Submissions</div>
          </div>
          <div class="stat-card success">
            <div class="stat-value">${analytics.successfulSubmissions}</div>
            <div class="stat-label">Successful Submissions</div>
          </div>
          <div class="stat-card ${analytics.successRate >= 80 ? 'success' : analytics.successRate >= 60 ? 'warning' : 'danger'}">
            <div class="stat-value">${analytics.successRate}%</div>
            <div class="stat-label">Success Rate</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-value">${totalFailedSubmissions}</div>
            <div class="stat-label">Failed Submissions</div>
          </div>
          <div class="stat-card primary">
            <div class="stat-value">${averageScore}</div>
            <div class="stat-label">Average SEO Score</div>
          </div>
        </div>
      </div>

      ${toolDetailsHTML}

      <div class="insights">
        <h3>🔍 Key Insights</h3>
        <ul>
          <li><strong>Success Rate:</strong> ${analytics.successRate}% of submissions were successful</li>
          <li><strong>Most Active Tool:</strong> ${mostUsedTool ? mostUsedTool.toolName + ' (' + mostUsedTool.usageCount + ' uses)' : 'No tools used yet'}</li>
          <li><strong>Total Activity:</strong> ${analytics.totalSeoToolsUsed + analytics.totalSubmissions} total actions performed</li>
          <li><strong>Performance:</strong> ${analytics.successRate >= 80 ? 'Excellent' : analytics.successRate >= 60 ? 'Good' : 'Needs Improvement'} submission success rate</li>
        </ul>
      </div>

      <div class="section">
        <h2>🛠️ SEO Tools Usage Analysis</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Tool Name</th>
              <th>Usage Count</th>
              <th>Last Used</th>
              <th>Average Score</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            ${seoToolsUsage.length > 0 ? seoToolsUsage.map((tool) => {
              const avgScore = tool.results.length > 0 ? 
                Math.round(tool.results.reduce((sum, r) => sum + r.score, 0) / tool.results.length) : 0
              const performance = avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : avgScore >= 40 ? 'Fair' : 'Poor'
              return `
                <tr>
                  <td><strong>${tool.toolName}</strong></td>
                  <td>${tool.usageCount}</td>
                  <td>${new Date(tool.lastUsed).toLocaleDateString()}</td>
                  <td>${avgScore || 'N/A'}</td>
                  <td><span class="status-${avgScore >= 80 ? 'success' : avgScore >= 60 ? 'pending' : 'rejected'}">${performance}</span></td>
                </tr>
              `
            }).join('') : '<tr><td colspan="5" style="text-align: center; color: #6b7280; font-style: italic;">No SEO tools used yet</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>📋 Recent Submission History</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Directory</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${recentSubmissions.length > 0 ? recentSubmissions.map((submission) => `
              <tr>
                <td>${new Date(submission.date).toLocaleDateString()}</td>
                <td><strong>${submission.directory}</strong></td>
                <td>${submission.category}</td>
                <td><span class="status-${submission.status}">${submission.status.toUpperCase()}</span></td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="text-align: center; color: #6b7280; font-style: italic;">No submissions recorded yet</td></tr>'}
          </tbody>
        </table>
        ${submissionsData.length > 10 ? `<p style="text-align: center; color: #6b7280; font-style: italic;">Showing last 10 of ${submissionsData.length} total submissions</p>` : ''}
      </div>

      <div class="section">
        <h2>📊 Monthly Performance Trends</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Submissions</th>
              <th>SEO Tools Used</th>
              <th>Total Activity</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyTrend.length > 0 ? monthlyTrend.map((trend) => `
              <tr>
                <td><strong>${trend.month}</strong></td>
                <td>${trend.submissions}</td>
                <td>${trend.seoTools}</td>
                <td>${trend.submissions + trend.seoTools}</td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="text-align: center; color: #6b7280; font-style: italic;">No monthly data available yet</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>📝 Recommendations</h2>
        <div class="insights">
          <h3>🎯 Action Items</h3>
          <ul>
            ${analytics.successRate < 80 ? '<li><strong>Improve Submission Success Rate:</strong> Focus on quality submissions and directory selection</li>' : ''}
            ${seoToolsUsage.length < 3 ? '<li><strong>Expand SEO Tool Usage:</strong> Try more SEO tools to get comprehensive insights</li>' : ''}
            ${totalFailedSubmissions > 0 ? '<li><strong>Review Failed Submissions:</strong> Analyze why some submissions failed and improve process</li>' : ''}
            ${averageScore < 70 ? '<li><strong>Improve SEO Scores:</strong> Work on website optimization based on tool recommendations</li>' : ''}
            <li><strong>Regular Monitoring:</strong> Continue tracking performance monthly for better insights</li>
            <li><strong>Diversify Strategy:</strong> Explore different directories and submission categories</li>
          </ul>
        </div>
      </div>

      <div class="footer">
        <p><strong>📊 Opptym SEO Platform - Comprehensive Report</strong></p>
        <p>Report generated on ${new Date().toLocaleString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p>&copy; ${new Date().getFullYear()} Opptym. All rights reserved. | Professional SEO Management Platform</p>
      </div>
    </body>
    </html>
  `
}
