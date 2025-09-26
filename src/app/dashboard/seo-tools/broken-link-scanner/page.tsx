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
import { Link, AlertTriangle, CheckCircle, ExternalLink, Clock, XCircle, Search, Loader2, Download, ArrowLeft } from 'lucide-react'

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
        const transformedData = {
          url: data.url,
          timestamp: new Date().toISOString(),
          overallScore: data.score,
          brokenLinks: {
            total: data.totalLinks,
            broken: data.brokenLinks.length,
            working: data.workingLinks,
            redirects: data.redirects,
            healthScore: data.healthScore,
            links: data.brokenLinks.map((link: any) => ({
              url: link.url,
              status: link.status,
              type: link.type,
              foundOn: link.foundOn,
              impact: link.impact
            }))
          },
          recommendations: data.recommendations || []
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

            {/* Broken Links List */}
            {analysisData.brokenLinks.links.length > 0 && (
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