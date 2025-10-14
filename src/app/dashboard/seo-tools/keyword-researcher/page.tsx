"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, CheckCircle, AlertTriangle, Loader2, Download, ArrowLeft, TrendingUp, Target, Lightbulb, AlertCircle, Copy, Info, BarChart3, Users, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { KeywordResearchAnalysis } from '@/lib/seo-analysis'

interface Project {
  _id: string
  projectName: string
  websiteURL: string
  title?: string
}

interface AnalysisData {
  url: string
  score: number
  recommendations: Array<{
    category: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: string
  }>
  // Exact keywords found
  primaryKeywords: Array<{
    keyword: string
    searchVolume: number
    difficulty: number
    cpc: number
    competition: string
  }>
  relatedKeywords: Array<{
    keyword: string
    searchVolume: number
    difficulty: number
    relevance: number
  }>
  longTailKeywords: Array<{
    keyword: string
    searchVolume: number
    difficulty: number
  }>
  // Enhanced analysis data
  keywordMetrics: {
    totalKeywords: number
    highVolumeKeywords: number
    lowCompetitionKeywords: number
    longTailKeywords: number
    brandedKeywords: number
    opportunityScore: number
  }
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    title: string
    description: string
    impact: string
    solution: string
    priority: 'high' | 'medium' | 'low'
    affectedKeywords: number | string
  }>
  tips: Array<{
    category: string
    title: string
    description: string
    implementation: string
    difficulty: 'easy' | 'medium' | 'hard'
    impact: 'high' | 'medium' | 'low'
  }>
  detailedRecommendations: Array<{
    category: string
    title: string
    description: string
    steps: string[]
    timeEstimate: string
    priority: 'high' | 'medium' | 'low'
    difficulty: 'easy' | 'medium' | 'hard'
    impact: string
  }>
}

export default function KeywordResearcherPage() {
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
      const response = await fetch('/api/seo-tool-projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      // silently handle project fetch error
    }
  }

  const generateEnhancedAnalysis = (basicData: {
    score?: number
    recommendations?: Array<{ category: string; priority: string; title: string; description: string; impact: string }>
    primaryKeywords?: Array<{ keyword: string; searchVolume: number; difficulty: number; cpc: number; competition: string }>
    relatedKeywords?: Array<{ keyword: string; searchVolume: number; difficulty: number; relevance: number }>
    longTailKeywords?: Array<{ keyword: string; searchVolume: number; difficulty: number }>
  }) => {
    const score = basicData.score || 0
    const primaryKeywords = basicData.primaryKeywords || []
    const relatedKeywords = basicData.relatedKeywords || []
    const longTailKeywords = basicData.longTailKeywords || []
    
    // Calculate real keyword metrics from actual data
    const totalKeywords = primaryKeywords.length + relatedKeywords.length + longTailKeywords.length
    const highVolumeKeywords = primaryKeywords.filter(k => k.searchVolume > 1000).length
    const lowCompetitionKeywords = primaryKeywords.filter(k => k.difficulty < 30).length
    const brandedKeywords = primaryKeywords.filter(k => k.keyword.toLowerCase().includes('brand') || k.keyword.toLowerCase().includes('company')).length
    
    const keywordMetrics = {
      totalKeywords,
      highVolumeKeywords,
      lowCompetitionKeywords,
      longTailKeywords: longTailKeywords.length,
      brandedKeywords,
      opportunityScore: score
    }

    // Generate issues based on actual keyword analysis
    const issues = []
    
    // Check for high-volume keyword opportunities
    if (highVolumeKeywords < 3 && primaryKeywords.length > 0) {
      const highVolumeKeywordsList = primaryKeywords.filter(k => k.searchVolume > 1000)
      const lowVolumeKeywordsList = primaryKeywords.filter(k => k.searchVolume <= 1000)
      issues.push({
        type: 'warning' as const,
        title: 'Limited High-Volume Keywords',
        description: `Only ${highVolumeKeywordsList.length} out of ${primaryKeywords.length} primary keywords have high search volume (>1000)`,
        impact: 'Missing opportunities for high-traffic keywords that could drive significant organic traffic',
        solution: 'Research and target more high-volume keywords in your niche. Focus on keywords with 1000+ monthly searches.',
        priority: 'high' as const,
        affectedKeywords: `Low volume keywords: ${lowVolumeKeywordsList.map(k => `"${k.keyword}" (${k.searchVolume})`).join(', ')}`
      })
    }

    // Check for keyword difficulty balance
    const highDifficultyKeywordsList = primaryKeywords.filter(k => k.difficulty > 70)
    if (highDifficultyKeywordsList.length > primaryKeywords.length * 0.7 && primaryKeywords.length > 0) {
      issues.push({
        type: 'error' as const,
        title: 'Too Many High-Difficulty Keywords',
        description: `${highDifficultyKeywordsList.length} out of ${primaryKeywords.length} keywords have high difficulty (>70)`,
        impact: 'High-difficulty keywords are harder to rank for and may require significant resources',
        solution: 'Balance your keyword portfolio with easier-to-rank keywords (difficulty <50) for quicker wins',
        priority: 'high' as const,
        affectedKeywords: `High difficulty keywords: ${highDifficultyKeywordsList.map(k => `"${k.keyword}" (${k.difficulty})`).join(', ')}`
      })
    }

    // Check for long-tail keyword opportunities
    if (longTailKeywords.length < totalKeywords * 0.4 && totalKeywords > 0) {
      const longTailKeywordNames = longTailKeywords.map(k => `"${k.keyword}"`).join(', ')
      issues.push({
        type: 'info' as const,
        title: 'Low Long-Tail Keyword Coverage',
        description: `Long-tail keywords represent only ${Math.round((longTailKeywords.length / totalKeywords) * 100)}% of your keyword portfolio`,
        impact: 'Long-tail keywords often have higher conversion rates and lower competition',
        solution: 'Focus on creating content around specific, longer keyword phrases (3+ words)',
        priority: 'medium' as const,
        affectedKeywords: longTailKeywords.length > 0 ? `Current long-tail keywords: ${longTailKeywordNames}` : 'No long-tail keywords found'
      })
    }

    // Check for low-competition opportunities
    if (lowCompetitionKeywords < primaryKeywords.length * 0.3 && primaryKeywords.length > 0) {
      const lowCompetitionKeywordsList = primaryKeywords.filter(k => k.difficulty < 30)
      const highCompetitionKeywordsList = primaryKeywords.filter(k => k.difficulty >= 30)
      issues.push({
        type: 'warning' as const,
        title: 'Few Low-Competition Opportunities',
        description: `Only ${lowCompetitionKeywordsList.length} out of ${primaryKeywords.length} keywords have low competition (difficulty <30)`,
        impact: 'Missing easy-to-rank opportunities that could provide quick SEO wins',
        solution: 'Use keyword difficulty tools to find easier-to-rank keywords in your niche',
        priority: 'medium' as const,
        affectedKeywords: `High competition keywords: ${highCompetitionKeywordsList.map(k => `"${k.keyword}" (${k.difficulty})`).join(', ')}`
      })
    }

    // Check for keyword diversity
    if (relatedKeywords.length < primaryKeywords.length * 0.5 && primaryKeywords.length > 0) {
      const relatedKeywordNames = relatedKeywords.map(k => `"${k.keyword}"`).join(', ')
      issues.push({
        type: 'info' as const,
        title: 'Limited Keyword Diversity',
        description: `Only ${relatedKeywords.length} related keywords found for ${primaryKeywords.length} primary keywords`,
        impact: 'Limited keyword diversity may restrict your content reach and topical authority',
        solution: 'Expand your keyword research to include more related and semantic keywords',
        priority: 'low' as const,
        affectedKeywords: relatedKeywords.length > 0 ? `Related keywords: ${relatedKeywordNames}` : 'No related keywords found'
      })
    }

    // Generate tips
    const tips = [
      {
        category: 'Keyword Research',
        title: 'Use Multiple Research Tools',
        description: 'Combine data from various keyword research tools for comprehensive insights',
        implementation: 'Use Google Keyword Planner, SEMrush, Ahrefs, and Ubersuggest together',
        difficulty: 'easy' as const,
        impact: 'high' as const
      },
      {
        category: 'Content Strategy',
        title: 'Focus on Search Intent',
        description: 'Align your keywords with user search intent (informational, navigational, transactional)',
        implementation: 'Categorize keywords by intent and create content that matches user expectations',
        difficulty: 'medium' as const,
        impact: 'high' as const
      },
      {
        category: 'Competition Analysis',
        title: 'Analyze Competitor Keywords',
        description: 'Study what keywords your competitors rank for to find gaps and opportunities',
        implementation: 'Use competitor analysis tools to identify their top-performing keywords',
        difficulty: 'medium' as const,
        impact: 'high' as const
      },
      {
        category: 'Long-Tail Strategy',
        title: 'Target Long-Tail Keywords',
        description: 'Focus on longer, more specific keyword phrases for better conversion rates',
        implementation: 'Create detailed content around specific problems and solutions',
        difficulty: 'easy' as const,
        impact: 'medium' as const
      },
      {
        category: 'Seasonal Trends',
        title: 'Monitor Keyword Trends',
        description: 'Track seasonal patterns and trending topics in your industry',
        implementation: 'Use Google Trends and industry reports to identify trending keywords',
        difficulty: 'easy' as const,
        impact: 'medium' as const
      }
    ]

    // Generate detailed recommendations
    const detailedRecommendations = []

    if (keywordMetrics.highVolumeKeywords < 30) {
      detailedRecommendations.push({
        category: 'Opportunity Expansion',
        title: 'Target More High-Volume Keywords',
        description: 'Expand your keyword portfolio to include more high-traffic opportunities',
        steps: [
          'Use keyword research tools to find high-volume keywords in your niche',
          'Analyze search volume trends and seasonality',
          'Assess keyword difficulty and competition levels',
          'Create content clusters around high-volume topics',
          'Monitor rankings and adjust strategy based on performance'
        ],
        timeEstimate: '2-3 weeks',
        priority: 'high' as const,
        difficulty: 'medium' as const,
        impact: 'Significant increase in organic traffic potential'
      })
    }

    detailedRecommendations.push({
      category: 'Content Optimization',
      title: 'Develop Long-Tail Keyword Strategy',
      description: 'Create comprehensive content targeting specific long-tail keywords',
      steps: [
        'Identify long-tail keyword opportunities using autocomplete and related searches',
        'Group related long-tail keywords into content themes',
        'Create in-depth, comprehensive content for each theme',
        'Optimize on-page elements for target long-tail keywords',
        'Build internal linking between related long-tail content'
      ],
      timeEstimate: '3-4 weeks',
      priority: 'medium' as const,
      difficulty: 'medium' as const,
      impact: 'Improved conversion rates and easier rankings'
    })

    if (keywordMetrics.lowCompetitionKeywords < 50) {
      detailedRecommendations.push({
        category: 'Quick Wins',
        title: 'Target Low-Competition Keywords',
        description: 'Focus on easier-to-rank keywords for quick SEO victories',
        steps: [
          'Use keyword difficulty tools to identify low-competition opportunities',
          'Prioritize keywords with decent search volume but low competition',
          'Create high-quality content targeting these keywords',
          'Optimize technical SEO elements for better rankings',
          'Monitor progress and scale successful strategies'
        ],
        timeEstimate: '2-3 weeks',
        priority: 'high' as const,
        difficulty: 'easy' as const,
        impact: 'Quick ranking improvements and traffic growth'
      })
    }

    return {
      keywordMetrics,
      issues,
      tips,
      detailedRecommendations
    }
  }

  // Helper functions
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast({
        title: 'Copied!',
        description: 'Text copied to clipboard',
        variant: 'success'
      })
    } catch (err) {
      showToast({
        title: 'Failed to copy',
        description: 'Could not copy text to clipboard',
        variant: 'destructive'
      })
    }
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'info': return <Info className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-800'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-800'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-800'
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800'
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
      const response = await fetch(`/api/tools/${selectedProject}/run-keyword-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (response.ok) {
        // Transform the KeywordResearchAnalysis data to match the expected structure
        const basicData = data.data as KeywordResearchAnalysis
        
        // Generate enhanced analysis
        const enhancedAnalysis = generateEnhancedAnalysis({
          score: basicData.score,
          recommendations: basicData.recommendations.map(rec => ({
            category: 'keyword-research',
            priority: 'medium',
            title: rec,
            description: rec,
            impact: 'medium'
          })),
          primaryKeywords: basicData.primaryKeywords,
          relatedKeywords: basicData.relatedKeywords,
          longTailKeywords: basicData.longTailKeywords
        })
        
        const transformedData = {
          url: basicData.url,
          score: basicData.score,
          recommendations: basicData.recommendations.map(rec => ({
            category: 'keyword-research',
            priority: 'medium' as 'high' | 'medium' | 'low',
            title: rec,
            description: rec,
            impact: 'medium'
          })),
          primaryKeywords: basicData.primaryKeywords,
          relatedKeywords: basicData.relatedKeywords,
          longTailKeywords: basicData.longTailKeywords,
          ...enhancedAnalysis
        }

        setAnalysisData(transformedData)
        showToast({
          title: 'Analysis Complete',
          description: 'Keyword research analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze keyword research',
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
      'URL,Score,Total Keywords,High Volume Keywords,Low Competition Keywords,Long Tail Keywords',
      `"${analysisData.url}","${analysisData.score}","${analysisData.keywordMetrics.totalKeywords}","${analysisData.keywordMetrics.highVolumeKeywords}","${analysisData.keywordMetrics.lowCompetitionKeywords}","${analysisData.keywordMetrics.longTailKeywords}"`
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keyword-research-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
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
              <h1 className="text-2xl font-bold">Keyword Researcher</h1>
              <p className="text-muted-foreground">Discover high-value keywords to improve your SEO strategy and content planning</p>
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
              <span>Keyword Research Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze keyword opportunities for SEO optimization
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
                        {project.title ?? project.projectName} - {project.websiteURL}
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
                  <span>Keyword Research Analysis Results</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={analysisData.score >= 80 ? 'default' : analysisData.score >= 60 ? 'secondary' : 'destructive'}>
                      Score: {analysisData.score}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analysisData.keywordMetrics.totalKeywords}</div>
                    <div className="text-sm text-blue-600">Total Keywords</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analysisData.keywordMetrics.highVolumeKeywords}</div>
                    <div className="text-sm text-green-600">High Volume</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analysisData.keywordMetrics.lowCompetitionKeywords}</div>
                    <div className="text-sm text-purple-600">Low Competition</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Metrics Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Keyword Portfolio Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Long-Tail Keywords</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">{analysisData.keywordMetrics.longTailKeywords}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((analysisData.keywordMetrics.longTailKeywords / analysisData.keywordMetrics.totalKeywords) * 100)}% of total
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Branded Keywords</span>
                      <Target className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">{analysisData.keywordMetrics.brandedKeywords}</div>
                    <div className="text-xs text-muted-foreground">Brand protection</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Opportunity Score</span>
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold">{analysisData.keywordMetrics.opportunityScore}/100</div>
                    <div className="text-xs text-muted-foreground">Growth potential</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exact Keywords Found */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-primary" />
                  <span>Exact Keywords Found</span>
                </CardTitle>
                <CardDescription>
                  Lists of keywords detected during analysis with key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Primary Keywords */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Primary Keywords</h4>
                      <Badge variant="outline">{analysisData.primaryKeywords?.length || 0}</Badge>
                    </div>
                    {analysisData.primaryKeywords && analysisData.primaryKeywords.length > 0 ? (
                      <div className="space-y-2">
                        {analysisData.primaryKeywords.map((k, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{k.keyword}</span>
                                <Badge variant="outline" className="text-xs capitalize">{k.competition}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {k.searchVolume.toLocaleString()} searches • {k.difficulty}% difficulty • CPC ${k.cpc.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No primary keywords found.</p>
                    )}
                  </div>

                  {/* Related Keywords */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Related Keywords</h4>
                      <Badge variant="outline">{analysisData.relatedKeywords?.length || 0}</Badge>
                    </div>
                    {analysisData.relatedKeywords && analysisData.relatedKeywords.length > 0 ? (
                      <div className="space-y-2">
                        {analysisData.relatedKeywords.map((k, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{k.keyword}</span>
                                <Badge variant="outline" className="text-xs">Relevance {Math.round(k.relevance)}%</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {k.searchVolume.toLocaleString()} searches • {k.difficulty}% difficulty
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No related keywords found.</p>
                    )}
                  </div>

                  {/* Long-Tail Keywords */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Long-Tail Keywords</h4>
                      <Badge variant="outline">{analysisData.longTailKeywords?.length || 0}</Badge>
                    </div>
                    {analysisData.longTailKeywords && analysisData.longTailKeywords.length > 0 ? (
                      <div className="space-y-2">
                        {analysisData.longTailKeywords.map((k, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{k.keyword}</span>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {k.searchVolume.toLocaleString()} searches • {k.difficulty}% difficulty
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No long-tail keywords found.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues Found */}
            {analysisData.issues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span>Issues Found</span>
                    <Badge variant="secondary">{analysisData.issues.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.issues.map((issue, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getIssueIcon(issue.type)}
                            <span className="font-medium">{issue.title}</span>
                          </div>
                          <Badge className={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{issue.description}</p>
                        <div className="text-xs space-y-1">
                          <p><strong>Impact:</strong> {issue.impact}</p>
                          <p><strong>Solution:</strong> {issue.solution}</p>
                          <p><strong>Affected Keywords:</strong> {issue.affectedKeywords}</p>
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
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span>Tips & Best Practices</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisData.tips.map((tip, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{tip.title}</span>
                        <div className="flex space-x-1">
                          <Badge className={getDifficultyColor(tip.difficulty)} variant="outline">
                            {tip.difficulty}
                          </Badge>
                          <Badge className={getPriorityColor(tip.impact)} variant="outline">
                            {tip.impact} impact
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                      <div className="text-xs">
                        <p><strong>Category:</strong> {tip.category}</p>
                        <p><strong>Implementation:</strong> {tip.implementation}</p>
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
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Detailed Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analysisData.detailedRecommendations.map((rec, index) => (
                    <div key={index} className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{rec.title}</h3>
                          <p className="text-sm text-muted-foreground">{rec.category}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          <Badge className={getDifficultyColor(rec.difficulty)} variant="outline">
                            {rec.difficulty}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-4">{rec.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Implementation Steps:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {rec.steps.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span><strong>Time Estimate:</strong> {rec.timeEstimate}</span>
                        <span><strong>Expected Impact:</strong> {rec.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Recommendations */}
            {analysisData.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Quick Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.recommendations.map((recommendation, index) => (
                      <Alert key={index}>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span>{recommendation.description}</span>
                            <Badge className={getPriorityColor(recommendation.priority)} variant="outline">
                              {recommendation.priority}
                            </Badge>
                          </div>
                        </AlertDescription>
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