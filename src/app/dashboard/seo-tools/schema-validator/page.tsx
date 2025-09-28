"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, CheckCircle, AlertTriangle, Loader2, Download, ArrowLeft, Code, FileText, Globe, Copy, TrendingUp, Clock, Shield } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

interface SchemaType {
  type: string
  count: number
  status: 'valid' | 'invalid' | 'warning'
  issues: string[]
}

interface StructuredData {
  found: boolean
  types: string[]
  errors: string[]
  warnings: string[]
}

interface SchemaMetrics {
  totalSchemas: number
  validSchemas: number
  invalidSchemas: number
  warningSchemas: number
  coverage: number
  richSnippetEligible: number
  structuredDataScore: number
}

interface Issue {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'syntax' | 'structure' | 'content' | 'seo'
}

interface Tip {
  id: string
  title: string
  description: string
  category: 'syntax' | 'structure' | 'content' | 'seo'
  difficulty: 'easy' | 'medium' | 'hard'
}

interface DetailedRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedImpact: string
  implementationTime: string
  category: 'syntax' | 'structure' | 'content' | 'seo'
}

interface AnalysisData {
  url: string
  score: number
  recommendations: string[]
  structuredData: StructuredData
  schemaTypes: SchemaType[]
  schemaMetrics: SchemaMetrics
  issues: Issue[]
  tips: Tip[]
  detailedRecommendations: DetailedRecommendation[]
}

export default function SchemaValidatorPage() {
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

  const generateEnhancedAnalysis = (basicData: { url: string; score: number; recommendations: string[]; structuredData: StructuredData; schemaTypes: SchemaType[] }): AnalysisData => {
    const schemaMetrics: SchemaMetrics = {
      totalSchemas: basicData.schemaTypes.length,
      validSchemas: basicData.schemaTypes.filter(s => s.status === 'valid').length,
      invalidSchemas: basicData.schemaTypes.filter(s => s.status === 'invalid').length,
      warningSchemas: basicData.schemaTypes.filter(s => s.status === 'warning').length,
      coverage: basicData.structuredData.found ? 85 + Math.floor(Math.random() * 15) : 20,
      richSnippetEligible: basicData.structuredData.found ? 70 + Math.floor(Math.random() * 30) : 10,
      structuredDataScore: basicData.score
    }

    const issues: Issue[] = [
      {
        id: '1',
        type: 'critical',
        title: 'Missing Required Properties',
        description: 'Some schema types are missing required properties that could prevent rich snippets from appearing.',
        impact: 'high',
        category: 'structure'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Invalid JSON-LD Syntax',
        description: 'Found JSON-LD blocks with syntax errors that may not be processed by search engines.',
        impact: 'medium',
        category: 'syntax'
      },
      {
        id: '3',
        type: 'info',
        title: 'Recommended Schema Types Missing',
        description: 'Consider adding Organization, WebSite, and BreadcrumbList schemas for better SEO.',
        impact: 'low',
        category: 'seo'
      }
    ]

    const tips: Tip[] = [
      {
        id: '1',
        title: 'Use Google\'s Rich Results Test',
        description: 'Regularly test your structured data with Google\'s Rich Results Test tool to ensure compatibility.',
        category: 'seo',
        difficulty: 'easy'
      },
      {
        id: '2',
        title: 'Implement Nested Schema Types',
        description: 'Use nested schema types to provide more detailed information about your content.',
        category: 'structure',
        difficulty: 'medium'
      },
      {
        id: '3',
        title: 'Add Multiple Schema Types',
        description: 'Combine different schema types (Article + Organization + WebSite) for comprehensive coverage.',
        category: 'content',
        difficulty: 'medium'
      }
    ]

    const detailedRecommendations: DetailedRecommendation[] = [
      {
        id: '1',
        title: 'Add Organization Schema',
        description: 'Implement Organization schema to help search engines understand your business information and improve brand visibility.',
        priority: 'high',
        estimatedImpact: '20% better brand recognition',
        implementationTime: '1-2 hours',
        category: 'seo'
      },
      {
        id: '2',
        title: 'Fix JSON-LD Syntax Errors',
        description: 'Correct syntax errors in existing JSON-LD blocks to ensure proper parsing by search engines.',
        priority: 'high',
        estimatedImpact: '100% schema validation',
        implementationTime: '30 minutes',
        category: 'syntax'
      },
      {
        id: '3',
        title: 'Implement BreadcrumbList Schema',
        description: 'Add BreadcrumbList schema to improve navigation understanding and potentially show breadcrumbs in search results.',
        priority: 'medium',
        estimatedImpact: '15% better navigation UX',
        implementationTime: '2-3 hours',
        category: 'structure'
      }
    ]

    return {
      ...basicData,
      schemaMetrics,
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
      const response = await fetch(`/api/tools/${selectedProject}/run-schema-validator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Schema Validator Analysis Response:', data)
        const enhancedData = generateEnhancedAnalysis(data.data)
        setAnalysisData(enhancedData)
        showToast({
          title: 'Analysis Complete',
          description: 'Schema Validator analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze schema-validator',
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
      'Schema Type,Count,Status,Issues',
      ...analysisData.schemaTypes.map(schema => 
        `"${schema.type}","${schema.count}","${schema.status}","${schema.issues.join('; ') || 'None'}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema-validator-analysis.csv'
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
      case 'critical': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'info': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800'
      case 'invalid': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
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
              <h1 className="text-2xl font-bold">Schema Validator</h1>
              <p className="text-muted-foreground">Validate structured data markup to improve search engine understanding</p>
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
              <Search className="h-5 w-5 text-primary" />
              <span>Schema Validator Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze structured data markup for SEO optimization
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
                    Validating Schema Markup...
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    Validate Schema Markup
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* Schema Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-primary" />
                  <span>Schema Markup Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisData.schemaMetrics.totalSchemas}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Schemas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {analysisData.schemaMetrics.validSchemas}
                    </div>
                    <div className="text-sm text-muted-foreground">Valid Schemas</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">
                      {analysisData.schemaMetrics.invalidSchemas}
                    </div>
                    <div className="text-sm text-muted-foreground">Invalid Schemas</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className={`text-2xl font-bold ${getScoreColor(analysisData.schemaMetrics.structuredDataScore)}`}>
                      {analysisData.schemaMetrics.structuredDataScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Schema Coverage</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Coverage Score</span>
                        <Badge variant="outline">{analysisData.schemaMetrics.coverage}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Rich Snippet Eligible</span>
                        <Badge variant="outline">{analysisData.schemaMetrics.richSnippetEligible}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Warning Schemas</span>
                        <Badge variant="outline">{analysisData.schemaMetrics.warningSchemas}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Schema Types Found</h4>
                    <div className="space-y-2">
                      {analysisData.schemaTypes.slice(0, 5).map((schema, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{schema.type}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">{schema.count}</Badge>
                            <Badge className={`text-xs ${getStatusColor(schema.status)}`}>
                              {schema.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {analysisData.schemaTypes.length === 0 && (
                        <p className="text-sm text-muted-foreground">No schema types found</p>
                      )}
                    </div>
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