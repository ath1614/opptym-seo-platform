import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import { trackUsage } from '@/lib/limit-middleware'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session as any)?.user?.id) {
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

    // Check if user can generate reports
    const canGenerate = await trackUsage((session as any).user.id, 'reports', 1)
    
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
      userId: (session as any).user.id 
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
    lastUsed: string
    results: Array<{
      score: number
    }>
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
            <div class="stat-label">Success Rate</div>
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
            </tr>
          </thead>
          <tbody>
            ${seoToolsUsage.map((tool) => `
              <tr>
                <td>${tool.toolName}</td>
                <td>${tool.usageCount}</td>
                <td>${new Date(tool.lastUsed).toLocaleDateString()}</td>
                <td>${tool.results.length > 0 ? Math.round(tool.results.reduce((sum: number, r) => sum + r.score, 0) / tool.results.length) : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
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
