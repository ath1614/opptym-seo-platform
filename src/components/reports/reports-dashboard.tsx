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
  ExternalLink,
  Tag
} from 'lucide-react'
import { SEOIssuesAnalysis } from './seo-issues-analysis'
import { 
  MetaTagAnalysis, 
  PageSpeedAnalysis, 
  MobileAnalysis, 
  TechnicalSEOAnalysis,
  BacklinkAnalysis,
  CompetitorAnalysis
} from '@/lib/seo-analysis'

interface Project {
  _id: string
  projectName: string
  name: string
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
    lastUsed: string | Date
    results: Array<{
      url: string
      date: string | Date
      score: number
      issues: number
      recommendations: number
      analysisResults: {
          metaTags?: {
            title?: string
            description?: string
            keywords?: string
            viewport?: string
          }
          performance?: {
            images?: number
            headings?: number
            links?: number
            score?: number
            loadTime?: number
            pageSize?: string
            requests?: number
            compressionEnabled?: boolean
            cacheEnabled?: boolean
            minified?: boolean
            imageOptimized?: boolean
          }
          mobileFriendliness?: {
            isMobileFriendly?: boolean
            viewport?: {
              configured?: boolean
              total?: number
            }
            touchTargets?: {
              total?: number
            }
          }
          isMobileFriendly?: boolean
          viewport?: {
            configured?: boolean
            total?: number
          }
          touchTargets?: {
            total?: number
          }
          score?: number
          issues?: Array<string | { message?: string; description?: string; severity?: string; category?: string; type?: string }>
          recommendations?: Array<string | { message?: string; title?: string; description?: string; priority?: string; impact?: string }>
          brokenLinks?: number
          totalLinks?: number
          workingLinks?: number
          totalWords?: number
          uniqueWords?: number
          topKeywords?: string[]
          keywordDensity?: Record<string, number>
          altText?: {
            totalImages?: number
            imagesWithAlt?: number
            imagesWithoutAlt?: number
          }
          [key: string]: unknown
        }
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
  comprehensiveSeoAnalysis?: {
    metaTags?: MetaTagAnalysis
    performance?: PageSpeedAnalysis
    mobileFriendliness?: MobileAnalysis
    accessibility?: PageSpeedAnalysis
    seoStructure?: TechnicalSEOAnalysis
    technicalSEO?: TechnicalSEOAnalysis
    contentQuality?: TechnicalSEOAnalysis
    keywordOptimization?: TechnicalSEOAnalysis
    socialMedia?: TechnicalSEOAnalysis
    localSEO?: TechnicalSEOAnalysis
    backlinks?: BacklinkAnalysis
    competitors?: CompetitorAnalysis
  }
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
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center p-3 bg-background rounded-lg border">
                                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {Math.round(tool.results.reduce((sum, result) => sum + (result.score || 0), 0) / tool.results.length) || 0}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Avg Score</div>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg border">
                                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {tool.results.reduce((sum, result) => {
                                      const issuesCount = result.analysisResults?.issues?.length || result.issues || 0;
                                      return sum + issuesCount;
                                    }, 0)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Total Issues</div>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg border">
                                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {tool.results.reduce((sum, result) => {
                                      const recommendationsCount = result.analysisResults?.recommendations?.length || result.recommendations || 0;
                                      return sum + recommendationsCount;
                                    }, 0)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Recommendations</div>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg border">
                                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {tool.results.length}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Analyses</div>
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
                                        {/* Positive Highlights */}
                                        {(() => {
                                          const ar = result.analysisResults as ReportData['seoToolsUsage'][number]['results'][number]['analysisResults']
                                          const meta = (ar?.metaTags || {}) as { title?: unknown; description?: unknown }
                                          const perf = (ar?.performance || {}) as { score?: unknown }
                                          const mobile = (ar?.mobileFriendliness || {}) as { isMobileFriendly?: unknown }
                                          const isMobileFriendly = (typeof ar?.isMobileFriendly === 'boolean') ? ar.isMobileFriendly : (typeof mobile.isMobileFriendly === 'boolean' ? mobile.isMobileFriendly : undefined)
                                          const brokenLinks = typeof ar?.brokenLinks === 'number' ? ar.brokenLinks : (typeof (ar as any)?.totalBrokenLinks === 'number' ? (ar as any).totalBrokenLinks : undefined)
                                          const perfScore = typeof perf.score === 'number' ? perf.score : (typeof perf.score === 'string' ? Number(perf.score) : undefined)

                                          const positives: string[] = []
                                          if (typeof meta.title === 'string' && meta.title.trim()) positives.push('Title tag present and detected')
                                          if (typeof meta.description === 'string' && meta.description.trim()) positives.push('Meta description present and detected')
                                          if (typeof perfScore === 'number' && perfScore >= 80) positives.push('Strong page performance score (80+).')
                                          if (isMobileFriendly === true) positives.push('Page is mobile-friendly.')
                                          if (typeof brokenLinks === 'number') {
                                            if (brokenLinks === 0) positives.push('No broken links detected.')
                                            else if (brokenLinks <= 2) positives.push('Low number of broken links.')
                                          }

                                          return positives.length ? (
                                            <div>
                                              <div className="flex items-center space-x-2 mb-3">
                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <span className="font-medium text-sm">Positive Highlights ({positives.length})</span>
                                              </div>
                                              <div className="space-y-2">
                                                {positives.map((p, i) => (
                                                  <div key={`positive-${i}`} className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-200">
                                                    • {p}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ) : null
                                        })()}
                                        {/* Enhanced Issues Section */}
                                        {result.analysisResults.issues && Array.isArray(result.analysisResults.issues) && result.analysisResults.issues.length > 0 && (
                                          <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                              <span className="font-medium text-sm">Critical Issues Found ({result.analysisResults.issues?.length || 0})</span>
                                            </div>
                                            <div className="space-y-3">
                                              {result.analysisResults.issues.map((issue: string | { message?: string; description?: string; severity?: string; category?: string; type?: string }, issueIndex: number) => {
                                                // Handle both string and object issues
                                                const issueText = typeof issue === 'string' ? issue : issue.message || issue.description || 'Unknown issue';
                                                const severity = typeof issue === 'object' ? issue.severity || 'medium' : 'medium';
                                                const category = typeof issue === 'object' ? issue.category || issue.type || 'general' : 'general';
                                                
                                                // Generate specific solutions based on issue content
                                                const getSolution = (issueText: string, toolName: string) => {
                                                  const lowerIssue = issueText.toLowerCase();
                                                  
                                                  if (lowerIssue.includes('title') && lowerIssue.includes('missing')) {
                                                    return "Add a unique, descriptive title tag (50-60 characters) that includes your primary keyword and accurately describes the page content.";
                                                  } else if (lowerIssue.includes('title') && (lowerIssue.includes('long') || lowerIssue.includes('short'))) {
                                                    return "Optimize your title tag length to 50-60 characters. Include primary keywords near the beginning and make it compelling for users.";
                                                  } else if (lowerIssue.includes('description') && lowerIssue.includes('missing')) {
                                                    return "Add a meta description (150-160 characters) that summarizes your page content and includes relevant keywords to improve click-through rates.";
                                                  } else if (lowerIssue.includes('description') && (lowerIssue.includes('long') || lowerIssue.includes('short'))) {
                                                    return "Optimize your meta description to 150-160 characters. Make it compelling and include a call-to-action to encourage clicks.";
                                                  } else if (lowerIssue.includes('viewport')) {
                                                    return "Add the viewport meta tag: <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> to ensure proper mobile display.";
                                                  } else if (lowerIssue.includes('mobile') || lowerIssue.includes('responsive')) {
                                                    return "Implement responsive design using CSS media queries, flexible layouts, and mobile-first approach to improve mobile user experience.";
                                                  } else if (lowerIssue.includes('speed') || lowerIssue.includes('performance') || lowerIssue.includes('slow')) {
                                                    return "Optimize page speed by compressing images, minifying CSS/JS, enabling browser caching, and using a Content Delivery Network (CDN).";
                                                  } else if (lowerIssue.includes('image') && lowerIssue.includes('alt')) {
                                                    return "Add descriptive alt text to all images for accessibility and SEO. Use keywords naturally while describing the image content.";
                                                  } else if (lowerIssue.includes('link') && lowerIssue.includes('broken')) {
                                                    return "Fix or remove broken links. Use tools like Google Search Console to identify and replace broken internal/external links.";
                                                  } else if (lowerIssue.includes('heading') || lowerIssue.includes('h1')) {
                                                    return "Structure your content with proper heading hierarchy (H1, H2, H3). Use only one H1 per page and include relevant keywords.";
                                                  } else if (lowerIssue.includes('keyword') && lowerIssue.includes('density')) {
                                                    return "Optimize keyword density to 1-3% of total content. Use keywords naturally and include semantic variations and related terms.";
                                                  } else if (lowerIssue.includes('ssl') || lowerIssue.includes('https')) {
                                                    return "Implement SSL certificate and redirect all HTTP traffic to HTTPS for security and SEO benefits.";
                                                  } else if (toolName.toLowerCase().includes('meta')) {
                                                    return "Review and optimize your meta tags according to current SEO best practices and search engine guidelines.";
                                                  } else if (toolName.toLowerCase().includes('performance')) {
                                                    return "Focus on Core Web Vitals: optimize Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS).";
                                                  } else if (toolName.toLowerCase().includes('mobile')) {
                                                    return "Ensure your website passes Google's Mobile-Friendly Test and provides excellent user experience on all devices.";
                                                  } else {
                                                    return "Review this issue carefully and implement the necessary changes to improve your website's SEO performance and user experience.";
                                                  }
                                                };

                                                const solution = getSolution(issueText, tool.toolName);
                                                
                                                return (
                                                  <div key={`${tool.toolId}-issue-${issueIndex}-${issueText.substring(0, 20)}`} className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                                                    <div className="flex items-start space-x-3">
                                                      <div className={`w-2 h-2 rounded-full mt-2 ${
                                                        severity === 'high' ? 'bg-red-500' :
                                                        severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                                                      }`} />
                                                      <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                          <Badge variant={
                                                            severity === 'high' ? 'destructive' :
                                                            severity === 'medium' ? 'default' : 'secondary'
                                                          } className="text-xs">
                                                            {severity.toUpperCase()}
                                                          </Badge>
                                                          <Badge variant="outline" className="text-xs">
                                                            {category.toUpperCase()}
                                                          </Badge>
                                                        </div>
                                                        <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                                                          Issue #{issueIndex + 1}: {issueText}
                                                        </div>
                                                        
                                                        {/* Solution Section */}
                                                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/50 rounded border border-blue-200 dark:border-blue-800">
                                                          <div className="flex items-center space-x-2 mb-2">
                                                            <Info className="h-4 w-4 text-blue-600" />
                                                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">How to Fix:</span>
                                                          </div>
                                                          <p className="text-sm text-blue-700 dark:text-blue-300">{solution}</p>
                                                        </div>
                                                        
                                                        {/* Impact Assessment */}
                                                        <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                                                          <strong>SEO Impact:</strong> {
                                                            severity === 'high' ? 'High - Immediate attention required' :
                                                            severity === 'medium' ? 'Medium - Should be addressed soon' :
                                                            'Low - Consider fixing when possible'
                                                          }
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}

                                        {/* Enhanced Recommendations Section */}
                                        {result.analysisResults.recommendations && Array.isArray(result.analysisResults.recommendations) && result.analysisResults.recommendations.length > 0 && (
                                          <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                              <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                                              <span className="font-medium text-sm">SEO Recommendations ({result.analysisResults.recommendations?.length || 0})</span>
                                            </div>
                                            <div className="space-y-3">
                                              {result.analysisResults.recommendations.map((recommendation: string | { message?: string; title?: string; description?: string; priority?: string; impact?: string }, recIndex: number) => {
                                                // Handle both string and object recommendations
                                                const recText = typeof recommendation === 'string' ? recommendation : recommendation.message || recommendation.title || 'Optimization recommendation';
                                                const priority = typeof recommendation === 'object' ? recommendation.priority || 'medium' : 'medium';
                                                const impact = typeof recommendation === 'object' ? recommendation.impact : null;
                                                const description = typeof recommendation === 'object' ? recommendation.description : null;
                                                
                                                // Generate implementation steps based on recommendation content
                                                const getImplementationSteps = (recText: string, toolName: string) => {
                                                  const lowerRec = recText.toLowerCase();
                                                  
                                                  if (lowerRec.includes('title') || lowerRec.includes('meta title')) {
                                                    return [
                                                      "Research primary keywords for your page topic",
                                                      "Write a compelling title (50-60 characters)",
                                                      "Include primary keyword near the beginning",
                                                      "Make it unique and descriptive",
                                                      "Test different variations for better CTR"
                                                    ];
                                                  } else if (lowerRec.includes('description') || lowerRec.includes('meta description')) {
                                                    return [
                                                      "Write a compelling summary (150-160 characters)",
                                                      "Include primary and secondary keywords naturally",
                                                      "Add a clear call-to-action",
                                                      "Make it unique for each page",
                                                      "Preview how it appears in search results"
                                                    ];
                                                  } else if (lowerRec.includes('image') || lowerRec.includes('alt')) {
                                                    return [
                                                      "Audit all images on your website",
                                                      "Add descriptive alt text to each image",
                                                      "Include relevant keywords naturally",
                                                      "Keep alt text concise but descriptive",
                                                      "Use empty alt=\"\" for decorative images"
                                                    ];
                                                  } else if (lowerRec.includes('speed') || lowerRec.includes('performance')) {
                                                    return [
                                                      "Compress and optimize all images",
                                                      "Minify CSS, JavaScript, and HTML",
                                                      "Enable browser caching",
                                                      "Use a Content Delivery Network (CDN)",
                                                      "Optimize server response times"
                                                    ];
                                                  } else if (lowerRec.includes('mobile') || lowerRec.includes('responsive')) {
                                                    return [
                                                      "Test your site on various mobile devices",
                                                      "Implement responsive CSS design",
                                                      "Optimize touch targets (minimum 44px)",
                                                      "Ensure text is readable without zooming",
                                                      "Test mobile page speed separately"
                                                    ];
                                                  } else if (lowerRec.includes('heading') || lowerRec.includes('h1')) {
                                                    return [
                                                      "Use only one H1 tag per page",
                                                      "Create a logical heading hierarchy (H1→H2→H3)",
                                                      "Include keywords in headings naturally",
                                                      "Make headings descriptive and useful",
                                                      "Ensure headings improve content structure"
                                                    ];
                                                  } else if (lowerRec.includes('content') || lowerRec.includes('keyword')) {
                                                    return [
                                                      "Research relevant keywords for your topic",
                                                      "Create high-quality, original content",
                                                      "Use keywords naturally (1-3% density)",
                                                      "Include semantic keywords and variations",
                                                      "Update content regularly to keep it fresh"
                                                    ];
                                                  } else {
                                                    return [
                                                      "Analyze the current state of this SEO element",
                                                      "Research best practices for implementation",
                                                      "Create a step-by-step action plan",
                                                      "Implement changes systematically",
                                                      "Monitor results and adjust as needed"
                                                    ];
                                                  }
                                                };

                                                const steps = getImplementationSteps(recText, tool.toolName);
                                                
                                                return (
                                                  <div key={`${tool.toolId}-rec-${recIndex}-${recText.substring(0, 20)}`} className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                                                    <div className="flex items-start space-x-3">
                                                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                      <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                          <Badge variant="outline" className={`text-xs ${
                                                            priority === 'high' ? 'border-red-300 text-red-700' :
                                                            priority === 'medium' ? 'border-orange-300 text-orange-700' :
                                                            'border-green-300 text-green-700'
                                                          }`}>
                                                            {priority.toUpperCase()} PRIORITY
                                                          </Badge>
                                                        </div>
                                                        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                                                          Recommendation #{recIndex + 1}: {recText}
                                                        </div>
                                                        
                                                        {description && (
                                                          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                                                            {description}
                                                          </p>
                                                        )}
                                                        
                                                        {/* Implementation Steps */}
                                                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/50 rounded border border-blue-200 dark:border-blue-800">
                                                          <div className="flex items-center space-x-2 mb-2">
                                                            <Settings className="h-4 w-4 text-blue-600" />
                                                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Implementation Steps:</span>
                                                          </div>
                                                          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                                            {steps.map((step, stepIndex) => (
                                                              <li key={stepIndex} className="flex items-start space-x-2">
                                                                <span className="text-blue-600 font-medium">{stepIndex + 1}.</span>
                                                                <span>{step}</span>
                                                              </li>
                                                            ))}
                                                          </ol>
                                                        </div>
                                                        
                                                        {/* Expected Impact */}
                                                        {impact && (
                                                          <div className="mt-2 text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 p-2 rounded">
                                                            <strong>Expected Impact:</strong> {impact}
                                                          </div>
                                                        )}
                                                        
                                                        {/* Priority Indicator */}
                                                        <div className="mt-2 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-2 rounded">
                                                          <strong>Priority Level:</strong> {
                                                            priority === 'high' ? 'High - Implement immediately for best results' :
                                                            priority === 'medium' ? 'Medium - Important for SEO improvement' :
                                                            'Low - Consider implementing when resources allow'
                                                          }
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}

                                        {/* Tool-Specific Results */}
                                        {result.analysisResults && (
                                          <div className="space-y-3">
                                            {/* Meta Tag Analysis Results */}
                                            {result.analysisResults.metaTags && (
                                              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                                                <h6 className="font-medium text-sm mb-3 flex items-center space-x-2">
                                                  <Search className="h-4 w-4" />
                                                  <span>Meta Tags Analysis</span>
                                                </h6>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                                                    <span className="text-sm font-medium">Title Tag</span>
                                                    <div className="flex items-center space-x-2">
                                                      {result.analysisResults.metaTags?.title ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                      ) : (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                      )}
                                                      <span className="text-xs">{result.analysisResults.metaTags?.title ? 'Present' : 'Missing'}</span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                                                    <span className="text-sm font-medium">Meta Description</span>
                                                    <div className="flex items-center space-x-2">
                                                      {result.analysisResults.metaTags?.description ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                      ) : (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                      )}
                                                      <span className="text-xs">{result.analysisResults.metaTags?.description ? 'Present' : 'Missing'}</span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                                                    <span className="text-sm font-medium">Keywords</span>
                                                    <div className="flex items-center space-x-2">
                                                      {result.analysisResults.metaTags?.keywords ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                      ) : (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                      )}
                                                      <span className="text-xs">{result.analysisResults.metaTags?.keywords ? 'Present' : 'Missing'}</span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                                                    <span className="text-sm font-medium">Viewport</span>
                                                    <div className="flex items-center space-x-2">
                                                      {result.analysisResults.metaTags?.viewport ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                      ) : (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                      )}
                                                      <span className="text-xs">{result.analysisResults.metaTags?.viewport ? 'Present' : 'Missing'}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Page Speed Analysis Results */}
                                            {result.analysisResults.performance && (
                                              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                                                <h6 className="font-medium text-sm mb-3 flex items-center space-x-2">
                                                  <Zap className="h-4 w-4" />
                                                  <span>Performance Analysis</span>
                                                </h6>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Images</span>
                                                      <span className="text-lg font-bold text-blue-600">{result.analysisResults.performance?.images || 0}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Total images found</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Headings</span>
                                                      <span className="text-lg font-bold text-green-600">{result.analysisResults.performance?.headings || 0}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Heading tags found</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Links</span>
                                                      <span className="text-lg font-bold text-purple-600">{result.analysisResults.performance?.links || 0}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Total links found</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Score</span>
                                                      <span className="text-lg font-bold text-orange-600">{result.analysisResults.performance?.score || 0}/100</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Performance score</div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Mobile Analysis Results */}
                                            {result.analysisResults.isMobileFriendly !== undefined && (
                                              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                                                <h6 className="font-medium text-sm mb-3 flex items-center space-x-2">
                                                  <Smartphone className="h-4 w-4" />
                                                  <span>Mobile Analysis</span>
                                                </h6>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Mobile Friendly</span>
                                                      <div className="flex items-center space-x-2">
                                                        {result.analysisResults.isMobileFriendly ? (
                                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                          <XCircle className="h-4 w-4 text-red-600" />
                                                        )}
                                                        <span className="text-sm font-bold">{result.analysisResults.isMobileFriendly ? 'Yes' : 'No'}</span>
                                                      </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Mobile optimization status</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Viewport</span>
                                                      <div className="flex items-center space-x-2">
                                                        {result.analysisResults.viewport?.configured ? (
                                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                          <XCircle className="h-4 w-4 text-red-600" />
                                                        )}
                                                        <span className="text-sm font-bold">{result.analysisResults.viewport?.configured ? 'Configured' : 'Missing'}</span>
                                                      </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Viewport meta tag status</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Touch Targets</span>
                                                      <span className="text-lg font-bold text-blue-600">{result.analysisResults.touchTargets?.total || 0}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Touch-friendly elements</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Score</span>
                                                      <span className="text-lg font-bold text-orange-600">{result.analysisResults.score || 0}/100</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Mobile optimization score</div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Broken Links Analysis */}
                                            {result.analysisResults.brokenLinks !== undefined && (
                                              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                                                <h6 className="font-medium text-sm mb-3 flex items-center space-x-2">
                                                  <Link className="h-4 w-4" />
                                                  <span>Link Analysis</span>
                                                </h6>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Total Links</span>
                                                      <span className="text-lg font-bold text-blue-600">{result.analysisResults.totalLinks || 0}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">All links found on page</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Broken Links</span>
                                                      <span className="text-lg font-bold text-red-600">{result.analysisResults.brokenLinks || 0}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Links returning 404 errors</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Working Links</span>
                                                      <span className="text-lg font-bold text-green-600">{result.analysisResults.workingLinks || 0}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Links working properly</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Health Score</span>
                                                      <span className="text-lg font-bold text-orange-600">{result.analysisResults.score || 0}/100</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Link health score</div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Keyword Density Analysis */}
                                            {result.analysisResults.keywordDensity && (
                                              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                                                <h6 className="font-medium text-sm mb-3 flex items-center space-x-2">
                                                  <Search className="h-4 w-4" />
                                                  <span>Keyword Analysis</span>
                                                </h6>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Total Words</span>
                                                      <span className="text-lg font-bold text-blue-600">{result.analysisResults.totalWords || 0}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Words found in content</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Unique Words</span>
                                                      <span className="text-lg font-bold text-green-600">{result.analysisResults.uniqueWords || 0}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Distinct words used</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Top Keywords</span>
                                                      <span className="text-lg font-bold text-purple-600">{result.analysisResults.topKeywords?.length || 0}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Most frequent keywords</div>
                                                  </div>
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="text-sm font-medium">Density Score</span>
                                                      <span className="text-lg font-bold text-orange-600">{result.analysisResults.score || 0}/100</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Keyword optimization score</div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Enhanced Tool-specific detailed results */}
                                            {tool.toolName === 'Meta Tag Analysis' && result.analysisResults.metaTags && (
                                              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800">
                                                <div className="flex items-center space-x-2 mb-3">
                                                  <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                  <span className="font-medium text-sm text-purple-800 dark:text-purple-200">Meta Tag Analysis Details</span>
                                                </div>
                                                <div className="space-y-4">
                                                  {/* Title Analysis */}
                                                  {result.analysisResults.metaTags.title && (
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                      <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-purple-800 dark:text-purple-200">Title Tag</span>
                                                        <Badge variant={result.analysisResults.metaTags.title.length >= 50 && result.analysisResults.metaTags.title.length <= 60 ? "default" : "destructive"}>
                                                          {result.analysisResults.metaTags.title.length} chars
                                                        </Badge>
                                                      </div>
                                                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">"{result.analysisResults.metaTags.title}"</p>
                                                      <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {result.analysisResults.metaTags.title.length < 50 ? 
                                                          "⚠️ Too short - Consider expanding to 50-60 characters" :
                                                          result.analysisResults.metaTags.title.length > 60 ?
                                                          "⚠️ Too long - May be truncated in search results" :
                                                          "✅ Optimal length for search results"
                                                        }
                                                      </div>
                                                    </div>
                                                  )}
                                                  
                                                  {/* Description Analysis */}
                                                  {result.analysisResults.metaTags.description && (
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                      <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-purple-800 dark:text-purple-200">Meta Description</span>
                                                        <Badge variant={result.analysisResults.metaTags.description.length >= 150 && result.analysisResults.metaTags.description.length <= 160 ? "default" : "destructive"}>
                                                          {result.analysisResults.metaTags.description.length} chars
                                                        </Badge>
                                                      </div>
                                                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">"{result.analysisResults.metaTags.description}"</p>
                                                      <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {result.analysisResults.metaTags.description.length < 150 ? 
                                                          "⚠️ Too short - Consider expanding to 150-160 characters" :
                                                          result.analysisResults.metaTags.description.length > 160 ?
                                                          "⚠️ Too long - May be truncated in search results" :
                                                          "✅ Optimal length for search results"
                                                        }
                                                      </div>
                                                    </div>
                                                  )}
                                                  
                                                  {/* Keywords Analysis */}
                                                  {result.analysisResults.metaTags.keywords && (
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                      <span className="font-medium text-purple-800 dark:text-purple-200">Meta Keywords</span>
                                                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">"{result.analysisResults.metaTags.keywords}"</p>
                                                      <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                                        ℹ️ Meta keywords are largely ignored by search engines. Focus on content optimization instead.
                                                      </div>
                                                    </div>
                                                  )}
                                                  
                                                  {/* Missing Elements Warning */}
                                                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded border border-yellow-200 dark:border-yellow-800">
                                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                                      <strong>SEO Checklist:</strong>
                                                      <ul className="mt-2 space-y-1 text-xs">
                                                        <li>• {result.analysisResults.metaTags.title ? '✅' : '❌'} Title tag present</li>
                                                        <li>• {result.analysisResults.metaTags.description ? '✅' : '❌'} Meta description present</li>
                                                        <li>• {result.analysisResults.metaTags.viewport ? '✅' : '❌'} Viewport meta tag</li>
                                                        <li>• {result.analysisResults.metaTags.keywords ? '✅' : '❌'} Meta keywords specified</li>
                                                      </ul>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Enhanced Page Speed Analysis Details */}
                                            {tool.toolName === 'Page Speed Analysis' && result.analysisResults.performance && (
                                              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg border border-orange-200 dark:border-orange-800">
                                                <div className="flex items-center space-x-2 mb-3">
                                                  <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                  <span className="font-medium text-sm text-orange-800 dark:text-orange-200">Performance Analysis Details</span>
                                                </div>
                                                <div className="space-y-4">
                                                  {/* Core Web Vitals */}
                                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {result.analysisResults.performance.loadTime && (
                                                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                        <div className="text-center">
                                                          <div className="text-2xl font-bold text-orange-600">{result.analysisResults.performance.loadTime}ms</div>
                                                          <div className="text-sm text-gray-600 dark:text-gray-400">Load Time</div>
                                                          <div className="text-xs mt-1">
                                                            {result.analysisResults.performance.loadTime < 2000 ? 
                                                              <span className="text-green-600">✅ Excellent</span> :
                                                              result.analysisResults.performance.loadTime < 4000 ?
                                                              <span className="text-yellow-600">⚠️ Needs Improvement</span> :
                                                              <span className="text-red-600">❌ Poor</span>
                                                            }
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                                                    
                                                    {result.analysisResults.performance.pageSize && (
                                                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                        <div className="text-center">
                                                          <div className="text-2xl font-bold text-orange-600">{result.analysisResults.performance.pageSize}</div>
                                                          <div className="text-sm text-gray-600 dark:text-gray-400">Page Size</div>
                                                          <div className="text-xs mt-1">
                                                            <span className="text-blue-600">📊 Resource Usage</span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                                                    
                                                    {result.analysisResults.performance.requests && (
                                                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                        <div className="text-center">
                                                          <div className="text-2xl font-bold text-orange-600">{result.analysisResults.performance.requests}</div>
                                                          <div className="text-sm text-gray-600 dark:text-gray-400">HTTP Requests</div>
                                                          <div className="text-xs mt-1">
                                                            {result.analysisResults.performance.requests < 50 ? 
                                                              <span className="text-green-600">✅ Good</span> :
                                                              result.analysisResults.performance.requests < 100 ?
                                                              <span className="text-yellow-600">⚠️ Moderate</span> :
                                                              <span className="text-red-600">❌ Too Many</span>
                                                            }
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  {/* Performance Features */}
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">Performance Features</div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                      <div className="flex items-center space-x-2">
                                                        {result.analysisResults.performance.compressionEnabled ? 
                                                          <span className="text-green-600">✅</span> : 
                                                          <span className="text-red-600">❌</span>
                                                        }
                                                        <span>Compression Enabled</span>
                                                      </div>
                                                      <div className="flex items-center space-x-2">
                                                        {result.analysisResults.performance.cacheEnabled ? 
                                                          <span className="text-green-600">✅</span> : 
                                                          <span className="text-red-600">❌</span>
                                                        }
                                                        <span>Browser Caching</span>
                                                      </div>
                                                      <div className="flex items-center space-x-2">
                                                        {result.analysisResults.performance.minified ? 
                                                          <span className="text-green-600">✅</span> : 
                                                          <span className="text-red-600">❌</span>
                                                        }
                                                        <span>Code Minification</span>
                                                      </div>
                                                      <div className="flex items-center space-x-2">
                                                        {result.analysisResults.performance.imageOptimized ? 
                                                          <span className="text-green-600">✅</span> : 
                                                          <span className="text-red-600">❌</span>
                                                        }
                                                        <span>Image Optimization</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Performance Score Breakdown */}
                                                  <div className="p-3 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-950/50 dark:to-yellow-950/50 rounded border">
                                                    <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">Performance Score Breakdown</div>
                                                    <div className="text-xs text-orange-700 dark:text-orange-300">
                                                      <p><strong>Current Score:</strong> {result.analysisResults.score ?? 0}/100</p>
                                                      <p className="mt-1">
                                                        {(result.analysisResults.score ?? 0) >= 90 ? "🎉 Excellent performance! Your site loads quickly." :
                                                         (result.analysisResults.score ?? 0) >= 70 ? "👍 Good performance with room for improvement." :
                                                         (result.analysisResults.score ?? 0) >= 50 ? "⚠️ Average performance. Consider optimizations." :
                                                         "🚨 Poor performance. Immediate optimization needed."}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Enhanced Mobile Analysis Details */}
                                            {tool.toolName === 'Mobile Analysis' && result.analysisResults.mobileFriendliness && (
                                              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                                                <div className="flex items-center space-x-2 mb-3">
                                                  <Smartphone className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                  <span className="font-medium text-sm text-green-800 dark:text-green-200">Mobile Friendliness Details</span>
                                                </div>
                                                <div className="space-y-4">
                                                  {/* Mobile Score */}
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="font-medium text-green-800 dark:text-green-200">Mobile Score</span>
                                                      <Badge variant={(result.analysisResults.score ?? 0) >= 80 ? "default" : (result.analysisResults.score ?? 0) >= 60 ? "secondary" : "destructive"}>
                                                        {result.analysisResults.score ?? 0}/100
                                                      </Badge>
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                      {(result.analysisResults.score ?? 0) >= 80 ? 
                                                        "✅ Excellent mobile experience" :
                                                        (result.analysisResults.score ?? 0) >= 60 ?
                                                        "⚠️ Good but needs improvement" :
                                                        "❌ Poor mobile experience - needs immediate attention"
                                                      }
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Mobile Features */}
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                      <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-green-800 dark:text-green-200">Mobile Friendly</span>
                                                        {result.analysisResults.mobileFriendliness.isMobileFriendly ? 
                                                          <span className="text-green-600">✅</span> : 
                                                          <span className="text-red-600">❌</span>
                                                        }
                                                      </div>
                                                      <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {result.analysisResults.mobileFriendliness.isMobileFriendly ? 
                                                          "Site is optimized for mobile devices" :
                                                          "Site needs mobile optimization"
                                                        }
                                                      </div>
                                                    </div>
                                                    
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                      <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-green-800 dark:text-green-200">Viewport</span>
                                                        {result.analysisResults.mobileFriendliness.viewport?.configured ? 
                                                          <span className="text-green-600">✅</span> : 
                                                          <span className="text-red-600">❌</span>
                                                        }
                                                      </div>
                                                      <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {result.analysisResults.mobileFriendliness.viewport?.configured ? 
                                                          "Viewport meta tag properly configured" :
                                                          "Missing or incorrect viewport configuration"
                                                        }
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Touch Targets */}
                                                  {result.analysisResults.mobileFriendliness.touchTargets && (
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                      <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-green-800 dark:text-green-200">Touch Targets</span>
                                                        <Badge variant="outline">
                                                          {result.analysisResults.mobileFriendliness.touchTargets.total} elements
                                                        </Badge>
                                                      </div>
                                                      <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        Interactive elements analyzed for touch accessibility
                                                      </div>
                                                    </div>
                                                  )}
                                                  
                                                  {/* Mobile Recommendations */}
                                                  <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded border border-blue-200 dark:border-blue-800">
                                                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Mobile Optimization Tips</div>
                                                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                                      <li>• Ensure touch targets are at least 44px in size</li>
                                                      <li>• Use responsive design for all screen sizes</li>
                                                      <li>• Optimize images for mobile loading speeds</li>
                                                      <li>• Test on real devices for best results</li>
                                                    </ul>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Enhanced Broken Links Analysis Details */}
                                            {tool.toolName === 'Broken Links Analysis' && result.analysisResults.brokenLinks !== undefined && (
                                              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                                                <div className="flex items-center space-x-2 mb-3">
                                                  <Link className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                  <span className="font-medium text-sm text-red-800 dark:text-red-200">Link Health Analysis</span>
                                                </div>
                                                <div className="space-y-4">
                                                  {/* Link Statistics */}
                                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                      <div className="text-center">
                                                        <div className="text-2xl font-bold text-red-600">{result.analysisResults.brokenLinks || 0}</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">Broken Links</div>
                                                        <div className="text-xs mt-1">
                                                          {(result.analysisResults.brokenLinks || 0) === 0 ? 
                                                            <span className="text-green-600">✅ No Issues</span> :
                                                            (result.analysisResults.brokenLinks || 0) < 5 ?
                                                            <span className="text-yellow-600">⚠️ Minor Issues</span> :
                                                            <span className="text-red-600">❌ Major Issues</span>
                                                          }
                                                        </div>
                                                      </div>
                                                    </div>
                                                    
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                      <div className="text-center">
                                                        <div className="text-2xl font-bold text-green-600">{result.analysisResults.workingLinks || 0}</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">Working Links</div>
                                                        <div className="text-xs mt-1">
                                                          <span className="text-green-600">✅ Functional</span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                      <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-600">{result.analysisResults.totalLinks || 0}</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Links</div>
                                                        <div className="text-xs mt-1">
                                                          <span className="text-blue-600">📊 Analyzed</span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Link Health Score */}
                                                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <span className="font-medium text-red-800 dark:text-red-200">Link Health Score</span>
                                                      <Badge variant={
                                                        (result.analysisResults.totalLinks && result.analysisResults.workingLinks) ?
                                                        ((result.analysisResults.workingLinks / result.analysisResults.totalLinks) * 100) >= 95 ? "default" :
                                                        ((result.analysisResults.workingLinks / result.analysisResults.totalLinks) * 100) >= 85 ? "secondary" : "destructive"
                                                        : "outline"
                                                      }>
                                                        {result.analysisResults.totalLinks && result.analysisResults.workingLinks ? 
                                                          `${Math.round((result.analysisResults.workingLinks / result.analysisResults.totalLinks) * 100)}%` : 
                                                          'N/A'
                                                        }
                                                      </Badge>
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                      Percentage of working links on your website
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Link Health Recommendations */}
                                                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded border border-yellow-200 dark:border-yellow-800">
                                                    <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Link Maintenance Tips</div>
                                                    <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                                                      <li>• {(result.analysisResults.brokenLinks || 0) > 0 ? `Fix ${result.analysisResults.brokenLinks} broken links immediately` : '✅ No broken links found'}</li>
                                                      <li>• Regularly audit links using automated tools</li>
                                                      <li>• Set up 301 redirects for moved content</li>
                                                      <li>• Monitor external links for changes</li>
                                                      <li>• Use relative URLs for internal links when possible</li>
                                                    </ul>
                                                  </div>
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
          {reportData.seoToolsUsage.length > 0 && (() => {
            const ar = reportData.seoToolsUsage[0]?.results[0]?.analysisResults;
            const metaTagsRaw = ar?.metaTags;
            const performanceRaw = ar?.performance;
            const altTextRaw = ar?.altText;
            const brokenLinksRaw = ar?.brokenLinks;

            const analysisInput = {
              metaTags: metaTagsRaw ? {
                title: { status: metaTagsRaw.title ? 'good' : 'error', content: metaTagsRaw.title },
                description: { status: metaTagsRaw.description ? 'good' : 'error', content: metaTagsRaw.description },
                viewport: { status: metaTagsRaw.viewport ? 'good' : 'error' },
                canonical: { status: 'warning' }
              } : undefined,
              altText: altTextRaw ? {
                missingAlt: (altTextRaw.imagesWithoutAlt ?? ((altTextRaw.totalImages ?? 0) - (altTextRaw.imagesWithAlt ?? 0))) ?? 0,
                images: []
              } : undefined,
              brokenLinks: typeof brokenLinksRaw === 'number' ? { broken: brokenLinksRaw, links: [] } : undefined,
              pageSpeed: (performanceRaw?.score ?? ar?.score) !== undefined ? { overallScore: Number(performanceRaw?.score ?? ar?.score ?? 0) } : undefined,
              recommendations: Array.isArray(ar?.recommendations) ? (ar?.recommendations as Array<string | { message?: string; title?: string }>).map((r) => {
                return typeof r === 'string' ? r : (r.message || r.title || '');
              }) : []
            };

            return (
              <SEOIssuesAnalysis analysisData={analysisInput} />
            );
          })()}

          {/* Comprehensive SEO Analysis */}
          {reportData.comprehensiveSeoAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Comprehensive SEO Analysis</span>
                </CardTitle>
                <CardDescription>Detailed analysis of your website's SEO performance across all categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Meta Tags Analysis */}
                  {reportData.comprehensiveSeoAnalysis.metaTags && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Code className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold">Meta Tags</h4>
                        <Badge variant="outline">Score: {reportData.comprehensiveSeoAnalysis.metaTags?.score || 0}/100</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Title Tag:</span>
                          <span className={reportData.comprehensiveSeoAnalysis.metaTags.title?.status === 'good' ? 'text-green-600' : 'text-red-600'}>
                            {reportData.comprehensiveSeoAnalysis.metaTags.title?.status === 'good' ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Description:</span>
                          <span className={reportData.comprehensiveSeoAnalysis.metaTags.description?.status === 'good' ? 'text-green-600' : 'text-red-600'}>
                            {reportData.comprehensiveSeoAnalysis.metaTags.description?.status === 'good' ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Issues:</span>
                            <span className="text-orange-600">{
                              reportData.comprehensiveSeoAnalysis.metaTags && 
                              'issues' in reportData.comprehensiveSeoAnalysis.metaTags && 
                              reportData.comprehensiveSeoAnalysis.metaTags.issues?.length || 0
                            }</span>
                          </div>
                      </div>
                    </div>
                  )}

                  {/* Performance Analysis */}
                  {reportData.comprehensiveSeoAnalysis.performance && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <h4 className="font-semibold">Performance</h4>
                        <Badge variant="outline">Score: {reportData.comprehensiveSeoAnalysis.performance?.overallScore || 0}/100</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Load Time:</span>
                            <span>{reportData.comprehensiveSeoAnalysis.performance?.performance?.metrics?.firstContentfulPaint || 'N/A'}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Page Score:</span>
                            <span>{reportData.comprehensiveSeoAnalysis.performance?.performance?.score || 'N/A'}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Issues:</span>
                            <span className="text-orange-600">{
                              reportData.comprehensiveSeoAnalysis.performance && 
                              'accessibility' in reportData.comprehensiveSeoAnalysis.performance && 
                              reportData.comprehensiveSeoAnalysis.performance.accessibility?.issues?.length || 0
                            }</span>
                          </div>
                        </div>
                    </div>
                  )}

                  {/* Mobile Friendliness */}
                  {reportData.comprehensiveSeoAnalysis.mobileFriendliness && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Smartphone className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold">Mobile Friendly</h4>
                        <Badge variant="outline">Score: {reportData.comprehensiveSeoAnalysis.mobileFriendliness?.score || 0}/100</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Mobile Friendly:</span>
                            <span className={reportData.comprehensiveSeoAnalysis.mobileFriendliness?.isMobileFriendly ? 'text-green-600' : 'text-red-600'}>
                              {reportData.comprehensiveSeoAnalysis.mobileFriendliness?.isMobileFriendly ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Viewport:</span>
                            <span className={reportData.comprehensiveSeoAnalysis.mobileFriendliness.viewport?.configured ? 'text-green-600' : 'text-red-600'}>
                              {reportData.comprehensiveSeoAnalysis.mobileFriendliness.viewport?.configured ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Issues:</span>
                            <span className="text-orange-600">{reportData.comprehensiveSeoAnalysis.mobileFriendliness?.recommendations?.length || 0}</span>
                          </div>
                        </div>
                    </div>
                  )}

                  {/* Technical SEO */}
                  {reportData.comprehensiveSeoAnalysis.technicalSEO && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Settings className="h-4 w-4 text-purple-600" />
                        <h4 className="font-semibold">Technical SEO</h4>
                        <Badge variant="outline">Score: {reportData.comprehensiveSeoAnalysis.technicalSEO?.score || 0}/100</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Issues Found:</span>
                            <span className="text-orange-600">{
                              (reportData.comprehensiveSeoAnalysis.technicalSEO?.crawlability?.issues?.length || 0) +
                              (reportData.comprehensiveSeoAnalysis.technicalSEO?.indexability?.issues?.length || 0) +
                              (reportData.comprehensiveSeoAnalysis.technicalSEO?.siteStructure?.issues?.length || 0) +
                              (reportData.comprehensiveSeoAnalysis.technicalSEO?.performance?.issues?.length || 0) +
                              (reportData.comprehensiveSeoAnalysis.technicalSEO?.security?.issues?.length || 0)
                            }</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recommendations:</span>
                            <span className="text-blue-600">{reportData.comprehensiveSeoAnalysis.technicalSEO?.recommendations?.length || 0}</span>
                          </div>
                        </div>
                    </div>
                  )}

                  {/* Backlinks Analysis */}
                  {reportData.comprehensiveSeoAnalysis.backlinks && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Link className="h-4 w-4 text-indigo-600" />
                        <h4 className="font-semibold">Backlinks</h4>
                        <Badge variant="outline">Score: {reportData.comprehensiveSeoAnalysis.backlinks?.score || 0}/100</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Backlinks:</span>
                            <span>{reportData.comprehensiveSeoAnalysis.backlinks?.totalBacklinks || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Unique Domains:</span>
                            <span>{reportData.comprehensiveSeoAnalysis.backlinks?.referringDomains || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Domain Authority:</span>
                            <span>{reportData.comprehensiveSeoAnalysis.backlinks?.topReferringDomains?.[0]?.domainAuthority || 'N/A'}</span>
                          </div>
                        </div>
                    </div>
                  )}

                  {/* Competitors Analysis */}
                  {reportData.comprehensiveSeoAnalysis.competitors && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Target className="h-4 w-4 text-red-600" />
                        <h4 className="font-semibold">Competitors</h4>
                        <Badge variant="outline">Score: {reportData.comprehensiveSeoAnalysis.competitors?.score || 0}/100</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Competitors Found:</span>
                            <span>{reportData.comprehensiveSeoAnalysis.competitors?.competitors?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Competitive Gaps:</span>
                            <span>{reportData.comprehensiveSeoAnalysis.competitors?.competitiveGaps?.length || 0}</span>
                          </div>
                        </div>
                    </div>
                  )}

                </div>

                {/* Detailed Issues and Recommendations */}
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-lg">Detailed Analysis</h4>
                  
                  {/* All Issues */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <h5 className="font-medium">Critical Issues</h5>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(reportData.comprehensiveSeoAnalysis).map(([key, analysis]) => {
                          // Only show analyses that have issues or recommendations arrays
                          if (key === 'metaTags' && analysis && 'issues' in analysis && analysis.issues) {
                            return analysis.issues.map((issue: { message?: string; type?: string }, index: number) => (
                              <div key={`${key}-issue-${index}`} className="text-sm p-2 bg-white dark:bg-gray-800 rounded border">
                                <span className="font-medium text-orange-700 dark:text-orange-300 capitalize">{key}:</span> {issue.message || 'Issue detected'}
                              </div>
                            ));
                          }
                          if (key === 'performance' && analysis && 'accessibility' in analysis && analysis.accessibility?.issues) {
                            return analysis.accessibility.issues.map((issue: { message?: string; type?: string }, index: number) => (
                              <div key={`${key}-issue-${index}`} className="text-sm p-2 bg-white dark:bg-gray-800 rounded border">
                                <span className="font-medium text-orange-700 dark:text-orange-300 capitalize">{key}:</span> {issue.message || 'Issue detected'}
                              </div>
                            ));
                          }
                          return null;
                        }).filter(Boolean)}
                      </div>
                    </div>

                    {/* All Recommendations */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2 mb-3">
                        <Info className="h-4 w-4 text-blue-600" />
                        <h5 className="font-medium">Recommendations</h5>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(reportData.comprehensiveSeoAnalysis).map(([key, analysis]) => 
                          analysis?.recommendations?.map((rec: string, index: number) => (
                            <div key={`${key}-rec-${index}`} className="text-sm p-2 bg-white dark:bg-gray-800 rounded border">
                              <span className="font-medium text-blue-700 dark:text-blue-300 capitalize">{key}:</span> {rec}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
