"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, CheckCircle, XCircle, AlertTriangle, Loader2, Download, BarChart3, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { KeywordDensityAnalysis } from '@/lib/seo-analysis'

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

interface KeywordDensity {
  keyword: string
  count: number
  density: number
  position?: number[]
}

interface AnalysisResult {
  url: string
  totalWords: number
  keywordDensities: Array<{
    keyword: string
    count: number
    density: number
    status: 'good' | 'warning' | 'error'
    position?: number[]
  }>
  recommendations: string[]
  score: number
}

export default function KeywordDensityCheckerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

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
      const response = await fetch(`/api/tools/${selectedProject}/run-keyword-density`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Keyword Density Analysis Response:', data)
        // Transform the KeywordDensityAnalysis data to match the expected interface
        const transformedData: AnalysisResult = {
          url: data.data.url,
          totalWords: data.data.totalWords,
          keywordDensities: data.data.keywords.map((kw: { keyword: string; count: number; density: number; status: 'good' | 'warning' | 'error' }) => ({
            keyword: kw.keyword,
            count: kw.count,
            density: kw.density,
            status: kw.status,
            position: [] // Position data not available from backend
          })),
          recommendations: data.data.recommendations,
          score: data.data.score
        }
        setAnalysisResult(transformedData)
        showToast({
          title: 'Analysis Complete',
          description: 'Keyword density analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze keyword density',
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
    if (!analysisResult) return
    
    const csvContent = [
      'Keyword,Count,Density,Positions',
      ...(analysisResult.keywordDensities || []).map(kw => 
        `"${kw.keyword}","${kw.count}","${kw.density.toFixed(2)}%","${kw.position?.join('; ') || 'N/A'}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keyword-density-analysis.csv'
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
              <h1 className="text-2xl font-bold">Keyword Density Checker</h1>
              <p className="text-muted-foreground">Analyze keyword density to optimize content for better SEO performance</p>
            </div>
          </div>
          {analysisResult && (
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
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Keyword Density Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze keyword density and optimize content
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
                    Analyzing Keyword Density...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Check Keyword Density
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Keyword Density Analysis Results</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={analysisResult.score >= 80 ? 'default' : analysisResult.score >= 60 ? 'secondary' : 'destructive'}>
                      Score: {analysisResult.score}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analysisResult.totalWords}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Words</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analysisResult.keywordDensities?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Keywords Found</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Densities */}
            {analysisResult.keywordDensities && analysisResult.keywordDensities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-primary" />
                    <span>Keyword Density Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.keywordDensities?.map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{keyword.keyword}</span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-muted-foreground">
                              Count: {keyword.count} | Density: {keyword.density.toFixed(2)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Positions: {keyword.position?.join(', ') || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            keyword.density >= 1 && keyword.density <= 3 ? 'default' : 
                            keyword.density > 3 ? 'destructive' : 'secondary'
                          }>
                            {keyword.density.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Optimization Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((recommendation, index) => (
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