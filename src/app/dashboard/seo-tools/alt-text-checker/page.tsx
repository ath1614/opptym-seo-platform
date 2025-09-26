"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Image, CheckCircle, AlertTriangle, XCircle, Eye, FileText, Search, Zap, Loader2, Download } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface AnalysisData {
  url: string
  totalImages: number
  imagesWithAlt: number
  imagesWithoutAlt: number
  altTextCoverage: number
  images: Array<{
    src: string
    alt: string
    status: 'good' | 'warning' | 'error'
    recommendation: string
  }>
  recommendations: string[]
  score: number
}

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

export default function AltTextCheckerPage() {
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
      const response = await fetch(`/api/tools/${selectedProject}/run-alt-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        setAnalysisData(data.data)
        showToast({
          title: 'Analysis Complete',
          description: 'Alt text analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze alt text',
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
    
    const exportData = analysisData.images.map(img => ({
      'Image URL': img.src,
      'Alt Text': img.alt,
      Status: img.status,
      Recommendation: img.recommendation
    }))
    
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'alt-text-analysis.csv'
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
        toolId="alt-text-checker"
        toolName="Alt Text Checker"
        toolDescription="Check for missing or inadequate alt text on images to improve accessibility and SEO performance."
        mockData={null}
      >
        <div className="space-y-6">
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-primary" />
                <span>Alt Text Analysis</span>
              </CardTitle>
              <CardDescription>
                Select a project to analyze alt text implementation on images
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
                      Analyze Alt Text
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

      {/* Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image className="h-5 w-5 text-primary" />
                  <span>Alt Text Analysis Results</span>
                </div>
                <Button size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
              <CardDescription>
                Analysis for: {analysisData.url}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysisData.totalImages}</div>
                  <div className="text-sm text-blue-600">Total Images</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analysisData.imagesWithAlt}</div>
                  <div className="text-sm text-green-600">With Alt Text</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{analysisData.imagesWithoutAlt}</div>
                  <div className="text-sm text-red-600">Missing Alt Text</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analysisData.altTextCoverage}%</div>
                  <div className="text-sm text-purple-600">Alt Text Coverage</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images Analysis */}
          {analysisData.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="h-5 w-5" />
                  <span>Image Analysis</span>
                </CardTitle>
                <CardDescription>
                  Detailed analysis of all images found on the page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.images.slice(0, 10).map((image, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${
                      image.status === 'good' 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <Image className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold mb-1 ${
                            image.status === 'good' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {image.src.length > 50 ? image.src.substring(0, 50) + '...' : image.src}
                          </div>
                          <div className={`text-sm mb-2 ${
                            image.status === 'good' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            Alt Text: "{image.alt || 'None'}"
                          </div>
                          <div className={`text-xs ${
                            image.status === 'good' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {image.recommendation}
                          </div>
                        </div>
                        <Badge variant={image.status === 'good' ? 'default' : 'destructive'} className="text-xs">
                          {image.status === 'good' ? 'Good' : 'Issue'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {analysisData.images.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground">
                      ... and {analysisData.images.length - 10} more images
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-600">
                <Zap className="h-5 w-5" />
                <span>Recommendations</span>
              </CardTitle>
              <CardDescription>
                Actionable steps to improve your alt text implementation
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
        </div>
      </SEOToolLayout>
    </DashboardLayout>
  )
}

