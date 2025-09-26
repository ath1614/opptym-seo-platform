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
import { FileText, CheckCircle, XCircle, AlertTriangle, Loader2, Download } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

interface AnalysisResult {
  url: string
  title: string
  description: string
  keywords: string[]
  titleLength: number
  descriptionLength: number
  issues: string[]
  recommendations: string[]
  score: number
}

export default function MetaTagAnalyzerPage() {
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
      const response = await fetch(`/api/tools/${selectedProject}/run-meta`, {
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
          description: 'Meta tag analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze meta tags',
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
    
    const exportData = [{
      URL: analysisResult.url,
      'Meta Title': analysisResult.title,
      'Meta Description': analysisResult.description,
      'Title Length': analysisResult.titleLength,
      'Description Length': analysisResult.descriptionLength,
      'Issues': analysisResult.issues.join('; '),
      'Score': analysisResult.score
    }]
    
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meta-tag-analysis.csv'
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
        toolId="meta-tag-analyzer"
        toolName="Meta Tag Analyzer"
        toolDescription="Analyze meta titles, descriptions, and other meta tags for SEO optimization"
        mockData={null}
      >
        <div className="space-y-6">
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Meta Tag Analysis</span>
              </CardTitle>
              <CardDescription>
                Select a project to analyze its meta tags for SEO optimization
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
                      <FileText className="h-4 w-4 mr-2" />
                      Analyze Meta Tags
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
                      <div className="text-2xl font-bold text-blue-600">{analysisResult.titleLength}</div>
                      <div className="text-sm text-blue-600">Title Length</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analysisResult.descriptionLength}</div>
                      <div className="text-sm text-green-600">Description Length</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analysisResult.keywords.length}</div>
                      <div className="text-sm text-purple-600">Keywords Found</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Meta Title</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">{analysisResult.title || 'No title found'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Meta Description</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">{analysisResult.description || 'No description found'}</p>
                    </div>
                    
                    {analysisResult.keywords.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
