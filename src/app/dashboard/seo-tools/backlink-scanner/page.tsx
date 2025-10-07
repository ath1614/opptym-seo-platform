"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { ExternalLink, TrendingUp, Shield, AlertTriangle, CheckCircle, Globe, Users, Search, Loader2, Info, ArrowLeft, Download, Copy, Target, BarChart3, Zap, BookOpen, Lightbulb, AlertCircle, XCircle } from 'lucide-react'
import { BacklinkAnalysis } from '@/lib/seo-analysis'

interface Backlink {
  _id: string
  sourceUrl: string
  targetUrl: string
  sourceDomain: string
  anchorText?: string
  linkType: string
  domainAuthority?: number
  linkQuality: string
  discoveredAt: string
  title?: string
}

interface BacklinkStats {
  totalBacklinks: number
  highQuality: number
  mediumQuality: number
  lowQuality: number
  toxicLinks: number
  avgDomainAuthority: number
  uniqueDomains: number
}

interface BacklinkProfile {
  authorityScore: number
  diversityScore: number
  qualityRatio: number
  toxicRatio: number
  anchorTextDiversity: number
  domainDiversity: number
  linkVelocity: string
  riskLevel: 'low' | 'medium' | 'high'
}

interface Issue {
  type: 'error' | 'warning' | 'info'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  priority: 'high' | 'medium' | 'low'
}

interface Tip {
  category: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface DetailedRecommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'hard'
  impact: string
  steps: string[]
}

interface AnalysisData {
  backlinks: Backlink[]
  stats: BacklinkStats
  backlinkProfile: BacklinkProfile
  issues: Issue[]
  tips: Tip[]
  detailedRecommendations: DetailedRecommendation[]
}

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

export default function BacklinkScannerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [isScanning, setIsScanning] = useState(false)
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

  const generateEnhancedAnalysis = (basicData: BacklinkAnalysis): AnalysisData => {
    // Convert BacklinkAnalysis to expected format
    const backlinks: Backlink[] = basicData.backlinks.map((link, index) => ({
      _id: `backlink-${index}`,
      sourceUrl: link.url,
      targetUrl: basicData.url,
      sourceDomain: link.domain,
      anchorText: link.anchorText,
      linkType: link.linkType,
      domainAuthority: link.domainAuthority,
      linkQuality: link.domainAuthority > 70 ? 'high' : link.domainAuthority > 40 ? 'medium' : 'low',
      discoveredAt: new Date().toISOString(),
      title: `Link from ${link.domain}`
    }))

    const stats: BacklinkStats = {
      totalBacklinks: basicData.totalBacklinks,
      highQuality: backlinks.filter(b => b.linkQuality === 'high').length,
      mediumQuality: backlinks.filter(b => b.linkQuality === 'medium').length,
      lowQuality: backlinks.filter(b => b.linkQuality === 'low').length,
      toxicLinks: backlinks.filter(b => b.domainAuthority && b.domainAuthority < 20).length,
      avgDomainAuthority: backlinks.reduce((sum, b) => sum + (b.domainAuthority || 0), 0) / Math.max(1, backlinks.length),
      uniqueDomains: basicData.referringDomains
    }
    
    // Calculate backlink profile metrics
    const authorityScore = Math.round((stats.avgDomainAuthority || 0) * 1.2)
    const qualityRatio = stats.totalBacklinks > 0 ? (stats.highQuality / stats.totalBacklinks) * 100 : 0
    const toxicRatio = stats.totalBacklinks > 0 ? (stats.toxicLinks / stats.totalBacklinks) * 100 : 0
    const diversityScore = Math.min(100, (stats.uniqueDomains / Math.max(1, stats.totalBacklinks)) * 200)
    
    const backlinkProfile: BacklinkProfile = {
      authorityScore: Math.min(100, authorityScore),
      diversityScore: Math.round(diversityScore),
      qualityRatio: Math.round(qualityRatio),
      toxicRatio: Math.round(toxicRatio),
      anchorTextDiversity: Math.round(Math.random() * 40 + 60), // Mock data
      domainDiversity: Math.round(diversityScore),
      linkVelocity: stats.totalBacklinks > 50 ? 'high' : stats.totalBacklinks > 20 ? 'medium' : 'low',
      riskLevel: toxicRatio > 10 ? 'high' : toxicRatio > 5 ? 'medium' : 'low'
    }

    // Generate issues based on analysis
    const issues: Issue[] = []
    
    if (stats.toxicLinks > 0) {
      issues.push({
        type: 'error',
        title: 'Toxic Backlinks Detected',
        description: `Found ${stats.toxicLinks} potentially harmful backlinks that could negatively impact your SEO rankings.`,
        impact: 'high',
        priority: 'high'
      })
    }

    if (qualityRatio < 30) {
      issues.push({
        type: 'warning',
        title: 'Low Quality Backlink Ratio',
        description: `Only ${Math.round(qualityRatio)}% of your backlinks are high quality. Aim for at least 30% high-quality links.`,
        impact: 'medium',
        priority: 'medium'
      })
    }

    if (stats.uniqueDomains < 10) {
      issues.push({
        type: 'warning',
        title: 'Limited Domain Diversity',
        description: `Your backlinks come from only ${stats.uniqueDomains} unique domains. Diversify your link sources for better SEO.`,
        impact: 'medium',
        priority: 'medium'
      })
    }

    if (backlinkProfile.anchorTextDiversity < 50) {
      issues.push({
        type: 'info',
        title: 'Improve Anchor Text Diversity',
        description: 'Your anchor text diversity could be improved to avoid over-optimization penalties.',
        impact: 'low',
        priority: 'low'
      })
    }

    // Generate tips
    const tips: Tip[] = [
      {
        category: 'Link Building',
        title: 'Focus on High-Authority Domains',
        description: 'Target websites with domain authority above 50 for maximum SEO impact.',
        difficulty: 'medium'
      },
      {
        category: 'Content Strategy',
        title: 'Create Linkable Assets',
        description: 'Develop high-quality content like infographics, research studies, and tools that naturally attract backlinks.',
        difficulty: 'hard'
      },
      {
        category: 'Outreach',
        title: 'Build Relationships',
        description: 'Engage with industry influencers and bloggers to build genuine relationships for natural link opportunities.',
        difficulty: 'medium'
      },
      {
        category: 'Monitoring',
        title: 'Regular Backlink Audits',
        description: 'Conduct monthly backlink audits to identify and disavow toxic links before they harm your rankings.',
        difficulty: 'easy'
      },
      {
        category: 'Anchor Text',
        title: 'Diversify Anchor Text',
        description: 'Use a mix of branded, generic, and keyword-rich anchor text to maintain a natural link profile.',
        difficulty: 'easy'
      }
    ]

    // Generate detailed recommendations
    const detailedRecommendations: DetailedRecommendation[] = []

    if (stats.toxicLinks > 0) {
      detailedRecommendations.push({
        title: 'Disavow Toxic Backlinks',
        description: 'Remove or disavow harmful backlinks to protect your site\'s authority and rankings.',
        priority: 'high',
        difficulty: 'medium',
        impact: 'Prevents negative SEO impact and potential ranking penalties',
        steps: [
          'Export list of toxic backlinks',
          'Contact webmasters to request link removal',
          'Create disavow file for remaining toxic links',
          'Submit disavow file to Google Search Console',
          'Monitor for removal and ranking improvements'
        ]
      })
    }

    if (qualityRatio < 50) {
      detailedRecommendations.push({
        title: 'Improve Backlink Quality',
        description: 'Focus on acquiring high-quality backlinks from authoritative and relevant websites.',
        priority: 'high',
        difficulty: 'hard',
        impact: 'Significantly improves domain authority and search rankings',
        steps: [
          'Identify high-authority websites in your niche',
          'Create valuable, shareable content',
          'Reach out with personalized outreach emails',
          'Offer guest posting opportunities',
          'Build relationships with industry influencers'
        ]
      })
    }

    detailedRecommendations.push({
      title: 'Diversify Link Sources',
      description: 'Expand your backlink portfolio across different domains and content types.',
      priority: 'medium',
      difficulty: 'medium',
      impact: 'Creates a more natural and robust link profile',
      steps: [
        'Analyze competitor backlink profiles',
        'Identify new link opportunities',
        'Create diverse content formats (blogs, infographics, videos)',
        'Engage in industry forums and communities',
        'Participate in relevant online events and webinars'
      ]
    })

    return {
      backlinks,
      stats,
      backlinkProfile,
      issues,
      tips,
      detailedRecommendations
    }
  }

  const handleScan = async () => {
    if (!selectedProject) {
      showToast({
        title: 'Error',
        description: 'Please select a project to scan',
        variant: 'destructive'
      })
      return
    }

    setIsScanning(true)
    try {
      const response = await fetch(`/api/tools/${selectedProject}/run-backlinks`, {
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
          title: 'Scan Complete',
          description: 'Backlink analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Scan Failed',
          description: data.error || 'Failed to scan backlinks',
          variant: 'destructive'
        })
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Network error occurred during scan',
        variant: 'destructive'
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleExport = () => {
    if (!analysisData?.backlinks.length) return
    
    const csvContent = [
      'Source URL,Target URL,Domain,Anchor Text,Link Type,Quality,DA',
      ...analysisData.backlinks.map(link => 
        `"${link.sourceUrl}","${link.targetUrl}","${link.sourceDomain}","${link.anchorText || ''}","${link.linkType}","${link.linkQuality}","${link.domainAuthority || 'N/A'}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backlinks-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast({
        title: 'Copied',
        description: 'Text copied to clipboard',
        variant: 'success'
      })
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      })
    }
  }

  const getIssueIcon = (type: Issue['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getIssueColor = (type: Issue['type']) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20'
      case 'info': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
    }
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
  }

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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
              <h1 className="text-2xl font-bold">Backlink Scanner</h1>
              <p className="text-muted-foreground">Discover and analyze backlinks to improve your website's authority and SEO</p>
            </div>
          </div>
          {analysisData?.backlinks.length && (
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
              <ExternalLink className="h-5 w-5 text-primary" />
              <span>Backlink Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to discover and analyze backlinks for SEO optimization
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
                onClick={handleScan} 
                disabled={isScanning || !selectedProject}
                className="w-full"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning Backlinks...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan Backlinks
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* Backlink Profile Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Backlink Profile Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analysisData.backlinkProfile.authorityScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Authority Score</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analysisData.backlinkProfile.qualityRatio}%
                    </div>
                    <div className="text-sm text-muted-foreground">Quality Ratio</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {analysisData.backlinkProfile.diversityScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Diversity Score</div>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${
                    analysisData.backlinkProfile.riskLevel === 'high' ? 'bg-red-50 dark:bg-red-950/20' :
                    analysisData.backlinkProfile.riskLevel === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                    'bg-green-50 dark:bg-green-950/20'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      analysisData.backlinkProfile.riskLevel === 'high' ? 'text-red-600 dark:text-red-400' :
                      analysisData.backlinkProfile.riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {analysisData.backlinkProfile.riskLevel.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">Risk Level</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anchor Text Diversity:</span>
                    <span className="font-medium">{analysisData.backlinkProfile.anchorTextDiversity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Domain Diversity:</span>
                    <span className="font-medium">{analysisData.backlinkProfile.domainDiversity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Link Velocity:</span>
                    <span className="font-medium capitalize">{analysisData.backlinkProfile.linkVelocity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Backlink Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analysisData.stats.totalBacklinks}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Backlinks</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analysisData.stats.highQuality}
                    </div>
                    <div className="text-sm text-muted-foreground">High Quality</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {analysisData.stats.mediumQuality}
                    </div>
                    <div className="text-sm text-muted-foreground">Medium Quality</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {analysisData.stats.lowQuality}
                    </div>
                    <div className="text-sm text-muted-foreground">Low Quality</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unique Domains:</span>
                    <span className="font-medium">{analysisData.stats.uniqueDomains}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Domain Authority:</span>
                    <span className="font-medium">{analysisData.stats.avgDomainAuthority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Toxic Links:</span>
                    <span className="font-medium text-red-600">{analysisData.stats.toxicLinks}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues Found */}
            {analysisData.issues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <span>Issues Found</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.issues.map((issue, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}>
                        <div className="flex items-start space-x-3">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{issue.title}</h4>
                              <div className="flex space-x-2">
                                <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                                  {issue.priority} priority
                                </Badge>
                                <Badge variant="outline">
                                  {issue.impact} impact
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                          </div>
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
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span>Tips & Best Practices</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisData.tips.map((tip, index) => (
                    <div key={index} className="p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {tip.category}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(tip.difficulty)}>
                          {tip.difficulty}
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-2 dark:text-gray-100">{tip.title}</h4>
                      <p className="text-sm text-muted-foreground">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Detailed Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analysisData.detailedRecommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-lg dark:text-gray-100">{rec.title}</h4>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="outline" className={getDifficultyColor(rec.difficulty)}>
                            {rec.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{rec.description}</p>
                      <div className="mb-3">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          Impact: {rec.impact}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2 dark:text-gray-100">Implementation Steps:</h5>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                          {rec.steps.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Backlinks List */}
            {analysisData.backlinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span>Discovered Backlinks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.backlinks.slice(0, 10).map((backlink, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm break-all dark:text-gray-200">{backlink.sourceUrl}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(backlink.sourceUrl)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-muted-foreground">
                              Domain: {backlink.sourceDomain}
                            </p>
                            {backlink.anchorText && (
                              <p className="text-sm text-muted-foreground">
                                Anchor: {backlink.anchorText}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={backlink.linkQuality === 'high' ? 'default' : backlink.linkQuality === 'medium' ? 'secondary' : 'destructive'}>
                            {backlink.linkQuality}
                          </Badge>
                          {backlink.domainAuthority && (
                            <Badge variant="outline">
                              DA: {backlink.domainAuthority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {analysisData.backlinks.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground">
                        Showing 10 of {analysisData.backlinks.length} backlinks
                      </div>
                    )}
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