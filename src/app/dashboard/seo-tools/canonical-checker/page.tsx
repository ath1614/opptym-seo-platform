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
import { FileText, CheckCircle, AlertTriangle, XCircle, Link, Globe, Search, Zap, Loader2, Download, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface AnalysisData {
  url: string
  canonicalUrl: string
  hasCanonical: boolean
  isSelfReferencing: boolean
  duplicateContent: Array<{
    url: string
    title: string
    similarity: number
    status: 'warning' | 'error'
  }>
  canonicalIssues: Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
  recommendations: string[]
  score: number
}

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

export default function CanonicalCheckerPage() {
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
      const response = await fetch(`/api/tools/${selectedProject}/run-canonical`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Canonical Analysis Response:', data)
        setAnalysisData(data.data)
        showToast({
          title: 'Analysis Complete',
          description: 'Canonical analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze canonical tags',
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
      'URL,Canonical URL,Has Canonical,Self Referencing,Issues',
      `"${analysisData.url}","${analysisData.canonicalUrl}","${analysisData.hasCanonical}","${analysisData.isSelfReferencing}","${analysisData.canonicalIssues?.map(issue => issue.message).join('; ') || 'None'}"`
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'canonical-analysis.csv'
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
              <h1 className="text-2xl font-bold">Canonical Checker</h1>
              <p className="text-muted-foreground">Analyze canonical tags to prevent duplicate content issues and improve SEO</p>
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
              <span>Canonical Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze canonical tags and prevent duplicate content
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
                    Analyzing Canonical Tags...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Check Canonical Tags
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
                  <span>Canonical Analysis Results</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={analysisData.score >= 80 ? 'default' : analysisData.score >= 60 ? 'secondary' : 'destructive'}>
                      Score: {analysisData.score}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Current URL</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{analysisData.url}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Link className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">Canonical URL</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{analysisData.canonicalUrl || 'Not found'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant={analysisData.hasCanonical ? 'default' : 'destructive'}>
                      {analysisData.hasCanonical ? 'Has Canonical' : 'Missing Canonical'}
                    </Badge>
                    <Badge variant={analysisData.isSelfReferencing ? 'default' : 'secondary'}>
                      {analysisData.isSelfReferencing ? 'Self Referencing' : 'Not Self Referencing'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Canonical Issues */}
            {analysisData.canonicalIssues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Canonical Issues</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.canonicalIssues.map((issue, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>{issue.type}</strong>
                              <p className="text-sm text-muted-foreground mt-1">{issue.message}</p>
                            </div>
                            <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'}>
                              {issue.severity}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Duplicate Content */}
            {analysisData.duplicateContent.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-orange-500" />
                    <span>Duplicate Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.duplicateContent.map((duplicate, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm break-all">{duplicate.url}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{duplicate.title}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={duplicate.status === 'error' ? 'destructive' : 'secondary'}>
                            {duplicate.similarity}% similar
                          </Badge>
                        </div>
                      </div>
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
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Recommendations</span>
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
    </DashboardLayout>
  )
}