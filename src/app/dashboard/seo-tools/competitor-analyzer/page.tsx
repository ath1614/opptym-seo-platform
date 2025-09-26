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
import { Users, TrendingUp, Target, BarChart3, ExternalLink, Search, Eye, Zap, Loader2, Download, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface CompetitorData {
  name: string
  domain: string
  domainAuthority: number
  backlinks: number
  organicTraffic: number
  keywords: number
  topKeywords: string[]
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
}

interface AnalysisData {
  url: string
  competitors: CompetitorData[]
  marketPosition: string
  opportunities: string[]
  recommendations: string[]
  score: number
}

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

export default function CompetitorAnalyzerPage() {
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
      const response = await fetch(`/api/tools/${selectedProject}/run-competitors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Competitor Analysis Response:', data)
        setAnalysisData(data.data)
        showToast({
          title: 'Analysis Complete',
          description: 'Competitor analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze competitors',
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
      'Competitor,Domain,DA,Backlinks,Traffic,Keywords,Top Keywords',
      ...analysisData.competitors.map(comp => 
        `"${comp.name}","${comp.domain}","${comp.domainAuthority}","${comp.backlinks}","${comp.organicTraffic}","${comp.keywords}","${comp.topKeywords.join('; ')}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'competitor-analysis.csv'
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
              <h1 className="text-2xl font-bold">Competitor Analyzer</h1>
              <p className="text-muted-foreground">Analyze competitor websites and strategies to identify opportunities</p>
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
              <Users className="h-5 w-5 text-primary" />
              <span>Competitor Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze competitors and identify SEO opportunities
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
                    Analyzing Competitors...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Analyze Competitors
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* Market Position */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Market Position Analysis</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={analysisData.score >= 80 ? 'default' : analysisData.score >= 60 ? 'secondary' : 'destructive'}>
                      Score: {analysisData.score}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Market Position</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{analysisData.marketPosition}</p>
                </div>
              </CardContent>
            </Card>

            {/* Competitors Analysis */}
            {analysisData.competitors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Competitor Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.competitors.map((competitor, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{competitor.name}</span>
                            <span className="text-sm text-muted-foreground">({competitor.domain})</span>
                          </div>
                          <Badge variant="outline">DA: {competitor.domainAuthority}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                            <div className="text-lg font-bold text-blue-600">{competitor.backlinks}</div>
                            <div className="text-xs text-muted-foreground">Backlinks</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                            <div className="text-lg font-bold text-green-600">{competitor.organicTraffic}</div>
                            <div className="text-xs text-muted-foreground">Traffic</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                            <div className="text-lg font-bold text-purple-600">{competitor.keywords}</div>
                            <div className="text-xs text-muted-foreground">Keywords</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                            <div className="text-lg font-bold text-orange-600">{competitor.domainAuthority}</div>
                            <div className="text-xs text-muted-foreground">Domain Authority</div>
                          </div>
                        </div>

                        {competitor.topKeywords.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-2">Top Keywords:</p>
                            <div className="flex flex-wrap gap-1">
                              {competitor.topKeywords.slice(0, 5).map((keyword, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <p className="text-sm font-medium text-green-600 mb-1">Strengths</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {competitor.strengths.slice(0, 2).map((strength, idx) => (
                                <li key={idx}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-red-600 mb-1">Weaknesses</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {competitor.weaknesses.slice(0, 2).map((weakness, idx) => (
                                <li key={idx}>• {weakness}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">Opportunities</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {competitor.opportunities.slice(0, 2).map((opportunity, idx) => (
                                <li key={idx}>• {opportunity}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opportunities */}
            {analysisData.opportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>SEO Opportunities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.opportunities.map((opportunity, index) => (
                      <Alert key={index}>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>{opportunity}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysisData.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <span>Strategic Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.recommendations.map((recommendation, index) => (
                      <Alert key={index}>
                        <Zap className="h-4 w-4" />
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