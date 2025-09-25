"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp, 
  Target, 
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Calendar,
  Globe,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Search,
  Zap,
  Shield,
  Smartphone,
  Link,
  Eye,
  Settings,
  Code,
  Image,
  ExternalLink
} from 'lucide-react'
import { SEOIssuesAnalysis } from './seo-issues-analysis'

interface Project {
  _id: string
  projectName: string
  websiteURL: string
  category: string
  status: string
  createdAt: string
}

interface ReportData {
  project: Project
  user: {
    plan: string
    usage: {
      projects: number
      submissions: number
      seoTools: number
      backlinks: number
      reports: number
    }
  }
  analytics: {
    totalSeoToolsUsed: number
    totalSubmissions: number
    successfulSubmissions: number
    successRate: number
    categoryBreakdown: Record<string, number>
    statusBreakdown: Record<string, number>
  }
  seoToolsUsage: Array<{
    toolId: string
    toolName: string
    usageCount: number
    lastUsed: string
    results: Array<{
      url: string
      date: string
      score: number
      issues: number
      recommendations: number
      analysisResults: Record<string, unknown> // Full analysis results from SEO tools
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
  generatedAt: string
}

export function ReportsDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingReport, setIsLoadingReport] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set())
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false)
  const { showToast } = useToast()

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      
      if (response.ok) {
        setProjects(data.projects)
        if (data.projects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data.projects[0]._id)
        }
      } else {
        showToast({
          title: 'Error',
          description: data.error || 'Failed to fetch projects.',
          variant: 'destructive'
        })
      }
    } catch {
      showToast({
        title: 'Error',
        description: 'Network error while fetching projects',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingProjects(false)
    }
  }, [selectedProjectId, showToast])

  const fetchReportData = useCallback(async (projectId: string) => {
    if (!projectId) return
    
    setIsLoadingReport(true)
    try {
      const response = await fetch(`/api/reports/project/${projectId}`)
      const data = await response.json()
      
      if (response.ok) {
        setReportData(data.reportData)
        setHasGeneratedReport(true)
        showToast({
          title: 'Report Generated!',
          description: 'Comprehensive SEO report has been generated successfully.',
          variant: 'default'
        })
      } else {
        showToast({
          title: 'Error',
          description: data.error || 'Failed to generate report data.',
          variant: 'destructive'
        })
      }
    } catch {
      showToast({
        title: 'Error',
        description: 'Network error while generating report data',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingReport(false)
    }
  }, [showToast])

  const handleGenerateReport = () => {
    if (!selectedProjectId) {
      showToast({
        title: 'No Project Selected',
        description: 'Please select a project first.',
        variant: 'destructive'
      })
      return
    }
    fetchReportData(selectedProjectId)
  }

  const handleExportPDF = async () => {
    if (!reportData) return
    
    setIsExporting(true)
    try {
      // Try alternative PDF export first
      let response = await fetch('/api/reports/export/pdf-alternative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          reportData: reportData
        }),
      })

      // If alternative fails, try original method
      if (!response.ok) {
        console.log('Alternative PDF export failed, trying original method...')
        response = await fetch('/api/reports/export/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: selectedProjectId,
            reportData: reportData
          }),
        })
      }

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        
        if (contentType === 'application/pdf') {
          // PDF file - download directly
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `seo-report-${(reportData.project.projectName || reportData.project._id || 'project').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          showToast({
            title: 'PDF Exported!',
            description: 'Your SEO report has been downloaded successfully.',
            variant: 'success'
          })
        } else if (contentType === 'text/html') {
          // HTML file - open in new tab for printing
          const htmlContent = await response.text()
          const newWindow = window.open('', '_blank')
          if (newWindow) {
            newWindow.document.write(htmlContent)
            newWindow.document.close()
            
            showToast({
              title: 'Report Ready!',
              description: 'Report opened in new tab. Press Ctrl+P to save as PDF.',
              variant: 'success'
            })
          } else {
            showToast({
              title: 'Popup Blocked',
              description: 'Please allow popups and try again, or use the original PDF export.',
              variant: 'destructive'
            })
          }
        }
      } else {
        const data = await response.json()
        showToast({
          title: 'Export Failed',
          description: data.error || 'Failed to export PDF report. Please try again.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('PDF export error:', error)
      showToast({
        title: 'Export Failed',
        description: 'Network error while exporting PDF. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Remove automatic report generation when project is selected
  // useEffect(() => {
  //   if (selectedProjectId) {
  //     fetchReportData(selectedProjectId)
  //   }
  // }, [selectedProjectId, fetchReportData])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getToolIcon = (toolName: string) => {
    const name = toolName.toLowerCase()
    if (name.includes('meta')) return Search
    if (name.includes('keyword')) return Target
    if (name.includes('broken') || name.includes('link')) return Link
    if (name.includes('sitemap') || name.includes('robots')) return Settings
    if (name.includes('backlink')) return ExternalLink
    if (name.includes('speed') || name.includes('performance')) return Zap
    if (name.includes('mobile')) return Smartphone
    if (name.includes('competitor')) return Eye
    if (name.includes('technical')) return Code
    if (name.includes('schema')) return Shield
    if (name.includes('alt') || name.includes('image')) return Image
    if (name.includes('canonical')) return Link
    return BarChart3
  }

  const getToolColor = (toolName: string) => {
    const name = toolName.toLowerCase()
    if (name.includes('meta')) return 'text-blue-600 bg-blue-100'
    if (name.includes('keyword')) return 'text-green-600 bg-green-100'
    if (name.includes('broken') || name.includes('link')) return 'text-red-600 bg-red-100'
    if (name.includes('sitemap') || name.includes('robots')) return 'text-purple-600 bg-purple-100'
    if (name.includes('backlink')) return 'text-orange-600 bg-orange-100'
    if (name.includes('speed') || name.includes('performance')) return 'text-yellow-600 bg-yellow-100'
    if (name.includes('mobile')) return 'text-indigo-600 bg-indigo-100'
    if (name.includes('competitor')) return 'text-pink-600 bg-pink-100'
    if (name.includes('technical')) return 'text-gray-600 bg-gray-100'
    if (name.includes('schema')) return 'text-emerald-600 bg-emerald-100'
    if (name.includes('alt') || name.includes('image')) return 'text-cyan-600 bg-cyan-100'
    if (name.includes('canonical')) return 'text-teal-600 bg-teal-100'
    return 'text-blue-600 bg-blue-100'
  }

  const toggleToolExpansion = (toolId: string) => {
    setExpandedTools(prev => {
      const newSet = new Set(prev)
      if (newSet.has(toolId)) {
        newSet.delete(toolId)
      } else {
        newSet.add(toolId)
      }
      return newSet
    })
  }

  if (isLoadingProjects) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Reports</h1>
          <p className="text-muted-foreground">Generate comprehensive analytics reports for your projects</p>
        </div>
        {reportData && (
          <Button onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        )}
      </div>

      {/* Project Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Choose a project to generate its comprehensive SEO performance report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={selectedProjectId} onValueChange={(value) => {
              setSelectedProjectId(value)
              setHasGeneratedReport(false)
              setReportData(null)
            }}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>{project.projectName}</span>
                      <Badge variant="secondary">{project.category}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleGenerateReport} 
              disabled={!selectedProjectId || isLoadingReport}
              className="min-w-[140px]"
            >
              {isLoadingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
          
          {selectedProjectId && !hasGeneratedReport && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Ready to generate report!</strong> Click "Generate Report" to create a comprehensive SEO analysis report for the selected project.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Content */}
      {isLoadingReport ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Project Overview - Enhanced */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Project Overview</span>
              </CardTitle>
              <CardDescription>
                Comprehensive SEO performance summary for {reportData.project.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Project Info */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Globe className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">{reportData.project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href={reportData.project.websiteURL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {reportData.project.websiteURL}
                      </a>
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">{reportData.project.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(reportData.project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Health Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">SEO Health Score</h4>
                  <Badge variant={reportData.analytics.successRate >= 80 ? "default" : reportData.analytics.successRate >= 60 ? "secondary" : "destructive"}>
                    {reportData.analytics.successRate >= 80 ? "Excellent" : reportData.analytics.successRate >= 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      reportData.analytics.successRate >= 80 ? 'bg-green-500 dark:bg-green-400' : 
                      reportData.analytics.successRate >= 60 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-red-500 dark:bg-red-400'
                    }`}
                    style={{ width: `${Math.min(reportData.analytics.successRate, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {reportData.seoToolsUsage.length > 0 
                    ? `Based on ${reportData.seoToolsUsage.length} SEO tool analysis${reportData.seoToolsUsage.length !== 1 ? 'es' : ''} - issues found, scores, and recommendations`
                    : 'Based on submission success rate (no SEO tools used yet)'
                  }
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border">
                  <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reportData.analytics.totalSeoToolsUsed}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">SEO Tools Used</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border">
                  <Target className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{reportData.analytics.totalSubmissions}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Total Submissions</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border">
                  <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{reportData.analytics.successfulSubmissions}</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Successful</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg border">
                  <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{reportData.analytics.successRate}%</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Success Rate</div>
                </div>
              </div>

              {/* Quick Insights */}
              {reportData.seoToolsUsage.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Quick Insights
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>• {reportData.seoToolsUsage.length} different SEO tool{reportData.seoToolsUsage.length !== 1 ? 's' : ''} used for analysis</p>
                    <p>• Total of {reportData.seoToolsUsage.reduce((sum, tool) => sum + tool.results.reduce((toolSum, result) => toolSum + (result.issues || 0), 0), 0)} issues identified across all tools</p>
                    <p>• {reportData.seoToolsUsage.reduce((sum, tool) => sum + tool.results.reduce((toolSum, result) => toolSum + (result.recommendations || 0), 0), 0)} recommendations provided for improvement</p>
                    <p>• SEO Health Score: {Math.round(reportData.analytics.successRate)}/100 - {reportData.analytics.successRate >= 80 ? 'Excellent' : reportData.analytics.successRate >= 60 ? 'Good' : 'Needs Improvement'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Tools Usage - Enhanced */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>SEO Tools Analysis Results</span>
              </CardTitle>
              <CardDescription>
                Detailed analysis results from SEO tools used on this project, including issues found and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.seoToolsUsage.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No SEO Tools Used Yet</h3>
                    <p className="text-muted-foreground">
                      Use SEO tools on this project to see detailed analysis results here.
                    </p>
                  </div>
                ) : (
                  reportData.seoToolsUsage.map((tool, toolIndex) => {
                    const IconComponent = getToolIcon(tool.toolName)
                    const colorClass = getToolColor(tool.toolName)
                    const isExpanded = expandedTools.has(tool.toolId)
                    
                    return (
                      <div key={`tool-${toolIndex}-${tool.toolId}-${tool.toolName}`} className="border rounded-lg overflow-hidden">
                        {/* Tool Header */}
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleToolExpansion(tool.toolId)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${colorClass}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{tool.toolName}</h4>
                              <p className="text-sm text-muted-foreground">
                                Last used: {new Date(tool.lastUsed).toLocaleDateString()} • {tool.usageCount} analysis{tool.usageCount !== 1 ? 'es' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-2xl font-bold">{tool.usageCount}</div>
                              <div className="text-sm text-muted-foreground">uses</div>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t bg-muted/30">
                            <div className="p-4 space-y-4">
                              {/* Results Summary */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 bg-background rounded-lg border">
                                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {tool.results.reduce((sum, result) => sum + (result.score || 0), 0) / tool.results.length || 0}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Avg Score</div>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg border">
                                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {tool.results.reduce((sum, result) => sum + (result.issues || 0), 0)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Total Issues</div>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg border">
                                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {tool.results.reduce((sum, result) => sum + (result.recommendations || 0), 0)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Recommendations</div>
                                </div>
                              </div>

                              {/* Individual Results */}
                              <div className="space-y-3">
                                <h5 className="font-semibold">Analysis Results:</h5>
                                {tool.results.map((result, index) => (
                                  <div key={`${tool.toolId}-result-${index}-${result.date}`} className="bg-background p-4 rounded-lg border">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h6 className="font-medium text-sm">
                                          Analysis #{index + 1} - {new Date(result.date).toLocaleDateString()}
                                        </h6>
                                        <p className="text-xs text-muted-foreground break-all">
                                          {result.url}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs">
                                          Score: {result.score || 'N/A'}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    {/* Detailed Analysis Results */}
                                    {result.analysisResults && (
                                      <div className="space-y-4">
                                        {/* Issues Section */}
                                        {result.analysisResults.issues && Array.isArray(result.analysisResults.issues) && result.analysisResults.issues.length > 0 && (
                                          <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                              <span className="font-medium text-sm">Issues Found ({result.analysisResults.issues.length})</span>
                                            </div>
                                            <div className="space-y-2">
                                              {result.analysisResults.issues.map((issue: string, issueIndex: number) => (
                                                <div key={`${tool.toolId}-issue-${issueIndex}-${issue.substring(0, 20)}`} className="flex items-start space-x-2 p-2 bg-orange-50 dark:bg-orange-950/50 rounded-lg border border-orange-200 dark:border-orange-800">
                                                  <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                                  <span className="text-sm text-orange-800 dark:text-orange-200">{issue}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Recommendations Section */}
                                        {result.analysisResults.recommendations && Array.isArray(result.analysisResults.recommendations) && result.analysisResults.recommendations.length > 0 && (
                                          <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                              <span className="font-medium text-sm">Recommendations ({result.analysisResults.recommendations.length})</span>
                                            </div>
                                            <div className="space-y-2">
                                              {result.analysisResults.recommendations.map((recommendation: string, recIndex: number) => (
                                                <div key={`${tool.toolId}-rec-${recIndex}-${recommendation.substring(0, 20)}`} className="flex items-start space-x-2 p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                                                  <Info className="h-3 w-3 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                  <span className="text-sm text-blue-800 dark:text-blue-200">{recommendation}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Tool-Specific Results */}
                                        {result.analysisResults && (
                                          <div className="space-y-3">
                                            {/* Meta Tag Analysis Results */}
                                            {result.analysisResults.metaTags && (
                                              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                                                <h6 className="font-medium text-sm mb-2">Meta Tags Analysis</h6>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                  <div>Title: {result.analysisResults.metaTags.title ? '✓' : '✗'}</div>
                                                  <div>Description: {result.analysisResults.metaTags.description ? '✓' : '✗'}</div>
                                                  <div>Keywords: {result.analysisResults.metaTags.keywords ? '✓' : '✗'}</div>
                                                  <div>Viewport: {result.analysisResults.metaTags.viewport ? '✓' : '✗'}</div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Page Speed Analysis Results */}
                                            {result.analysisResults.performance && (
                                              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                                                <h6 className="font-medium text-sm mb-2">Performance Analysis</h6>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                  <div>Images: {result.analysisResults.performance.images || 0}</div>
                                                  <div>Headings: {result.analysisResults.performance.headings || 0}</div>
                                                  <div>Links: {result.analysisResults.performance.links || 0}</div>
                                                  <div>Score: {result.analysisResults.performance.score || 0}/100</div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Mobile Analysis Results */}
                                            {result.analysisResults.isMobileFriendly !== undefined && (
                                              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                                                <h6 className="font-medium text-sm mb-2">Mobile Analysis</h6>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                  <div>Mobile Friendly: {result.analysisResults.isMobileFriendly ? '✓' : '✗'}</div>
                                                  <div>Viewport: {result.analysisResults.viewport?.configured ? '✓' : '✗'}</div>
                                                  <div>Touch Targets: {result.analysisResults.touchTargets?.total || 0}</div>
                                                  <div>Score: {result.analysisResults.score || 0}/100</div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Broken Links Analysis */}
                                            {result.analysisResults.brokenLinks !== undefined && (
                                              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                                                <h6 className="font-medium text-sm mb-2">Link Analysis</h6>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                  <div>Total Links: {result.analysisResults.totalLinks || 0}</div>
                                                  <div>Broken Links: {result.analysisResults.brokenLinks || 0}</div>
                                                  <div>Working Links: {result.analysisResults.workingLinks || 0}</div>
                                                  <div>Score: {result.analysisResults.score || 0}/100</div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Keyword Density Analysis */}
                                            {result.analysisResults.keywordDensity && (
                                              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                                                <h6 className="font-medium text-sm mb-2">Keyword Analysis</h6>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                  <div>Total Words: {result.analysisResults.totalWords || 0}</div>
                                                  <div>Unique Words: {result.analysisResults.uniqueWords || 0}</div>
                                                  <div>Top Keywords: {result.analysisResults.topKeywords?.length || 0}</div>
                                                  <div>Score: {result.analysisResults.score || 0}/100</div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Fallback for tools without detailed results */}
                                        {(!result.analysisResults.issues || result.analysisResults.issues.length === 0) && 
                                         (!result.analysisResults.recommendations || result.analysisResults.recommendations.length === 0) && (
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <div className="flex items-center space-x-2 mb-2">
                                                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                <span className="font-medium text-sm">Issues Found ({result.issues || 0})</span>
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {result.issues > 0 ? (
                                                  <span className="text-orange-600 dark:text-orange-400">
                                                    {result.issues} issue{result.issues !== 1 ? 's' : ''} detected that need attention
                                                  </span>
                                                ) : (
                                                  <span className="text-green-600 dark:text-green-400">No issues found</span>
                                                )}
                                              </div>
                                            </div>

                                            <div>
                                              <div className="flex items-center space-x-2 mb-2">
                                                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <span className="font-medium text-sm">Recommendations ({result.recommendations || 0})</span>
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {result.recommendations > 0 ? (
                                                  <span className="text-blue-600 dark:text-blue-400">
                                                    {result.recommendations} recommendation{result.recommendations !== 1 ? 's' : ''} for improvement
                                                  </span>
                                                ) : (
                                                  <span className="text-muted-foreground">No specific recommendations</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(`/dashboard/seo-tools/${tool.toolId.toLowerCase().replace(/\s+/g, '-')}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Run Tool Again
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Issues Analysis */}
          {reportData.seoToolsUsage.length > 0 && (
            <SEOIssuesAnalysis 
              analysisData={{
                metaTags: reportData.seoToolsUsage[0]?.results[0]?.analysisResults?.metaTags,
                altText: reportData.seoToolsUsage[0]?.results[0]?.analysisResults?.altText,
                brokenLinks: reportData.seoToolsUsage[0]?.results[0]?.analysisResults?.brokenLinks,
                pageSpeed: reportData.seoToolsUsage[0]?.results[0]?.analysisResults?.pageSpeed,
                recommendations: reportData.seoToolsUsage[0]?.results[0]?.analysisResults?.recommendations || []
              }}
            />
          )}

          {/* Submission History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest directory and article submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.submissionsData.slice(0, 10).map((submission, index) => (
                  <div key={`submission-${index}-${submission.date}-${submission.directory}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(submission.status)}
                      <div>
                        <h4 className="font-medium">{submission.directory}</h4>
                        <p className="text-sm text-muted-foreground">
                          {submission.category} • {new Date(submission.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Submission and SEO tools usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.monthlyTrend.map((trend, index) => (
                  <div key={`trend-${index}-${trend.month}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">{trend.month}</span>
                    </div>
                    <div className="flex space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{trend.submissions}</div>
                        <div className="text-xs text-muted-foreground">Submissions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{trend.seoTools}</div>
                        <div className="text-xs text-muted-foreground">SEO Tools</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : selectedProjectId && !hasGeneratedReport ? (
        <Card className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="text-2xl mb-2">Ready to Generate Report</CardTitle>
          <CardDescription className="mb-6">
            You have selected a project. Click the "Generate Report" button above to create a comprehensive SEO analysis report.
          </CardDescription>
          <Button onClick={handleGenerateReport} disabled={isLoadingReport}>
            {isLoadingReport ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="text-2xl mb-2">No Project Selected</CardTitle>
          <CardDescription className="mb-4">
            Select a project from the dropdown above to generate its comprehensive SEO performance report.
          </CardDescription>
          {projects.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  No projects found. Create a project first to generate reports.
                </span>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
