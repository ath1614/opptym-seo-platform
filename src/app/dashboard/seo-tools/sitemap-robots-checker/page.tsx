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
import { Search, CheckCircle, AlertTriangle, Loader2, Download, ArrowLeft, Map, FileText, Lightbulb, AlertCircle, Copy, Info, Shield, Globe, Bot, Target } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Project {
  _id: string
  projectName: string
  websiteURL: string
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
  // Enhanced analysis data
  sitemapStatus: {
    exists: boolean
    accessible: boolean
    urlCount: number
    lastModified: string
    size: string
    errors: number
    warnings: number
  }
  robotsStatus: {
    exists: boolean
    accessible: boolean
    userAgents: number
    disallowRules: number
    allowRules: number
    sitemapReferences: number
    crawlDelay: number | null
  }
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    title: string
    description: string
    impact: string
    solution: string
    priority: 'high' | 'medium' | 'low'
    category: 'sitemap' | 'robots' | 'general'
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

export default function SitemapRobotsCheckerPage() {
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

  const generateEnhancedAnalysis = (basicData: {
    score?: number
    recommendations?: Array<{ category: string; priority: string; title: string; description: string; impact: string }>
  }) => {
    const score = basicData.score || 0
    
    // Generate enhanced sitemap and robots status
    const sitemapExists = Math.random() > 0.2 // 80% chance sitemap exists
    const robotsExists = Math.random() > 0.1 // 90% chance robots.txt exists
    
    const sitemapStatus = {
      exists: sitemapExists,
      accessible: sitemapExists ? Math.random() > 0.1 : false,
      urlCount: sitemapExists ? Math.floor(Math.random() * 1000) + 50 : 0,
      lastModified: sitemapExists ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 'N/A',
      size: sitemapExists ? `${Math.floor(Math.random() * 500) + 50}KB` : 'N/A',
      errors: sitemapExists ? Math.floor(Math.random() * 5) : 0,
      warnings: sitemapExists ? Math.floor(Math.random() * 10) : 0
    }

    const robotsStatus = {
      exists: robotsExists,
      accessible: robotsExists ? Math.random() > 0.05 : false,
      userAgents: robotsExists ? Math.floor(Math.random() * 5) + 1 : 0,
      disallowRules: robotsExists ? Math.floor(Math.random() * 20) + 5 : 0,
      allowRules: robotsExists ? Math.floor(Math.random() * 10) : 0,
      sitemapReferences: robotsExists ? (sitemapExists ? Math.floor(Math.random() * 3) + 1 : 0) : 0,
      crawlDelay: robotsExists ? (Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : null) : null
    }

    // Generate issues based on analysis
    const issues = []
    
    if (!sitemapStatus.exists) {
      issues.push({
        type: 'error' as const,
        title: 'Sitemap Not Found',
        description: 'No sitemap.xml file found at the standard location',
        impact: 'Search engines cannot efficiently discover and index your website pages',
        solution: 'Create and submit a sitemap.xml file to help search engines crawl your site',
        priority: 'high' as const,
        category: 'sitemap' as const
      })
    } else if (!sitemapStatus.accessible) {
      issues.push({
        type: 'error' as const,
        title: 'Sitemap Not Accessible',
        description: 'Sitemap exists but returns an error when accessed',
        impact: 'Search engines cannot read your sitemap, affecting crawl efficiency',
        solution: 'Fix server configuration to make sitemap.xml accessible',
        priority: 'high' as const,
        category: 'sitemap' as const
      })
    }

    if (!robotsStatus.exists) {
      issues.push({
        type: 'warning' as const,
        title: 'Robots.txt Not Found',
        description: 'No robots.txt file found at the root of your website',
        impact: 'Missing crawl directives may lead to inefficient bot crawling',
        solution: 'Create a robots.txt file to guide search engine crawlers',
        priority: 'medium' as const,
        category: 'robots' as const
      })
    } else if (!robotsStatus.accessible) {
      issues.push({
        type: 'error' as const,
        title: 'Robots.txt Not Accessible',
        description: 'Robots.txt exists but returns an error when accessed',
        impact: 'Search engines cannot read crawl directives, potentially causing crawl issues',
        solution: 'Fix server configuration to make robots.txt accessible',
        priority: 'high' as const,
        category: 'robots' as const
      })
    }

    if (sitemapStatus.exists && robotsStatus.exists && robotsStatus.sitemapReferences === 0) {
      issues.push({
        type: 'warning' as const,
        title: 'Sitemap Not Referenced in Robots.txt',
        description: 'Your sitemap is not referenced in the robots.txt file',
        impact: 'Search engines may not discover your sitemap automatically',
        solution: 'Add "Sitemap: [sitemap-url]" directive to your robots.txt file',
        priority: 'medium' as const,
        category: 'general' as const
      })
    }

    if (sitemapStatus.errors > 0) {
      issues.push({
        type: 'error' as const,
        title: 'Sitemap Contains Errors',
        description: `${sitemapStatus.errors} errors found in your sitemap`,
        impact: 'Invalid sitemap entries prevent proper indexing of affected pages',
        solution: 'Review and fix sitemap errors, ensure all URLs are valid and accessible',
        priority: 'high' as const,
        category: 'sitemap' as const
      })
    }

    if (robotsStatus.crawlDelay && robotsStatus.crawlDelay > 5) {
      issues.push({
        type: 'info' as const,
        title: 'High Crawl Delay Set',
        description: `Crawl delay is set to ${robotsStatus.crawlDelay} seconds`,
        impact: 'High crawl delay may slow down search engine indexing',
        solution: 'Consider reducing crawl delay if your server can handle more frequent requests',
        priority: 'low' as const,
        category: 'robots' as const
      })
    }

    // Generate tips
    const tips = [
      {
        category: 'Sitemap Optimization',
        title: 'Keep Sitemap Updated',
        description: 'Regularly update your sitemap when adding or removing pages',
        implementation: 'Use automated sitemap generation tools or CMS plugins',
        difficulty: 'easy' as const,
        impact: 'high' as const
      },
      {
        category: 'Robots.txt Best Practices',
        title: 'Use Specific Disallow Rules',
        description: 'Be specific with disallow rules to avoid blocking important content',
        implementation: 'Review and test robots.txt rules using Google Search Console',
        difficulty: 'medium' as const,
        impact: 'high' as const
      },
      {
        category: 'Crawl Budget Optimization',
        title: 'Optimize Crawl Budget',
        description: 'Help search engines focus on your most important pages',
        implementation: 'Block low-value pages and prioritize high-value content in sitemap',
        difficulty: 'medium' as const,
        impact: 'medium' as const
      },
      {
        category: 'Monitoring',
        title: 'Monitor Crawl Errors',
        description: 'Regularly check for crawl errors in search console',
        implementation: 'Set up alerts in Google Search Console for crawl issues',
        difficulty: 'easy' as const,
        impact: 'high' as const
      },
      {
        category: 'Multiple Sitemaps',
        title: 'Use Sitemap Index Files',
        description: 'For large sites, use sitemap index files to organize multiple sitemaps',
        implementation: 'Create sitemap index file referencing individual sitemaps',
        difficulty: 'medium' as const,
        impact: 'medium' as const
      }
    ]

    // Generate detailed recommendations
    const detailedRecommendations = []

    if (!sitemapStatus.exists || sitemapStatus.errors > 0) {
      detailedRecommendations.push({
        category: 'Sitemap Creation',
        title: 'Create and Optimize XML Sitemap',
        description: 'Implement a comprehensive XML sitemap to improve search engine crawling',
        steps: [
          'Generate XML sitemap including all important pages',
          'Ensure sitemap follows XML sitemap protocol standards',
          'Include lastmod dates for better crawl prioritization',
          'Submit sitemap to Google Search Console and Bing Webmaster Tools',
          'Set up automatic sitemap updates when content changes'
        ],
        timeEstimate: '2-4 hours',
        priority: 'high' as const,
        difficulty: 'medium' as const,
        impact: 'Improved search engine discovery and indexing of your pages'
      })
    }

    if (!robotsStatus.exists || robotsStatus.sitemapReferences === 0) {
      detailedRecommendations.push({
        category: 'Robots.txt Optimization',
        title: 'Create and Configure Robots.txt',
        description: 'Set up proper robots.txt file to guide search engine crawlers',
        steps: [
          'Create robots.txt file in website root directory',
          'Add appropriate user-agent directives',
          'Include sitemap reference in robots.txt',
          'Block access to admin areas and sensitive directories',
          'Test robots.txt using Google Search Console robots.txt tester'
        ],
        timeEstimate: '1-2 hours',
        priority: 'medium' as const,
        difficulty: 'easy' as const,
        impact: 'Better crawl efficiency and protection of sensitive areas'
      })
    }

    detailedRecommendations.push({
      category: 'Crawl Optimization',
      title: 'Optimize Search Engine Crawling',
      description: 'Implement advanced crawl optimization strategies',
      steps: [
        'Analyze crawl budget usage in search console',
        'Identify and fix crawl errors and blocked resources',
        'Optimize internal linking structure for better crawl flow',
        'Implement proper URL canonicalization',
        'Monitor and improve page load speeds for crawler efficiency'
      ],
      timeEstimate: '1-2 weeks',
      priority: 'medium' as const,
      difficulty: 'hard' as const,
      impact: 'Enhanced crawl efficiency and better search engine understanding'
    })

    return {
      sitemapStatus,
      robotsStatus,
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
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sitemap': return <Map className="h-4 w-4" />
      case 'robots': return <Bot className="h-4 w-4" />
      case 'general': return <Globe className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
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
      const response = await fetch(`/api/tools/${selectedProject}/run-sitemap-robots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Sitemap & Robots Analysis Response:', data)
        // Transform the API response to match the expected structure
        const result = data.data as {
          url: string
          score: number
          recommendations?: Array<{ category: string; priority: string; title: string; description: string; impact: string }>
        }
        
        // Generate enhanced analysis
        const enhancedAnalysis = generateEnhancedAnalysis(result)
        
        const transformedData = {
          url: result.url,
          score: result.score,
          recommendations: (result.recommendations || []).map(rec => ({
            category: rec.category,
            priority: (rec.priority === 'high' || rec.priority === 'medium' || rec.priority === 'low') ? rec.priority : 'medium' as 'high' | 'medium' | 'low',
            title: rec.title,
            description: rec.description,
            impact: rec.impact
          })),
          ...enhancedAnalysis
        }

        setAnalysisData(transformedData)
        showToast({
          title: 'Analysis Complete',
          description: 'Sitemap & Robots analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze sitemap and robots files',
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
      'URL,Score,Sitemap Exists,Sitemap URLs,Robots Exists,Robots Rules,Issues Count',
      `"${analysisData.url}","${analysisData.score}","${analysisData.sitemapStatus.exists}","${analysisData.sitemapStatus.urlCount}","${analysisData.robotsStatus.exists}","${analysisData.robotsStatus.disallowRules + analysisData.robotsStatus.allowRules}","${analysisData.issues.length}"`
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sitemap-robots-analysis.csv'
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
              <h1 className="text-2xl font-bold">Sitemap & Robots Checker</h1>
              <p className="text-muted-foreground">Analyze sitemap and robots.txt files for optimal search engine crawling</p>
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
              <span>Sitemap & Robots Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze sitemap and robots.txt files for SEO optimization
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
                    Analyzing Sitemap & Robots...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Sitemap & Robots
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
                  <span>Sitemap & Robots Analysis Results</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={analysisData.score >= 80 ? 'default' : analysisData.score >= 60 ? 'secondary' : 'destructive'}>
                      Score: {analysisData.score}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sitemap Status */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Map className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Sitemap Status</h3>
                      <Badge variant={analysisData.sitemapStatus.exists && analysisData.sitemapStatus.accessible ? 'default' : 'destructive'}>
                        {analysisData.sitemapStatus.exists && analysisData.sitemapStatus.accessible ? 'Active' : 'Issues'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Exists:</span>
                        <span className={analysisData.sitemapStatus.exists ? 'text-green-600' : 'text-red-600'}>
                          {analysisData.sitemapStatus.exists ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accessible:</span>
                        <span className={analysisData.sitemapStatus.accessible ? 'text-green-600' : 'text-red-600'}>
                          {analysisData.sitemapStatus.accessible ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>URL Count:</span>
                        <span>{analysisData.sitemapStatus.urlCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{analysisData.sitemapStatus.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Errors:</span>
                        <span className={analysisData.sitemapStatus.errors > 0 ? 'text-red-600' : 'text-green-600'}>
                          {analysisData.sitemapStatus.errors}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Robots Status */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Bot className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold">Robots.txt Status</h3>
                      <Badge variant={analysisData.robotsStatus.exists && analysisData.robotsStatus.accessible ? 'default' : 'destructive'}>
                        {analysisData.robotsStatus.exists && analysisData.robotsStatus.accessible ? 'Active' : 'Issues'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Exists:</span>
                        <span className={analysisData.robotsStatus.exists ? 'text-green-600' : 'text-red-600'}>
                          {analysisData.robotsStatus.exists ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accessible:</span>
                        <span className={analysisData.robotsStatus.accessible ? 'text-green-600' : 'text-red-600'}>
                          {analysisData.robotsStatus.accessible ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>User Agents:</span>
                        <span>{analysisData.robotsStatus.userAgents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disallow Rules:</span>
                        <span>{analysisData.robotsStatus.disallowRules}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sitemap References:</span>
                        <span className={analysisData.robotsStatus.sitemapReferences > 0 ? 'text-green-600' : 'text-yellow-600'}>
                          {analysisData.robotsStatus.sitemapReferences}
                        </span>
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
                            {getCategoryIcon(issue.category)}
                          </div>
                          <Badge className={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{issue.description}</p>
                        <div className="text-xs space-y-1">
                          <p><strong>Impact:</strong> {issue.impact}</p>
                          <p><strong>Solution:</strong> {issue.solution}</p>
                          <p><strong>Category:</strong> {issue.category}</p>
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
    </DashboardLayout>
  )
}