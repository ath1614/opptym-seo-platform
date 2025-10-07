"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Image, CheckCircle, AlertTriangle, Eye, Loader2, Download, ArrowLeft, Copy, TrendingUp, Clock, Users } from 'lucide-react'
import { AltTextAnalysis } from '@/lib/seo-analysis'
import { useToast } from '@/components/ui/toast'

interface ImageData {
  src: string
  alt: string
  status: 'good' | 'warning' | 'error'
  recommendation: string
  size?: string
  type?: string
  accessibility: 'excellent' | 'good' | 'poor' | 'critical'
}

interface AltTextMetrics {
  totalImages: number
  imagesWithAlt: number
  imagesWithoutAlt: number
  imagesWithPoorAlt: number
  altTextCoverage: number
  accessibilityScore: number
  seoScore: number
  averageAltLength: number
}

interface Issue {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'accessibility' | 'seo' | 'content' | 'technical'
  affectedImages: number
}

interface Tip {
  id: string
  title: string
  description: string
  category: 'accessibility' | 'seo' | 'content' | 'technical'
  difficulty: 'easy' | 'medium' | 'hard'
}

interface DetailedRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedImpact: string
  implementationTime: string
  category: 'accessibility' | 'seo' | 'content' | 'technical'
}

interface AnalysisData {
  url: string
  totalImages: number
  imagesWithAlt: number
  imagesWithoutAlt: number
  altTextCoverage: number
  images: ImageData[]
  recommendations: string[]
  score: number
  altTextMetrics: AltTextMetrics
  issues: Issue[]
  tips: Tip[]
  detailedRecommendations: DetailedRecommendation[]
}

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

export default function AltTextCheckerPage() {
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
      // silently handle project fetch error
    }
  }

  const generateEnhancedAnalysis = (basicData: AltTextAnalysis): AnalysisData => {
    // Convert backend imageIssues to frontend images format
    const images: ImageData[] = basicData.imageIssues?.map((issue, index: number) => ({
      src: issue.src || `Image ${index + 1}`,
      alt: issue.alt || '',
      status: issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'good',
      recommendation: issue.issue || 'No issues found',
      accessibility: issue.severity === 'high' ? 'critical' : issue.severity === 'medium' ? 'poor' : 'good'
    })) || []

    // Calculate altTextCoverage if not provided
    const altTextCoverage = basicData.altTextCoverage || 
      (basicData.totalImages > 0 ? Math.round((basicData.imagesWithAlt / basicData.totalImages) * 100) : 100)

    const imagesWithPoorAlt = basicData.imagesWithPoorAlt || images.filter((img: ImageData) => img.alt && img.alt.length < 5).length
    const averageAltLength = images.filter((img: ImageData) => img.alt).reduce((sum, img) => sum + img.alt.length, 0) / Math.max(basicData.imagesWithAlt || 1, 1)

    const altTextMetrics: AltTextMetrics = {
      totalImages: basicData.totalImages,
      imagesWithAlt: basicData.imagesWithAlt,
      imagesWithoutAlt: basicData.imagesWithoutAlt,
      imagesWithPoorAlt,
      altTextCoverage: basicData.altTextCoverage,
      accessibilityScore: Math.round(((basicData.imagesWithAlt - imagesWithPoorAlt) / Math.max(basicData.totalImages, 1)) * 100),
      seoScore: basicData.score,
      averageAltLength: Math.round(averageAltLength)
    }

    const issues: Issue[] = []
    
    if (basicData.imagesWithoutAlt > 0) {
      issues.push({
        id: '1',
        type: 'critical',
        title: 'Missing Alt Text',
        description: `${basicData.imagesWithoutAlt} images are missing alt text, severely impacting accessibility and SEO.`,
        impact: 'high',
        category: 'accessibility',
        affectedImages: basicData.imagesWithoutAlt
      })
    }

    if (imagesWithPoorAlt > 0) {
      issues.push({
        id: '2',
        type: 'warning',
        title: 'Poor Quality Alt Text',
        description: `${imagesWithPoorAlt} images have alt text that is too short or not descriptive enough.`,
        impact: 'medium',
        category: 'content',
        affectedImages: imagesWithPoorAlt
      })
    }

    if (averageAltLength > 125) {
      issues.push({
        id: '3',
        type: 'info',
        title: 'Alt Text Too Long',
        description: 'Some alt text descriptions are longer than recommended (125 characters). Consider making them more concise.',
        impact: 'low',
        category: 'content',
        affectedImages: basicData.images.filter((img: ImageData) => img.alt && img.alt.length > 125).length
      })
    }

    const tips: Tip[] = [
      {
        id: '1',
        title: 'Write Descriptive Alt Text',
        description: 'Alt text should describe the content and function of the image. Be specific and concise.',
        category: 'content',
        difficulty: 'easy'
      },
      {
        id: '2',
        title: 'Avoid Redundant Phrases',
        description: 'Don\'t use phrases like "image of" or "picture of" - screen readers already announce it\'s an image.',
        category: 'accessibility',
        difficulty: 'easy'
      },
      {
        id: '3',
        title: 'Consider Context',
        description: 'Alt text should provide context relevant to the surrounding content and page purpose.',
        category: 'seo',
        difficulty: 'medium'
      },
      {
        id: '4',
        title: 'Use Keywords Naturally',
        description: 'Include relevant keywords in alt text when appropriate, but avoid keyword stuffing.',
        category: 'seo',
        difficulty: 'medium'
      }
    ]

    const detailedRecommendations: DetailedRecommendation[] = [
      {
        id: '1',
        title: 'Add Alt Text to All Images',
        description: 'Ensure every image has descriptive alt text to improve accessibility for screen reader users and provide SEO benefits.',
        priority: 'high',
        estimatedImpact: '30% better accessibility score',
        implementationTime: '2-4 hours',
        category: 'accessibility'
      },
      {
        id: '2',
        title: 'Optimize Alt Text Length',
        description: 'Keep alt text between 10-125 characters for optimal accessibility and SEO performance.',
        priority: 'medium',
        estimatedImpact: '15% better user experience',
        implementationTime: '1-2 hours',
        category: 'content'
      },
      {
        id: '3',
        title: 'Include Relevant Keywords',
        description: 'Naturally incorporate target keywords into alt text where contextually appropriate to boost SEO.',
        priority: 'medium',
        estimatedImpact: '10% better search visibility',
        implementationTime: '1-3 hours',
        category: 'seo'
      },
      {
        id: '4',
        title: 'Implement Alt Text Guidelines',
        description: 'Create and follow consistent alt text guidelines across your website for better maintenance and quality.',
        priority: 'low',
        estimatedImpact: '20% better content consistency',
        implementationTime: '4-6 hours',
        category: 'technical'
      }
    ]

    return {
      url: basicData.url,
      totalImages: basicData.totalImages,
      imagesWithAlt: basicData.imagesWithAlt,
      imagesWithoutAlt: basicData.imagesWithoutAlt,
      altTextCoverage,
      images,
      recommendations: basicData.recommendations,
      score: basicData.score,
      altTextMetrics,
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
      const response = await fetch(`/api/tools/${selectedProject}/run-alt-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        const enhancedData = generateEnhancedAnalysis(data.data)
        setAnalysisData(enhancedData)
        showToast({
          title: 'Analysis Complete',
          description: 'Alt text analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze alt text',
          variant: 'destructive'
        })
      }
    } catch {
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
      'Image URL,Alt Text,Status,Accessibility,Recommendation',
      ...analysisData.images.map((img: ImageData) => 
        `"${img.src}","${img.alt}","${img.status}","${img.accessibility}","${img.recommendation}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'alt-text-analysis.csv'
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accessibility': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'seo': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'content': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'technical': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getAccessibilityColor = (accessibility: string) => {
    switch (accessibility) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'poor': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
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
<>
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
              <h1 className="text-2xl font-bold">Alt Text Checker</h1>
              <p className="text-muted-foreground">Analyze and optimize alt text for images to improve accessibility and SEO</p>
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
              <Image className="h-5 w-5 text-primary" />
              <span>Alt Text Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze alt text for images and improve accessibility
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
                    Analyzing Alt Text...
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    Check Alt Text
                  </>)}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* Alt Text Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="h-5 w-5 text-primary" />
                  <span>Alt Text Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Image className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisData.altTextMetrics.totalImages}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Images</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {analysisData.altTextMetrics.imagesWithAlt}
                    </div>
                    <div className="text-sm text-muted-foreground">With Alt Text</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">
                      {analysisData.altTextMetrics.imagesWithoutAlt}
                    </div>
                    <div className="text-sm text-muted-foreground">Missing Alt Text</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className={`text-2xl font-bold ${getScoreColor(analysisData.altTextMetrics.accessibilityScore)}`}>
                      {analysisData.altTextMetrics.accessibilityScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Accessibility Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Alt Text Coverage</span>
                        <Badge variant="outline">{analysisData.altTextMetrics.altTextCoverage}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">SEO Score</span>
                        <Badge variant="outline">{analysisData.altTextMetrics.seoScore}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Alt Length</span>
                        <Badge variant="outline">{analysisData.altTextMetrics.averageAltLength} chars</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Quality Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Poor Quality Alt Text</span>
                        <Badge variant="outline">{analysisData.altTextMetrics.imagesWithPoorAlt}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Accessibility Score</span>
                        <Badge variant="outline">{analysisData.altTextMetrics.accessibilityScore}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Images Analyzed</span>
                        <Badge variant="outline">{analysisData.images.length}</Badge>
                      </div>
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
                                <Badge variant="outline" className="text-xs">
                                  {issue.affectedImages} images
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

            {/* Images Analysis */}
            {analysisData.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <span>Image Analysis</span>
                    <Badge variant="outline">{analysisData.images.length} images</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.images.map((image, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Image className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm break-all">{image.src}</span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-muted-foreground">
                              Alt: {image.alt || 'No alt text'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {image.recommendation}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getAccessibilityColor(image.accessibility)}`}>
                            {image.accessibility}
                          </Badge>
                          <Badge variant={image.status === 'good' ? 'default' : image.status === 'warning' ? 'secondary' : 'destructive'}>
                            {image.status}
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
</>
  )
}