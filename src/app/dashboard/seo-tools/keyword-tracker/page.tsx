"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, CheckCircle, AlertTriangle, Loader2, Download, ArrowLeft, TrendingUp, TrendingDown, Minus, Copy, Target, BarChart3, Eye, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { KeywordTrackingAnalysis } from '@/lib/seo-analysis'

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

interface KeywordData {
  keyword: string
  position: number
  previousPosition: number
  searchVolume: number
  difficulty: number
  url: string
  trend: 'up' | 'down' | 'stable'
  change: number
}

interface KeywordMetrics {
  totalKeywords: number
  averagePosition: number
  topRankings: number // positions 1-3
  firstPageRankings: number // positions 1-10
  improvingKeywords: number
  decliningKeywords: number
  stableKeywords: number
  totalSearchVolume: number
  averageDifficulty: number
}

interface Issue {
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  keywords?: string[]
}

interface Tip {
  category: 'optimization' | 'content' | 'technical' | 'monitoring'
  title: string
  description: string
  actionable: boolean
}

interface DetailedRecommendation {
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  estimatedImpact: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeframe: string
  keywords?: string[]
}

interface AnalysisData {
  url: string
  score: number
  recommendations: string[]
  keywords: KeywordData[]
  keywordMetrics: KeywordMetrics
  issues: Issue[]
  tips: Tip[]
  detailedRecommendations: DetailedRecommendation[]
}

export default function KeywordTrackerPage() {
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

  const generateEnhancedAnalysis = (basicData: KeywordTrackingAnalysis): AnalysisData => {
    // Transform the backend data to match frontend structure
    const keywords: KeywordData[] = basicData.trackedKeywords.map(kw => ({
      keyword: kw.keyword,
      position: kw.currentRank,
      previousPosition: kw.previousRank,
      searchVolume: kw.searchVolume,
      difficulty: kw.difficulty,
      url: kw.url,
      trend: kw.change > 0 ? 'up' : kw.change < 0 ? 'down' : 'stable',
      change: kw.change
    }))

    // Calculate metrics
    const keywordMetrics: KeywordMetrics = {
      totalKeywords: keywords.length,
      averagePosition: Math.round(keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length),
      topRankings: keywords.filter(k => k.position <= 3).length,
      firstPageRankings: keywords.filter(k => k.position <= 10).length,
      improvingKeywords: basicData.rankingChanges.improved,
      decliningKeywords: basicData.rankingChanges.declined,
      stableKeywords: keywords.filter(k => k.trend === 'stable').length,
      totalSearchVolume: keywords.reduce((sum, k) => sum + k.searchVolume, 0),
      averageDifficulty: Math.round(keywords.reduce((sum, k) => sum + k.difficulty, 0) / keywords.length)
    }

    // Generate issues
    const issues: Issue[] = []
    
    if (keywordMetrics.decliningKeywords > keywordMetrics.improvingKeywords) {
      issues.push({
        type: 'critical',
        title: 'More Keywords Declining Than Improving',
        description: `${keywordMetrics.decliningKeywords} keywords are losing positions while only ${keywordMetrics.improvingKeywords} are improving.`,
        impact: 'high',
        keywords: keywords.filter(k => k.trend === 'down').map(k => k.keyword)
      })
    }

    if (keywordMetrics.averagePosition > 10) {
      issues.push({
        type: 'warning',
        title: 'Poor Average Position',
        description: `Average keyword position is ${keywordMetrics.averagePosition}, which is beyond the first page of search results.`,
        impact: 'high'
      })
    }

    if (keywordMetrics.topRankings === 0) {
      issues.push({
        type: 'warning',
        title: 'No Top 3 Rankings',
        description: 'None of your tracked keywords are ranking in the top 3 positions.',
        impact: 'medium'
      })
    }

    const lowVolumeKeywords = keywords.filter(k => k.searchVolume < 1000)
    if (lowVolumeKeywords.length > 0) {
      issues.push({
        type: 'info',
        title: 'Low Search Volume Keywords',
        description: `${lowVolumeKeywords.length} keywords have very low search volume (< 1,000 monthly searches).`,
        impact: 'low',
        keywords: lowVolumeKeywords.map(k => k.keyword)
      })
    }

    // Generate tips
    const tips: Tip[] = [
      {
        category: 'optimization',
        title: 'Focus on Improving Keywords',
        description: 'Prioritize optimizing content for keywords that are close to moving up to the first page (positions 11-20).',
        actionable: true
      },
      {
        category: 'content',
        title: 'Create Topic Clusters',
        description: 'Group related keywords and create comprehensive content that targets multiple related terms.',
        actionable: true
      },
      {
        category: 'monitoring',
        title: 'Track Competitor Rankings',
        description: 'Monitor how your competitors are ranking for the same keywords to identify opportunities.',
        actionable: true
      },
      {
        category: 'technical',
        title: 'Optimize Page Load Speed',
        description: 'Faster loading pages tend to rank better. Optimize images, minify CSS/JS, and use CDN.',
        actionable: true
      }
    ]

    // Generate detailed recommendations
    const detailedRecommendations: DetailedRecommendation[] = [
      {
        priority: 'high',
        title: 'Improve Content for Declining Keywords',
        description: 'Update and enhance content for keywords that are losing positions. Add more comprehensive information, update statistics, and improve user experience.',
        estimatedImpact: '+15-25% in rankings',
        difficulty: 'medium',
        timeframe: '2-4 weeks',
        keywords: keywords.filter(k => k.trend === 'down').map(k => k.keyword)
      },
      {
        priority: 'high',
        title: 'Target Long-tail Variations',
        description: 'Expand your keyword portfolio by targeting long-tail variations of your main keywords to capture more specific search intent.',
        estimatedImpact: '+30-50% organic traffic',
        difficulty: 'easy',
        timeframe: '1-2 weeks'
      },
      {
        priority: 'medium',
        title: 'Build Topic Authority',
        description: 'Create comprehensive pillar pages and supporting content to establish topical authority in your niche.',
        estimatedImpact: '+20-35% in domain authority',
        difficulty: 'hard',
        timeframe: '6-8 weeks'
      },
      {
        priority: 'medium',
        title: 'Optimize Internal Linking',
        description: 'Improve internal linking structure to pass more authority to your target pages and help search engines understand content relationships.',
        estimatedImpact: '+10-20% in rankings',
        difficulty: 'easy',
        timeframe: '1 week'
      },
      {
        priority: 'low',
        title: 'Monitor SERP Features',
        description: 'Track and optimize for SERP features like featured snippets, local packs, and image results for your target keywords.',
        estimatedImpact: '+5-15% click-through rate',
        difficulty: 'medium',
        timeframe: '3-4 weeks'
      }
    ]

    return {
      ...basicData,
      keywords,
      keywordMetrics,
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
      const response = await fetch(`/api/tools/${selectedProject}/run-keyword-tracker`, {
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
          description: 'Keyword Tracker analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze keyword tracker',
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
      'Keyword,Position,Previous Position,Change,Trend,Search Volume,Difficulty,URL',
      ...analysisData.keywords.map(keyword => 
        `"${keyword.keyword}","${keyword.position}","${keyword.previousPosition}","${keyword.change}","${keyword.trend}","${keyword.searchVolume}","${keyword.difficulty}","${keyword.url}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keyword-tracker-analysis.csv'
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

  const getIssueIcon = (type: Issue['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getIssueColor = (type: Issue['type']) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'info': return 'border-blue-200 bg-blue-50'
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

  const getTrendIcon = (trend: string, change: number) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
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
              <h1 className="text-2xl font-bold">Keyword Tracker</h1>
              <p className="text-muted-foreground">Track keyword rankings and monitor your SEO performance over time</p>
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
              <span>Keyword Tracker Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze keyword rankings for SEO optimization
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
                    Analyzing Keywords...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Keywords
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Keyword Tracker Analysis Results</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={analysisData.score >= 80 ? 'default' : analysisData.score >= 60 ? 'secondary' : 'destructive'}>
                      Score: {analysisData.score}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analysisData.keywordMetrics.totalKeywords}</div>
                    <div className="text-sm text-blue-600">Total Keywords</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analysisData.keywordMetrics.averagePosition}</div>
                    <div className="text-sm text-green-600">Avg Position</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analysisData.keywordMetrics.firstPageRankings}</div>
                    <div className="text-sm text-purple-600">First Page</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{analysisData.keywordMetrics.improvingKeywords}</div>
                    <div className="text-sm text-orange-600">Improving</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Keyword Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Top Rankings (1-3)</p>
                        <p className="text-2xl font-bold text-green-700">{analysisData.keywordMetrics.topRankings}</p>
                      </div>
                      <Target className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Total Search Volume</p>
                        <p className="text-2xl font-bold text-blue-700">{analysisData.keywordMetrics.totalSearchVolume.toLocaleString()}</p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Avg Difficulty</p>
                        <p className="text-2xl font-bold text-purple-700">{analysisData.keywordMetrics.averageDifficulty}%</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Keywords List */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Tracked Keywords</h4>
                  {analysisData.keywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{keyword.keyword}</span>
                          {getTrendIcon(keyword.trend, keyword.change)}
                          <span className={`text-sm ${keyword.trend === 'up' ? 'text-green-600' : keyword.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                            {keyword.change > 0 ? `+${keyword.change}` : keyword.change}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {keyword.url} • {keyword.searchVolume.toLocaleString()} searches/month
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{keyword.position}</div>
                          <div className="text-xs text-gray-500">Position</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{keyword.difficulty}%</div>
                          <div className="text-xs text-gray-500">Difficulty</div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    {analysisData.issues.map((issue, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getIssueIcon(issue.type)}
                              <h4 className="font-semibold">{issue.title}</h4>
                              <Badge className={getPriorityColor(issue.impact)} variant="secondary">
                                {issue.impact} impact
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                            {issue.keywords && (
                              <div className="flex flex-wrap gap-1">
                                {issue.keywords.map((keyword, kidx) => (
                                  <Badge key={kidx} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Tips & Best Practices</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisData.tips.map((tip, index) => (
                    <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {tip.category}
                            </Badge>
                            {tip.actionable && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Actionable
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-green-800 mb-1">{tip.title}</h4>
                          <p className="text-sm text-green-700">{tip.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${tip.title}: ${tip.description}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span>Detailed Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.detailedRecommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(rec.priority)} variant="secondary">
                            {rec.priority} priority
                          </Badge>
                          <Badge className={getDifficultyColor(rec.difficulty)} variant="secondary">
                            {rec.difficulty}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{rec.timeframe}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${rec.title}: ${rec.description}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <h4 className="font-semibold text-blue-800 mb-2">{rec.title}</h4>
                      <p className="text-sm text-blue-700 mb-2">{rec.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 font-medium">Impact: {rec.estimatedImpact}</span>
                        {rec.keywords && (
                          <div className="flex flex-wrap gap-1">
                            {rec.keywords.slice(0, 3).map((keyword, kidx) => (
                              <Badge key={kidx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {rec.keywords.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{rec.keywords.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Original Recommendations */}
            {analysisData.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>General Recommendations</span>
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