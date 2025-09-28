"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Loader2, Download, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PageSpeedAnalysis } from '@/lib/seo-analysis'

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

export default function PageSpeedAnalyzerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState<PageSpeedAnalysis | null>(null)

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
      console.error('Error fetching projects:', error)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedProject) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch(`/api/tools/${selectedProject}/run-page-speed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        setAnalysisData(data.data)
        showToast({
          title: 'Analysis Complete',
          description: 'Page speed analysis completed successfully!',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze page speed',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Analysis error:', error)
      showToast({
        title: 'Analysis Failed',
        description: 'An error occurred during analysis',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExport = () => {
    if (!analysisData) return
    
    const csvContent = [
      'Metric,Value,Status',
      `Overall Score,${analysisData.overallScore}/100,${analysisData.overallScore >= 80 ? 'Good' : analysisData.overallScore >= 60 ? 'Needs Improvement' : 'Poor'}`,
      `Performance Score,${analysisData.performance.score}/100,${analysisData.performance.status}`,
      `Accessibility Score,${analysisData.accessibility.score}/100,${analysisData.accessibility.status}`,
      `Best Practices Score,${analysisData.bestPractices.score}/100,${analysisData.bestPractices.status}`,
      `SEO Score,${analysisData.seo.score}/100,${analysisData.seo.status}`,
      `First Contentful Paint,${analysisData.performance.metrics.firstContentfulPaint}s,Performance Metric`,
      `Largest Contentful Paint,${analysisData.performance.metrics.largestContentfulPaint}s,Performance Metric`,
      `First Input Delay,${analysisData.performance.metrics.firstInputDelay}ms,Performance Metric`,
      `Cumulative Layout Shift,${analysisData.performance.metrics.cumulativeLayoutShift},Performance Metric`
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'page-speed-analysis.csv'
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
              <h1 className="text-2xl font-bold">Page Speed Analyzer</h1>
              <p className="text-muted-foreground">Analyze and optimize your website's page speed for better SEO performance</p>
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
              <Search className="h-5 w-5 text-primary" />
              <span>Page Speed Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to analyze page speed for SEO optimization
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
                    Analyzing Page Speed...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Page Speed
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Page Speed Analysis Results</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={analysisData.overallScore >= 80 ? 'default' : analysisData.overallScore >= 60 ? 'secondary' : 'destructive'}>
                      Score: {analysisData.overallScore}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analysisData.performance.score}</div>
                    <div className="text-sm text-muted-foreground">Performance</div>
                    <Badge variant={analysisData.performance.status === 'excellent' ? 'default' : analysisData.performance.status === 'good' ? 'secondary' : 'destructive'} className="mt-1">
                      {analysisData.performance.status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analysisData.accessibility.score}</div>
                    <div className="text-sm text-muted-foreground">Accessibility</div>
                    <Badge variant={analysisData.accessibility.status === 'excellent' ? 'default' : analysisData.accessibility.status === 'good' ? 'secondary' : 'destructive'} className="mt-1">
                      {analysisData.accessibility.status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{analysisData.bestPractices.score}</div>
                    <div className="text-sm text-muted-foreground">Best Practices</div>
                    <Badge variant={analysisData.bestPractices.status === 'excellent' ? 'default' : analysisData.bestPractices.status === 'good' ? 'secondary' : 'destructive'} className="mt-1">
                      {analysisData.bestPractices.status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{analysisData.seo.score}</div>
                    <div className="text-sm text-muted-foreground">SEO</div>
                    <Badge variant={analysisData.seo.status === 'excellent' ? 'default' : analysisData.seo.status === 'good' ? 'secondary' : 'destructive'} className="mt-1">
                      {analysisData.seo.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>Key performance metrics that affect user experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">First Contentful Paint</span>
                      <span className="text-sm">{analysisData.performance.metrics.firstContentfulPaint}s</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (analysisData.performance.metrics.firstContentfulPaint * 50))} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Largest Contentful Paint</span>
                      <span className="text-sm">{analysisData.performance.metrics.largestContentfulPaint}s</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (analysisData.performance.metrics.largestContentfulPaint * 40))} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">First Input Delay</span>
                      <span className="text-sm">{analysisData.performance.metrics.firstInputDelay}ms</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (analysisData.performance.metrics.firstInputDelay / 10))} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Cumulative Layout Shift</span>
                      <span className="text-sm">{analysisData.performance.metrics.cumulativeLayoutShift}</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (analysisData.performance.metrics.cumulativeLayoutShift * 400))} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {analysisData.recommendations && analysisData.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Actionable steps to improve your page speed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisData.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opportunities */}
            {analysisData.opportunities && analysisData.opportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Opportunities</CardTitle>
                  <CardDescription>Potential improvements with estimated savings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.opportunities.map((opportunity, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{opportunity.name}</h4>
                          <Badge variant="outline">{opportunity.savings}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                      </div>
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
