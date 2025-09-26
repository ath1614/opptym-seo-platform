"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Loader2, Download } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function PageSpeedAnalyzerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)

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
      'Metric,Value,Status,Recommendation',
      `Overall Score,${analysisData.overallScore || 'N/A'},${analysisData.status || 'N/A'},${analysisData.recommendation || 'N/A'}`,
      `Load Time,${analysisData.loadTime || 'N/A'},${analysisData.loadTimeStatus || 'N/A'},${analysisData.loadTimeRecommendation || 'N/A'}`,
      `Performance,${analysisData.performance || 'N/A'},${analysisData.performanceStatus || 'N/A'},${analysisData.performanceRecommendation || 'N/A'}`
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
      <SEOToolLayout
        toolId="page-speed-analyzer"
        toolName="Page Speed Analyzer"
        toolDescription="Analyze and optimize your website's page speed-analyzer for better SEO performance."
        mockData={null}
      >
        <div className="space-y-6">
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-primary" />
                <span>Page Speed Analyzer Analysis</span>
              </CardTitle>
              <CardDescription>
                Select a project to analyze page speed-analyzer for SEO optimization
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
                      Analyze Page Speed Analyzer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Analysis Results</span>
                    <Button size="sm" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">Analysis completed successfully!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Detailed results and recommendations are available.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SEOToolLayout>
    </DashboardLayout>
  )
}
