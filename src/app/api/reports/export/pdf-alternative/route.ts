import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

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
    
    // Use external PDF generation service
    try {
      const pdfResponse = await generatePDFWithExternalService(htmlContent)
      
      if (pdfResponse.ok) {
        const pdfBuffer = await pdfResponse.arrayBuffer()
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="seo-report-${(project.projectName || project._id || 'project').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf"`
          }
        })
      } else {
        throw new Error('External PDF service failed')
      }
    } catch (externalError) {
      console.error('External PDF service error:', externalError)
      
      // Fallback: Return HTML content that can be printed as PDF
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="seo-report-${(project.projectName || project._id || 'project').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.html"`
        }
      })
    }

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

async function generatePDFWithExternalService(htmlContent: string) {
  // Try using HTML/CSS to PDF conversion service
  // This is a placeholder - you can integrate with services like:
  // - HTML/CSS to PDF API
  // - wkhtmltopdf service
  // - Other PDF generation services
  
  try {
    // For now, we'll use a simple approach with print CSS
    const printOptimizedHTML = htmlContent.replace(
      '<style>',
      `<style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }
      `
    )
    
    // Return the HTML with print optimization
    return new Response(printOptimizedHTML, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    throw new Error('PDF generation service unavailable')
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
          background: white;
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
        .print-instructions {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          color: #92400e;
        }
        .print-instructions h3 {
          margin: 0 0 10px 0;
          color: #92400e;
        }
        .print-instructions p {
          margin: 5px 0;
          font-size: 14px;
        }
        @media print {
          body { margin: 0; }
          .print-instructions { display: none; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="print-instructions">
        <h3>📄 Print Instructions</h3>
        <p>• Press Ctrl+P (or Cmd+P on Mac) to print this report</p>
        <p>• Select "Save as PDF" in the print dialog</p>
        <p>• Choose "More settings" and select "Background graphics" for better formatting</p>
      </div>
      
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
                <td class="status-${submission.status}">${submission.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Monthly Trends</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Submissions</th>
              <th>SEO Tools</th>
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
        <p>&copy; ${new Date().getFullYear()} Opptym. All rights reserved.</p>
        <p>Report generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `
}
