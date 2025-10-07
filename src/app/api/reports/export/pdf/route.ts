import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
// Removed usage increment on export; generation route now tracks usage
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const userId = typeof session?.user?.id === 'string' ? session.user.id : undefined
    if (!userId) {
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

    // Validate report data structure
    if (!reportData || typeof reportData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid report data: report data is required' },
        { status: 400 }
      )
    }

    // Debug: Log the report data structure
    console.log('Report data received:', {
      hasProject: !!reportData.project,
      projectKeys: reportData.project ? Object.keys(reportData.project) : [],
      reportDataKeys: Object.keys(reportData)
    })

    // Do not increment usage on export; limits are enforced during report generation

    await connectDB()
    
    // Verify project belongs to user
    const project = await Project.findOne({ 
      _id: projectId, 
      userId: userId 
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Generate HTML content for PDF
    let htmlContent
    try {
      htmlContent = generateReportHTML(reportData)
    } catch (htmlError) {
      console.error('HTML generation error:', htmlError)
      throw new Error('Failed to generate HTML content for PDF')
    }
    
    // Check if Puppeteer is available
    if (!puppeteer) {
      console.error('Puppeteer is not available for PDF generation')
      return NextResponse.json(
        { error: 'PDF generation service is not available' },
        { status: 503 }
      )
    }

    // Launch Puppeteer with production-friendly settings
    let browser
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      })

      const page = await browser.newPage()
      
      // Set timeout for page operations
      page.setDefaultTimeout(30000) // 30 seconds
      
      // Set content and wait for any dynamic content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
      
      // Generate PDF with timeout
      const pdfBuffer = await Promise.race([
        page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
        )
      ]) as Buffer

      await browser.close()
      
      // Return PDF as response
      return new NextResponse(pdfBuffer as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="seo-report-${(project.projectName || project._id || 'project').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
    } catch (puppeteerError) {
      if (browser) {
        await browser.close()
      }
      throw puppeteerError
    }

  } catch (error) {
    console.error('PDF export error:', error)
    
    // Handle error with proper type checking
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorName = error instanceof Error ? error.name : 'Error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF report',
        details: errorMessage,
        type: errorName
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
    companyName?: string
    email?: string
    phone?: string
    whatsapp?: string
    establishedYear?: string | number
    keywords?: string[]
    businessDescription?: string
    address?: {
      building?: string
      addressLine1?: string
      addressLine2?: string
      addressLine3?: string
      district?: string
      city?: string
      state?: string
      country?: string
      pincode?: string
    }
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
        issues?: Array<unknown>
        recommendations?: Array<unknown>
        metaTags?: { title?: string; description?: string }
        performance?: { score?: number | string }
        mobileFriendliness?: { isMobileFriendly?: boolean }
        brokenLinks?: number
        totalBrokenLinks?: number
        totalLinks?: number
        isMobileFriendly?: boolean
        // keyword density
        totalWords?: number
        keywords?: Array<{
          keyword?: string
          term?: string
          count?: number
          frequency?: number
          density?: number
          percentage?: number
          status?: string
        }>
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
        issues?: Array<unknown>
        recommendations?: Array<unknown>
        metaTags?: { title?: string; description?: string }
        performance?: { score?: number | string }
        mobileFriendliness?: { isMobileFriendly?: boolean }
        brokenLinks?: number
        totalBrokenLinks?: number
        totalLinks?: number
        isMobileFriendly?: boolean
        // keyword density
        totalWords?: number
        keywords?: Array<{
          keyword?: string
          term?: string
          count?: number
          frequency?: number
          density?: number
          percentage?: number
          status?: string
        }>
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
  
  // Build per-tool latest details section using latestResult when available, with tool-specific cards
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
    const issues = Array.isArray(ar.issues) ? ar.issues : []
    const recommendations = Array.isArray(ar.recommendations) ? ar.recommendations : []
    const lastUsedStr = (tool.lastUsed ? new Date(tool.lastUsed).toLocaleString() : 'N/A')
    type AnalysisKeyword = {
      keyword?: string
      term?: string
      count?: number
      frequency?: number
      density?: number
      percentage?: number
      status?: string
    }

    const keywordItems: AnalysisKeyword[] = Array.isArray(ar?.keywords) ? ar.keywords as AnalysisKeyword[] : []
    const totalWords = typeof ar?.totalWords === 'number' ? ar.totalWords : undefined

    const perfScore = perf?.score !== undefined ? Number(perf.score as number | string) : undefined
    const positives: string[] = []
    if (typeof meta?.title === 'string' && meta.title.trim()) positives.push('Title tag present')
    if (typeof meta?.description === 'string' && meta.description.trim()) positives.push('Meta description present')
    if (isMobileFriendly === true) positives.push('Page is mobile-friendly')
    if (typeof perfScore === 'number' && !Number.isNaN(perfScore) && perfScore >= 80) positives.push('Strong performance score (80+)')
    if (typeof brokenLinks === 'number') {
      if (brokenLinks === 0) positives.push('No broken links detected')
      else if (brokenLinks <= 2) positives.push('Low broken links count')
    }

    // Build tool-specific cards to avoid irrelevant blanks
    const toolNameLower = (tool.toolName || '').toLowerCase()
    const cards: string[] = []
    if (toolNameLower.includes('meta') || toolNameLower.includes('tag')) {
      cards.push(`
        <div><strong>Meta Title:</strong> ${meta.title || '—'}</div>
        <div><strong>Meta Description:</strong> ${meta.description || '—'}</div>
      `)
    }
    if (toolNameLower.includes('speed') || toolNameLower.includes('performance')) {
      cards.push(`
        <div><strong>Page Speed:</strong> ${perf.score !== undefined ? Math.round(Number(perf.score)) : '—'}</div>
      `)
    }
    if (toolNameLower.includes('mobile')) {
      cards.push(`
        <div><strong>Mobile Friendly:</strong> ${isMobileFriendly === undefined ? '—' : (isMobileFriendly ? 'Yes' : 'No')}</div>
      `)
    }
    if (toolNameLower.includes('broken') || toolNameLower.includes('link')) {
      cards.push(`
        <div><strong>Broken Links:</strong> ${brokenLinks}${totalLinks !== undefined ? ` / ${totalLinks}` : ''}</div>
      `)
    }
    if (!cards.length) {
      // Generic fallback cards if tool type not matched
      cards.push(`
        <div><strong>Score:</strong> ${score !== undefined ? Math.round(Number(score)) : '—'}</div>
        <div><strong>Issues:</strong> ${issues.length}</div>
      `)
    }

    return `
      <section style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
        <h3 style="color:#1f2937;margin:0 0 8px 0;">🔧 ${tool.toolName} — Latest Result</h3>
        <div style="color:#6b7280;margin-bottom:8px;">Last Used: ${lastUsedStr}</div>
        ${score !== undefined ? `<div><strong>Score:</strong> ${Math.round(Number(score))}</div>` : ''}
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:8px;">
          <div><strong>Issues:</strong> ${issues.length}</div>
          <div><strong>Recommendations:</strong> ${recommendations.length}</div>
          ${cards.join('')}
        </div>
        ${positives.length ? `
          <div style="margin-top: 8px;">
            <strong>Positive Highlights:</strong>
            <ul>
              ${positives.slice(0,5).map((p) => `<li>• ${p}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${issues.length ? `
          <div style="margin-top: 8px;">
            <strong>Key Issues:</strong>
            <ul>
              ${issues.slice(0,5).map((i: unknown) => `<li>• ${String(i)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${recommendations.length ? `
          <div style="margin-top: 8px;">
            <strong>Recommendations:</strong>
            <ul>
              ${recommendations.slice(0,5).map((r: unknown) => `<li>• ${String(r)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${keywordItems.length ? `
          <div style="margin-top: 12px;">
            <strong>Top Keywords${totalWords !== undefined ? ` (Total Words: ${totalWords})` : ''}:</strong>
            <table class="table" style="margin-top:8px;">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Count</th>
                  <th>Density (%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${keywordItems.slice(0, 10).map((k: AnalysisKeyword) => {
                  const keyword = k.keyword ?? k.term ?? ''
                  const count = typeof k.count === 'number' ? k.count : (typeof k.frequency === 'number' ? k.frequency : 0)
                  const density = typeof k.density === 'number' ? k.density : (typeof k.percentage === 'number' ? k.percentage : 0)
                  const status = (k.status ?? '').toString()
                  return `
                    <tr>
                      <td>${keyword}</td>
                      <td>${count}</td>
                      <td>${Number.isFinite(Number(density)) ? Number(density).toFixed(2) : '0.00'}</td>
                      <td>${status || '—'}</td>
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </section>
    `
  }).join('')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SEO Report - ${project.projectName || project._id || 'Project'}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1f2937;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #6b7280;
          margin: 5px 0 0 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #1f2937;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .stat-label {
          color: #6b7280;
          font-size: 14px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .table th,
        .table td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }
        .table th {
          background: #f9fafb;
          font-weight: 600;
          color: #1f2937;
        }
        .table tr:nth-child(even) {
          background: #f9fafb;
        }
        .status-success {
          color: #059669;
          font-weight: 600;
        }
        .status-pending {
          color: #d97706;
          font-weight: 600;
        }
        .status-rejected {
          color: #dc2626;
          font-weight: 600;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .chart-placeholder {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          color: #6b7280;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SEO Performance Report</h1>
        <p>${project.projectName || project._id || 'Project'} - Generated on ${new Date().toLocaleDateString()}</p>
        <p>Website: ${project.websiteURL || 'No website URL'}</p>
      </div>

      <div class="section">
        <h2>Project Details</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Company</div>
            <div class="stat-value">${project.companyName || '—'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Email</div>
            <div class="stat-value">${project.email || '—'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Phone</div>
            <div class="stat-value">${project.phone || '—'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Established</div>
            <div class="stat-value">${project.establishedYear || '—'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Keywords</div>
            <div class="stat-value">${Array.isArray(project.keywords) && project.keywords.length ? project.keywords.join(', ') : '—'}</div>
          </div>
        </div>
        <div class="table" style="margin-top:12px;">
          <table class="table">
            <thead>
              <tr>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${[
                  project.address?.building,
                  project.address?.addressLine1,
                  project.address?.addressLine2,
                  project.address?.addressLine3,
                  project.address?.district,
                  project.address?.city,
                  project.address?.state,
                  project.address?.country,
                  project.address?.pincode
                ].filter(Boolean).join(', ') || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        ${project.businessDescription ? `
          <div style="margin-top:12px;">
            <div style="color:#6b7280;font-size:14px;">Business Description</div>
            <div>${project.businessDescription}</div>
          </div>
        ` : ''}
      </div>

      <div class="section">
        <h2>Project Overview</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${analytics.totalSeoToolsUsed}</div>
            <div class="stat-label">SEO Tools Used</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${analytics.totalSubmissions}</div>
            <div class="stat-label">Total Submissions</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${analytics.successfulSubmissions}</div>
            <div class="stat-label">Successful Submissions</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${analytics.successRate}%</div>
            <div class="stat-label">Overall SEO Health Score</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>SEO Tools Usage</h2>
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
            ${seoToolsUsage.map((tool) => {
              const lastUsedDate = tool.lastUsed ? new Date(tool.lastUsed) : null
              const lastUsedSafe = lastUsedDate && !isNaN(lastUsedDate.getTime())
                ? lastUsedDate.toLocaleDateString()
                : 'N/A'
              const numericScores = tool.results
                .map((r) => Number(r.score))
                .filter((s) => Number.isFinite(s))
              const avgScoreRaw = numericScores.length > 0 
                ? Math.round(numericScores.reduce((sum, s) => sum + s, 0) / numericScores.length)
                : null

              // Derive performance label similarly to alternative exporter when score is missing
              const totals = tool.results.reduce(
                (acc, r) => {
                  let issuesCount = 0
                  if (typeof r.issues === 'number') {
                    issuesCount = r.issues
                  } else {
                    const issuesArray = r.analysisResults?.issues
                    if (Array.isArray(issuesArray)) issuesCount = issuesArray.length
                  }

                  let brokenCount = 0
                  const ar = r.analysisResults
                  if (ar) {
                    if (typeof ar.totalBrokenLinks === 'number') brokenCount = ar.totalBrokenLinks
                    else if (typeof ar.brokenLinks === 'number') brokenCount = ar.brokenLinks
                  }

                  acc.issues += issuesCount
                  acc.broken += brokenCount
                  return acc
                },
                { issues: 0, broken: 0 }
              )

              let derivedScore: number | null = avgScoreRaw
              if (derivedScore === null) {
                derivedScore = (totals.issues === 0 && totals.broken === 0) ? 85 : 40
              }

              const performance = derivedScore >= 80 
                ? 'Excellent' 
                : derivedScore >= 60 
                  ? 'Good' 
                  : derivedScore >= 40 
                    ? 'Fair' 
                    : 'Poor'
              const statusClass = derivedScore >= 80 
                ? 'success' 
                : derivedScore >= 60 
                  ? 'pending' 
                  : 'rejected'
              return `
                <tr>
                  <td>${tool.toolName}</td>
                  <td>${tool.usageCount}</td>
                  <td>${lastUsedSafe}</td>
                  <td>${avgScoreRaw ?? 'N/A'}</td>
                  <td><span class="status-${statusClass}">${performance}</span></td>
                </tr>
              `
            }).join('')}
          </tbody>
      </table>
      </div>

      <div class="section">
        <h2>Latest Tool Results</h2>
        ${toolDetailsHTML || '<p>No recent results available.</p>'}
      </div>

      <div class="section">
        <h2>Submission History</h2>
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
            ${submissionsData.map((submission) => `
              <tr>
                <td>${new Date(submission.date).toLocaleDateString()}</td>
                <td>${submission.directory}</td>
                <td>${submission.category}</td>
                <td class="status-${submission.status}">${submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Monthly Trends</h2>
        <div class="chart-placeholder">
          Monthly submission and SEO tools usage trends would be displayed here in a visual chart.
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Submissions</th>
              <th>SEO Tools Used</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyTrend.map((trend) => `
              <tr>
                <td>${trend.month}</td>
                <td>${trend.submissions}</td>
                <td>${trend.seoTools}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Report generated by Opptym SEO Platform</p>
        <p>For more detailed analytics, visit your dashboard at opptym.com</p>
      </div>
    </body>
    </html>
  `
}
