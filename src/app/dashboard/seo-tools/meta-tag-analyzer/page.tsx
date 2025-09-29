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
import { FileText, CheckCircle, AlertTriangle, Loader2, Download, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { MetaTagAnalysis } from '@/lib/seo-analysis'

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

export default function MetaTagAnalyzerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<MetaTagAnalysis | null>(null)

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
    } catch (_error) {
      console.error('Failed to fetch projects:', _error)
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
        console.log('Meta Tag Analysis Response:', data)
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
    if (!analysisResult) return
    
    const exportData = [{
      URL: analysisResult.url,
      'Meta Title': analysisResult.title.content,
      'Meta Description': analysisResult.description.content,
      'Title Length': analysisResult.title.length,
      'Description Length': analysisResult.description.length,
      'Title Status': analysisResult.title.status,
      'Description Status': analysisResult.description.status,
      'Issues': analysisResult.issues?.map((issue: { message: string }) => issue.message).join('; ') || 'None',
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
              <h1 className="text-2xl font-bold">Meta Tag Analyzer</h1>
              <p className="text-muted-foreground">Analyze and optimize your website's meta tags for better SEO performance</p>
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
              <FileText className="h-5 w-5 text-primary" />
              <span>Meta Tag Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze meta tags for SEO optimization
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
                    Analyzing Meta Tags...
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Meta Tag Analysis Results</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={analysisResult.score >= 80 ? 'default' : analysisResult.score >= 60 ? 'secondary' : 'destructive'}>
                    Score: {analysisResult.score}/100
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Title Analysis */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <span className="mr-2">Title Tag</span>
                    <Badge variant={analysisResult.title.status === 'good' ? 'default' : analysisResult.title.status === 'warning' ? 'secondary' : 'destructive'}>
                      {analysisResult.title.status}
                    </Badge>
                  </h4>
                  <p className="text-sm bg-gray-50 dark:bg-gray-950/20 p-3 rounded mb-2">{analysisResult.title.content || 'No title found'}</p>
                  <p className="text-xs text-muted-foreground">Length: {analysisResult.title.length} characters</p>
                  <p className="text-xs text-muted-foreground">{analysisResult.title.recommendation}</p>
                </div>

                {/* Description Analysis */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <span className="mr-2">Meta Description</span>
                    <Badge variant={analysisResult.description.status === 'good' ? 'default' : analysisResult.description.status === 'warning' ? 'secondary' : 'destructive'}>
                      {analysisResult.description.status}
                    </Badge>
                  </h4>
                  <p className="text-sm bg-gray-50 dark:bg-gray-950/20 p-3 rounded mb-2">{analysisResult.description.content || 'No description found'}</p>
                  <p className="text-xs text-muted-foreground">Length: {analysisResult.description.length} characters</p>
                  <p className="text-xs text-muted-foreground">{analysisResult.description.recommendation}</p>
                </div>

                {/* Keywords Analysis */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <span className="mr-2">Meta Keywords</span>
                    <Badge variant={analysisResult.keywords.status === 'good' ? 'default' : analysisResult.keywords.status === 'warning' ? 'secondary' : 'destructive'}>
                      {analysisResult.keywords.status}
                    </Badge>
                  </h4>
                  <p className="text-sm bg-gray-50 dark:bg-gray-950/20 p-3 rounded mb-2">{analysisResult.keywords.content || 'No keywords found'}</p>
                  <p className="text-xs text-muted-foreground">{analysisResult.keywords.recommendation}</p>
                </div>

                {/* Viewport Analysis */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <span className="mr-2">Viewport Meta Tag</span>
                    <Badge variant={analysisResult.viewport.status === 'good' ? 'default' : analysisResult.viewport.status === 'warning' ? 'secondary' : 'destructive'}>
                      {analysisResult.viewport.status}
                    </Badge>
                  </h4>
                  <p className="text-sm bg-gray-50 dark:bg-gray-950/20 p-3 rounded mb-2">{analysisResult.viewport.content || 'No viewport found'}</p>
                  <p className="text-xs text-muted-foreground">{analysisResult.viewport.recommendation}</p>
                </div>

                {/* Issues */}
                {analysisResult.issues && analysisResult.issues.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Issues Found</h4>
                    <div className="space-y-2">
                      {analysisResult.issues.map((issue: { type: string; message: string; severity: string }, index: number) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{issue.type}:</strong> {issue.message}
                            <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'} className="ml-2">
                              {issue.severity}
                            </Badge>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {analysisResult.recommendations.map((recommendation: string, index: number) => (
                        <Alert key={index}>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>{recommendation}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}