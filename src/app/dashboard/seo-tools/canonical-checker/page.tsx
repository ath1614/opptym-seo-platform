"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, CheckCircle, AlertTriangle, XCircle, Link, Globe, Search, Zap, Loader2 } from 'lucide-react'

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

export default function CanonicalCheckerPage() {
  const { data: session, status } = useSession()
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
        if (data.projects && data.projects.length > 0) {
          setSelectedProject(data.projects[0]._id)
          setUrl(data.projects[0].websiteURL || '')
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleAnalyze = async () => {
    if (!url.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/seo-tools/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          toolType: 'canonical-checker'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysisData(data.analysisResults)
      } else {
        console.error('Analysis failed')
      }
    } catch (error) {
      console.error('Error during analysis:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <SEOToolLayout
      toolId="canonical-checker"
      toolName="Canonical Checker"
      toolDescription="Check canonical URLs and duplicate content issues to prevent SEO penalties and improve search rankings."
    >
      {/* URL Input Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Canonical URL Analysis</CardTitle>
          <CardDescription>
            Enter a URL to analyze canonical tags and duplicate content issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Select Project</Label>
              <Select value={selectedProject} onValueChange={(value) => {
                setSelectedProject(value)
                const project = projects.find(p => p._id === value)
                if (project) {
                  setUrl(project.websiteURL || '')
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !url.trim()}
            className="w-full md:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Canonical URLs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Canonical URL Analysis Results</span>
              </CardTitle>
              <CardDescription>
                Analysis for: {analysisData.url}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysisData.score}</div>
                  <div className="text-sm text-blue-600">Overall Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisData.hasCanonical ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-green-600">Has Canonical</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{analysisData.canonicalIssues.length}</div>
                  <div className="text-sm text-yellow-600">Issues Found</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{analysisData.duplicateContent.length}</div>
                  <div className="text-sm text-red-600">Duplicate Content</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canonical URL Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="h-5 w-5" />
                <span>Canonical URL Details</span>
              </CardTitle>
              <CardDescription>
                Current canonical URL implementation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">Current URL</div>
                    <div className="text-sm text-muted-foreground">{analysisData.url}</div>
                  </div>
                  <Badge variant={analysisData.hasCanonical ? 'default' : 'destructive'}>
                    {analysisData.hasCanonical ? 'Has Canonical' : 'No Canonical'}
                  </Badge>
                </div>
                
                {analysisData.hasCanonical && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold">Canonical URL</div>
                      <div className="text-sm text-muted-foreground">{analysisData.canonicalUrl}</div>
                    </div>
                    <Badge variant={analysisData.isSelfReferencing ? 'default' : 'secondary'}>
                      {analysisData.isSelfReferencing ? 'Self-Referencing' : 'External'}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Canonical Issues */}
          {analysisData.canonicalIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span>Canonical Issues Found</span>
                </CardTitle>
                <CardDescription>
                  Issues that need to be addressed for proper canonical URL implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.canonicalIssues.map((issue, index) => (
                    <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start space-x-2">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-red-800 mb-1">
                            {issue.type.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-red-700 mb-2">
                            {issue.message}
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {issue.severity.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Recommendations</span>
              </CardTitle>
              <CardDescription>
                Actionable steps to improve your canonical URL implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SEOToolLayout>
  )
}
