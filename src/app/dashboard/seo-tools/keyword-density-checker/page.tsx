"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, CheckCircle, XCircle, AlertTriangle, Loader2, Download, BarChart3 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

interface KeywordDensity {
  keyword: string
  count: number
  density: number
  position: number[]
}

interface AnalysisResult {
  url: string
  totalWords: number
  keywordDensities: KeywordDensity[]
  issues: string[]
  recommendations: string[]
  score: number
}

export default function KeywordDensityCheckerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
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
        setAnalysisResult(data.data)
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
    
    const exportData = analysisResult.keywordDensities.map(kw => ({
      Keyword: kw.keyword,
      Count: kw.count,
      Density: `${kw.density.toFixed(2)}%`,
      Positions: kw.position.join(', ')
    }))
    
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
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
      <SEOToolLayout
        toolId="keyword-density-checker"
        toolName="Keyword Density Checker"
        toolDescription="Check keyword density and distribution across your content"
        mockData={null}
      >
        <div className="space-y-6">
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-primary" />
                <span>Keyword Density Analysis</span>
              </CardTitle>
              <CardDescription>
                Select a project to analyze keyword density and distribution
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
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Keyword Density
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Analysis Results</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={analysisResult.score >= 80 ? 'default' : analysisResult.score >= 60 ? 'secondary' : 'destructive'}>
                        Score: {analysisResult.score}/100
                      </Badge>
                      <Button size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analysisResult.totalWords}</div>
                      <div className="text-sm text-blue-600">Total Words</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analysisResult.keywordDensities.length}</div>
                      <div className="text-sm text-green-600">Keywords Found</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResult.keywordDensities.length > 0 
                          ? (analysisResult.keywordDensities.reduce((sum, kw) => sum + kw.density, 0) / analysisResult.keywordDensities.length).toFixed(2)
                          : 0}%
                      </div>
                      <div className="text-sm text-purple-600">Avg Density</div>
                    </div>
                  </div>

                  {/* Keyword Density Table */}
                  {analysisResult.keywordDensities.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Keyword Density Results</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-200 px-4 py-2 text-left">Keyword</th>
                              <th className="border border-gray-200 px-4 py-2 text-left">Count</th>
                              <th className="border border-gray-200 px-4 py-2 text-left">Density</th>
                              <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysisResult.keywordDensities.map((keyword, index) => (
                              <tr key={index}>
                                <td className="border border-gray-200 px-4 py-2 font-medium">{keyword.keyword}</td>
                                <td className="border border-gray-200 px-4 py-2">{keyword.count}</td>
                                <td className="border border-gray-200 px-4 py-2">{keyword.density.toFixed(2)}%</td>
                                <td className="border border-gray-200 px-4 py-2">
                                  <Badge 
                                    variant={
                                      keyword.density >= 0.5 && keyword.density <= 2.5 ? 'default' : 
                                      keyword.density < 0.5 ? 'secondary' : 'destructive'
                                    }
                                  >
                                    {keyword.density >= 0.5 && keyword.density <= 2.5 ? 'Good' : 
                                     keyword.density < 0.5 ? 'Low' : 'High'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Issues and Recommendations */}
              {(analysisResult.issues.length > 0 || analysisResult.recommendations.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysisResult.issues.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-red-600">
                          <XCircle className="h-5 w-5" />
                          <span>Issues Found</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analysisResult.issues.map((issue, index) => (
                            <Alert key={index}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>{issue}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.recommendations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span>Recommendations</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
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
            </>
          )}
        </div>
      </SEOToolLayout>
    </DashboardLayout>
  )
}
