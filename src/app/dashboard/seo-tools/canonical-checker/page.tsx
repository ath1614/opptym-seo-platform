"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, CheckCircle, AlertTriangle, XCircle, Link, Globe, Search, Zap, Loader2, Download, ArrowLeft, Copy, TrendingUp, Clock, Shield, Users } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { CanonicalAnalysis } from '@/lib/seo-analysis'

interface DuplicateContent {
  url: string
  title: string
  similarity: number
  status: 'warning' | 'error'
  contentType: 'title' | 'description' | 'content'
  recommendation: string
}

interface CanonicalMetrics {
  totalPages: number
  pagesWithCanonical: number
  pagesWithoutCanonical: number
  selfReferencingPages: number
  canonicalCoverage: number
  duplicateContentIssues: number
  seoScore: number
  technicalScore: number
}

interface Issue {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'canonical' | 'duplicate' | 'technical' | 'seo'
  affectedPages: number
}

interface Tip {
  id: string
  title: string
  description: string
  category: 'canonical' | 'duplicate' | 'technical' | 'seo'
  difficulty: 'easy' | 'medium' | 'hard'
}

interface DetailedRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedImpact: string
  implementationTime: string
  category: 'canonical' | 'duplicate' | 'technical' | 'seo'
}

interface AnalysisData {
  url: string
  canonicalUrl: string
  hasCanonical: boolean
  isSelfReferencing: boolean
  duplicateContent: DuplicateContent[]
  canonicalIssues: Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
  recommendations: string[]
  score: number
  canonicalMetrics: CanonicalMetrics
  issues: Issue[]
  tips: Tip[]
  detailedRecommendations: DetailedRecommendation[]
}

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

export default function CanonicalCheckerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchProjects()
    }
  }, [session])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const generateEnhancedAnalysis = (basicData: CanonicalAnalysis): AnalysisData => {
    const hasCanonical = !!basicData.canonicalUrl
    const isSelfReferencing = basicData.canonicalUrl === basicData.url
    const duplicateContentIssues = basicData.duplicateContent.length
    const technicalScore = hasCanonical ? (isSelfReferencing ? 95 : 80) : 60

    const canonicalMetrics: CanonicalMetrics = {
      totalPages: 1,
      pagesWithCanonical: hasCanonical ? 1 : 0,
      pagesWithoutCanonical: hasCanonical ? 0 : 1,
      selfReferencingPages: isSelfReferencing ? 1 : 0,
      canonicalCoverage: hasCanonical ? 100 : 0,
      duplicateContentIssues,
      seoScore: basicData.score,
      technicalScore
    }

    const issues: Issue[] = []
    
    if (!hasCanonical) {
      issues.push({
        id: '1',
        type: 'critical',
        title: 'Missing Canonical URL',
        description: 'This page does not have a canonical URL specified, which can lead to duplicate content issues and diluted SEO value.',
        impact: 'high',
        category: 'canonical',
        affectedPages: 1
      })
    }

    if (hasCanonical && !isSelfReferencing) {
      issues.push({
        id: '2',
        type: 'warning',
        title: 'Non-Self-Referencing Canonical',
        description: 'The canonical URL points to a different page, which may indicate duplicate content or incorrect canonical implementation.',
        impact: 'medium',
        category: 'canonical',
        affectedPages: 1
      })
    }

    if (duplicateContentIssues > 0) {
      issues.push({
        id: '3',
        type: 'warning',
        title: 'Potential Duplicate Content',
        description: `Found ${duplicateContentIssues} potential duplicate content issues that could affect SEO performance.`,
        impact: 'medium',
        category: 'duplicate',
        affectedPages: duplicateContentIssues
      })
    }

    if (basicData.issues.length > 0) {
      issues.push({
        id: '4',
        type: 'critical',
        title: 'Critical Canonical Issues',
        description: 'High-severity canonical issues detected that require immediate attention to prevent SEO problems.',
        impact: 'high',
        category: 'technical',
        affectedPages: basicData.issues.length
      })
    }

    const tips: Tip[] = [
      {
        id: '1',
        title: 'Use Self-Referencing Canonicals',
        description: 'Every page should have a canonical URL pointing to itself to prevent duplicate content issues, even if no duplicates exist.',
        category: 'canonical',
        difficulty: 'easy'
      },
      {
        id: '2',
        title: 'Implement Consistent URL Structure',
        description: 'Maintain consistent URL structures across your site to minimize canonical conflicts and duplicate content.',
        category: 'technical',
        difficulty: 'medium'
      },
      {
        id: '3',
        title: 'Monitor Duplicate Content',
        description: 'Regularly check for duplicate content issues and use canonical tags to consolidate link equity to the preferred version.',
        category: 'duplicate',
        difficulty: 'medium'
      },
      {
        id: '4',
        title: 'Use Absolute URLs',
        description: 'Always use absolute URLs in canonical tags to avoid confusion and ensure proper implementation across different environments.',
        category: 'seo',
        difficulty: 'easy'
      }
    ]

    const detailedRecommendations: DetailedRecommendation[] = [
      {
        id: '1',
        title: 'Implement Canonical Tags',
        description: 'Add canonical tags to all pages to prevent duplicate content issues and consolidate SEO value to the preferred version.',
        priority: 'high',
        estimatedImpact: '25% better search rankings',
        implementationTime: '1-2 hours',
        category: 'canonical'
      },
      {
        id: '2',
        title: 'Fix Non-Self-Referencing Canonicals',
        description: 'Update canonical URLs to point to the current page unless intentionally consolidating duplicate content.',
        priority: 'medium',
        estimatedImpact: '15% better page authority',
        implementationTime: '30 minutes - 1 hour',
        category: 'canonical'
      },
      {
        id: '3',
        title: 'Resolve Duplicate Content Issues',
        description: 'Address duplicate content by using canonical tags, 301 redirects, or content differentiation strategies.',
        priority: 'medium',
        estimatedImpact: '20% better content uniqueness',
        implementationTime: '2-4 hours',
        category: 'duplicate'
      },
      {
        id: '4',
        title: 'Audit Site-Wide Canonical Implementation',
        description: 'Conduct a comprehensive audit of canonical tags across your entire website to ensure consistent implementation.',
        priority: 'low',
        estimatedImpact: '10% better technical SEO',
        implementationTime: '4-8 hours',
        category: 'technical'
      }
    ]

    // Enhance duplicate content with additional data
    const enhancedDuplicateContent = basicData.duplicateContent.map(content => ({
      ...content,
      title: content.issue || 'Duplicate content detected',
      status: content.similarity > 80 ? 'error' as const : 'warning' as const,
      contentType: content.issue.includes('title') ? 'title' as const : 'content' as const,
      recommendation: content.similarity > 80 ? 'Use canonical tag or 301 redirect' : 'Consider content differentiation'
    }))

    return {
      url: basicData.url,
      canonicalUrl: basicData.canonicalUrl,
      hasCanonical,
      isSelfReferencing,
      duplicateContent: enhancedDuplicateContent,
      canonicalIssues: basicData.issues.map(issue => ({
        type: 'canonical_issue',
        message: issue,
        severity: 'medium' as const
      })),
      recommendations: basicData.recommendations,
      score: basicData.score,
      canonicalMetrics,
      issues,
      tips,
      detailedRecommendations
    }
  }

  const handleAnalyze = async () => {
    if (!selectedProject) {
      showToast({
        title: 'Error',
        description: 'Please select a project to analyze',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch(`/api/tools/${selectedProject}/run-canonical`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Canonical Analysis Response:', data)
        const enhancedData = generateEnhancedAnalysis(data.data)
        setAnalysisData(enhancedData)
        showToast({
          title: 'Analysis Complete',
          description: 'Canonical analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze canonical tags',
          variant: 'destructive'
        })
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Network error occurred during analysis',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExport = () => {
    if (!analysisData) return
    
    const csvContent = [
      'URL,Canonical URL,Has Canonical,Self Referencing,Duplicate Content Issues,Technical Score',
      `"${analysisData.url}","${analysisData.canonicalUrl}","${analysisData.hasCanonical}","${analysisData.isSelfReferencing}","${analysisData.canonicalMetrics.duplicateContentIssues}","${analysisData.canonicalMetrics.technicalScore}"`
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'canonical-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Helper functions
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast({
      title: 'Copied',
      description: 'Text copied to clipboard',
      variant: 'success'
    })
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20'
      case 'info': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Canonical Checker</h1>
              <p className="text-muted-foreground">Analyze canonical tags to prevent duplicate content issues and improve SEO</p>
            </div>
          </div>
          {analysisData && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          )}
        </div>

        {/* Project Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-primary" />
              <span>Canonical Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze canonical tags and prevent duplicate content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.projectName} - {project.websiteURL}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !selectedProject}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Canonical Tags...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Check Canonical Tags
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* Canonical Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Link className="h-5 w-5 text-primary" />
                  <span>Canonical Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisData.canonicalMetrics.totalPages}
                    </div>
                    <div className="text-sm text-muted-foreground">Pages Analyzed</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {analysisData.canonicalMetrics.canonicalCoverage}%
                    </div>
                    <div className="text-sm text-muted-foreground">Canonical Coverage</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">
                      {analysisData.canonicalMetrics.duplicateContentIssues}
                    </div>
                    <div className="text-sm text-muted-foreground">Duplicate Issues</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className={`text-2xl font-bold ${getScoreColor(analysisData.canonicalMetrics.technicalScore)}`}>
                      {analysisData.canonicalMetrics.technicalScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Technical Score</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Current URL</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 break-all">{analysisData.url}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Link className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">Canonical URL</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 break-all">{analysisData.canonicalUrl || 'Not found'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant={analysisData.hasCanonical ? 'default' : 'destructive'}>
                      {analysisData.hasCanonical ? 'Has Canonical' : 'Missing Canonical'}
                    </Badge>
                    <Badge variant={analysisData.isSelfReferencing ? 'default' : 'secondary'}>
                      {analysisData.isSelfReferencing ? 'Self Referencing' : 'Not Self Referencing'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues Found */}
            {analysisData.issues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Issues Found</span>
                    <Badge variant="destructive">{analysisData.issues.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.issues.map((issue) => (
                      <div key={issue.id} className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getIssueIcon(issue.type)}
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{issue.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {issue.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {issue.impact} impact
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {issue.affectedPages} pages
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(issue.description)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips & Best Practices */}
            {analysisData.tips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Tips & Best Practices</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData.tips.map((tip) => (
                      <div key={tip.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-green-800">{tip.title}</h4>
                            <p className="text-sm text-green-700 mt-1">{tip.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {tip.category}
                              </Badge>
                              <Badge className={`text-xs ${getDifficultyColor(tip.difficulty)}`}>
                                {tip.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tip.description)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Recommendations */}
            {analysisData.detailedRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span>Detailed Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.detailedRecommendations.map((rec) => (
                      <div key={rec.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-sm text-blue-800">{rec.title}</h4>
                              <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                                {rec.priority} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-700 mb-3">{rec.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-muted-foreground">Impact: {rec.estimatedImpact}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 text-blue-500" />
                                <span className="text-muted-foreground">Time: {rec.implementationTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="text-xs">
                                  {rec.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(rec.description)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Canonical Issues */}
            {analysisData.canonicalIssues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Canonical Issues</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.canonicalIssues.map((issue, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>{issue.type}</strong>
                              <p className="text-sm text-muted-foreground mt-1">{issue.message}</p>
                            </div>
                            <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'}>
                              {issue.severity}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Duplicate Content */}
            {analysisData.duplicateContent.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-orange-500" />
                    <span>Duplicate Content</span>
                    <Badge variant="outline">{analysisData.duplicateContent.length} issues</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.duplicateContent.map((duplicate, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm break-all">{duplicate.url}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{duplicate.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{duplicate.recommendation}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getStatusColor(duplicate.status)}`}>
                            {duplicate.contentType}
                          </Badge>
                          <Badge variant={duplicate.status === 'error' ? 'destructive' : 'secondary'}>
                            {duplicate.similarity}% similar
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Original Recommendations */}
            {analysisData.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Additional Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.recommendations.map((recommendation, index) => (
                      <Alert key={index}>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{recommendation}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}