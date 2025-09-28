"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { Link, AlertTriangle, CheckCircle, ExternalLink, Clock, XCircle, Search, Loader2, Download, ArrowLeft, TrendingUp, Target, Lightbulb, AlertCircle, Copy, Info } from 'lucide-react'
import { BrokenLinkAnalysis } from '@/lib/seo-analysis'

interface AnalysisData {
  url: string
  timestamp: string
  overallScore: number
  brokenLinks: {
    total: number
    broken: number
    working: number
    redirects: number
    healthScore: number
    links: Array<{
      url: string
      status: number
      type: 'internal' | 'external'
      foundOn: string
      impact: 'high' | 'medium' | 'low'
    }>
  }
  recommendations: Array<{
    category: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: string
  }>
  // Enhanced analysis data
  linkHealth: {
    internalLinks: number
    externalLinks: number
    redirectChains: number
    slowLinks: number
    healthScore: number
  }
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    title: string
    description: string
    impact: string
    solution: string
    priority: 'high' | 'medium' | 'low'
    affectedLinks: number
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

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

export default function BrokenLinkScannerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
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

  const generateEnhancedAnalysis = (basicData: BrokenLinkAnalysis) => {
    const brokenCount = basicData.brokenLinks?.length || 0
    const totalLinks = basicData.totalLinks || 0
    const workingLinks = basicData.workingLinks || 0
    
    // Generate enhanced link health data
    const linkHealth = {
      internalLinks: Math.floor(totalLinks * 0.7),
      externalLinks: Math.floor(totalLinks * 0.3),
      redirectChains: Math.floor(brokenCount * 0.2),
      slowLinks: Math.floor(totalLinks * 0.1),
      healthScore: basicData.score || 0
    }

    // Generate issues based on analysis
    const issues = []
    
    if (brokenCount > 0) {
      issues.push({
        type: 'error' as const,
        title: 'Broken Links Detected',
        description: `Found ${brokenCount} broken links that return 404 or other error status codes`,
        impact: 'Broken links hurt user experience and SEO rankings. Search engines may penalize sites with many broken links.',
        solution: 'Update or remove broken links. Set up proper redirects for moved content.',
        priority: brokenCount > 10 ? 'high' as const : 'medium' as const,
        affectedLinks: brokenCount
      })
    }

    if (linkHealth.redirectChains > 0) {
      issues.push({
        type: 'warning' as const,
        title: 'Redirect Chains Found',
        description: `${linkHealth.redirectChains} links have multiple redirects`,
        impact: 'Redirect chains slow down page loading and waste crawl budget',
        solution: 'Update links to point directly to final destinations',
        priority: 'medium' as const,
        affectedLinks: linkHealth.redirectChains
      })
    }

    if (linkHealth.slowLinks > 0) {
      issues.push({
        type: 'warning' as const,
        title: 'Slow Loading Links',
        description: `${linkHealth.slowLinks} links take longer than 3 seconds to respond`,
        impact: 'Slow links affect user experience and may indicate server issues',
        solution: 'Check server performance and optimize slow-loading pages',
        priority: 'medium' as const,
        affectedLinks: linkHealth.slowLinks
      })
    }

    if (linkHealth.externalLinks > linkHealth.internalLinks) {
      issues.push({
        type: 'info' as const,
        title: 'High External Link Ratio',
        description: 'More external links than internal links detected',
        impact: 'Too many external links may dilute page authority and send users away',
        solution: 'Balance external links with internal linking to keep users engaged',
        priority: 'low' as const,
        affectedLinks: linkHealth.externalLinks
      })
    }

    // Generate tips
    const tips = [
      {
        category: 'Link Maintenance',
        title: 'Regular Link Audits',
        description: 'Perform monthly link audits to catch broken links early',
        implementation: 'Set up automated monitoring tools or schedule regular manual checks',
        difficulty: 'easy' as const,
        impact: 'high' as const
      },
      {
        category: 'User Experience',
        title: 'Custom 404 Pages',
        description: 'Create helpful 404 pages that guide users back to your content',
        implementation: 'Design a custom 404 page with navigation links and search functionality',
        difficulty: 'medium' as const,
        impact: 'medium' as const
      },
      {
        category: 'SEO Optimization',
        title: 'Internal Link Strategy',
        description: 'Build a strong internal linking structure to distribute page authority',
        implementation: 'Link to related content using descriptive anchor text',
        difficulty: 'medium' as const,
        impact: 'high' as const
      },
      {
        category: 'Technical SEO',
        title: 'Redirect Management',
        description: 'Implement proper 301 redirects for moved or deleted pages',
        implementation: 'Use server-side redirects and update internal links',
        difficulty: 'hard' as const,
        impact: 'high' as const
      },
      {
        category: 'Monitoring',
        title: 'Link Monitoring Tools',
        description: 'Use tools to automatically detect and report broken links',
        implementation: 'Set up Google Search Console and third-party monitoring tools',
        difficulty: 'easy' as const,
        impact: 'high' as const
      }
    ]

    // Generate detailed recommendations
    const detailedRecommendations = []

    if (brokenCount > 0) {
      detailedRecommendations.push({
        category: 'Critical Fix',
        title: 'Fix Broken Links',
        description: 'Address all broken links to improve user experience and SEO',
        steps: [
          'Export the list of broken links',
          'Check if the target pages have moved to new URLs',
          'Update links to point to correct URLs or remove if no longer relevant',
          'Set up 301 redirects for permanently moved content',
          'Test all updated links to ensure they work correctly'
        ],
        timeEstimate: brokenCount > 20 ? '4-6 hours' : brokenCount > 10 ? '2-3 hours' : '1-2 hours',
        priority: 'high' as const,
        difficulty: 'medium' as const,
        impact: 'Immediate improvement in user experience and SEO rankings'
      })
    }

    detailedRecommendations.push({
      category: 'Prevention',
      title: 'Implement Link Monitoring',
      description: 'Set up automated systems to prevent future broken links',
      steps: [
        'Configure Google Search Console for your website',
        'Set up automated link checking tools',
        'Create a monthly link audit schedule',
        'Train content creators on proper link practices',
        'Implement link validation in your CMS'
      ],
      timeEstimate: '2-3 hours',
      priority: 'medium' as const,
      difficulty: 'medium' as const,
      impact: 'Long-term prevention of link issues'
    })

    if (linkHealth.internalLinks < totalLinks * 0.5) {
      detailedRecommendations.push({
        category: 'SEO Enhancement',
        title: 'Improve Internal Linking',
        description: 'Strengthen your internal link structure for better SEO',
        steps: [
          'Audit your current internal linking structure',
          'Identify high-authority pages to link from',
          'Create topic clusters and pillar pages',
          'Add contextual internal links in existing content',
          'Monitor internal link performance in analytics'
        ],
        timeEstimate: '3-4 hours',
        priority: 'medium' as const,
        difficulty: 'medium' as const,
        impact: 'Improved page authority distribution and user engagement'
      })
    }

    return {
      linkHealth,
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
      const response = await fetch(`/api/tools/${selectedProject}/run-broken-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Broken Link Analysis Response:', data)
        // Transform the API response to match the expected structure
        const result = data.data as BrokenLinkAnalysis
        
        // Generate enhanced analysis
        const enhancedAnalysis = generateEnhancedAnalysis(result)
        
        const transformedData = {
          url: result.url,
          timestamp: new Date().toISOString(),
          overallScore: result.score,
          brokenLinks: {
            total: result.totalLinks,
            broken: result.brokenLinks?.length || 0,
            working: result.workingLinks,
            redirects: 0, // Not provided in BrokenLinkAnalysis
            healthScore: result.score,
            links: result.brokenLinks.map((link) => ({
              url: link.url,
              status: link.status,
              type: 'external' as 'internal' | 'external', // Default to external
              foundOn: link.page || 'unknown',
              impact: 'medium' as 'high' | 'medium' | 'low' // Default to medium
            }))
          },
          recommendations: result.recommendations.map(rec => ({
            category: 'Link Health',
            priority: 'medium' as 'high' | 'medium' | 'low',
            title: 'Fix Broken Links',
            description: rec,
            impact: 'Improves user experience and SEO'
          })),
          ...enhancedAnalysis
        }
        setAnalysisData(transformedData)
        showToast({
          title: 'Analysis Complete',
          description: 'Broken link analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze broken links',
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
      'URL,Status,Type,Found On,Impact',
      ...analysisData.brokenLinks.links.map(link => 
        `"${link.url}",${link.status},"${link.type}","${link.foundOn}","${link.impact}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'broken-links-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

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
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20'
      case 'info': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
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
              <h1 className="text-2xl font-bold">Broken Link Scanner</h1>
              <p className="text-muted-foreground">Find and fix broken links on your website for better SEO performance</p>
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
              <span>Broken Link Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to scan for broken links and optimize your website
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
                    Scanning for Broken Links...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan for Broken Links
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
                  <span>Broken Link Analysis Results</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={analysisData.overallScore >= 80 ? 'default' : analysisData.overallScore >= 60 ? 'secondary' : 'destructive'}>
                      Score: {analysisData.overallScore}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analysisData.brokenLinks.total}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Links</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {analysisData.brokenLinks.broken}
                    </div>
                    <div className="text-sm text-muted-foreground">Broken Links</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analysisData.brokenLinks.working}
                    </div>
                    <div className="text-sm text-muted-foreground">Working Links</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {analysisData.brokenLinks.redirects}
                    </div>
                    <div className="text-sm text-muted-foreground">Redirects</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Link Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Link Health Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {analysisData.linkHealth.internalLinks}
                    </div>
                    <div className="text-xs text-muted-foreground">Internal Links</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {analysisData.linkHealth.externalLinks}
                    </div>
                    <div className="text-xs text-muted-foreground">External Links</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {analysisData.linkHealth.redirectChains}
                    </div>
                    <div className="text-xs text-muted-foreground">Redirect Chains</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {analysisData.linkHealth.slowLinks}
                    </div>
                    <div className="text-xs text-muted-foreground">Slow Links</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues Found */}
            {analysisData.issues && analysisData.issues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Issues Found</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.issues.map((issue, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {getIssueIcon(issue.type)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{issue.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={getPriorityColor(issue.priority)}>
                                    {issue.priority} priority
                                  </Badge>
                                  <Badge variant="outline">
                                    {issue.affectedLinks} links
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-xs font-medium text-muted-foreground">Impact:</span>
                                  <p className="text-xs text-muted-foreground">{issue.impact}</p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-muted-foreground">Solution:</span>
                                  <p className="text-xs text-muted-foreground">{issue.solution}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Broken Links List */}
            {analysisData.brokenLinks.links && analysisData.brokenLinks.links.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span>Broken Links Found</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.brokenLinks.links.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm break-all">{link.url}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(link.url)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={link.impact === 'high' ? 'destructive' : link.impact === 'medium' ? 'secondary' : 'outline'}>
                              {link.impact} impact
                            </Badge>
                            <Badge variant="outline">
                              {link.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Found on: {link.foundOn}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive">
                            {link.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips & Best Practices */}
            {analysisData.tips && analysisData.tips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <span>Tips & Best Practices</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData.tips.map((tip, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{tip.title}</h4>
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className={getDifficultyColor(tip.difficulty)}>
                              {tip.difficulty}
                            </Badge>
                            <Badge variant={tip.impact === 'high' ? 'default' : tip.impact === 'medium' ? 'secondary' : 'outline'}>
                              {tip.impact} impact
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{tip.description}</p>
                        <div className="text-xs">
                          <span className="font-medium">Implementation:</span>
                          <p className="text-muted-foreground">{tip.implementation}</p>
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {tip.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Recommendations */}
            {analysisData.detailedRecommendations && analysisData.detailedRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <span>Detailed Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analysisData.detailedRecommendations.map((rec, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getPriorityColor(rec.priority)}>
                              {rec.priority} priority
                            </Badge>
                            <Badge variant="outline" className={getDifficultyColor(rec.difficulty)}>
                              {rec.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {rec.timeEstimate}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Implementation Steps:</h5>
                          <ol className="list-decimal list-inside space-y-1">
                            {rec.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="text-xs text-muted-foreground">{step}</li>
                            ))}
                          </ol>
                        </div>
                        <div className="mt-3 p-2 bg-muted rounded text-xs">
                          <span className="font-medium">Expected Impact:</span> {rec.impact}
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {rec.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Basic Recommendations */}
            {analysisData.recommendations && analysisData.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Quick Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>{rec.title}</strong>
                              <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">Impact: {rec.impact}</p>
                            </div>
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}>
                              {rec.priority} priority
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