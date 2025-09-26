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
import { Image, CheckCircle, AlertTriangle, XCircle, Eye, FileText, Search, Zap, Loader2 } from 'lucide-react'

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

export default function AltTextCheckerPage() {
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
          toolType: 'alt-text-checker'
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
      toolId="alt-text-checker"
      toolName="Alt Text Checker"
      toolDescription="Check for missing or inadequate alt text on images to improve accessibility and SEO performance."
    >
      {/* URL Input Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Alt Text Analysis</CardTitle>
          <CardDescription>
            Enter a URL to analyze alt text implementation on images
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
                Analyze Alt Text
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
                <Image className="h-5 w-5 text-primary" />
                <span>Alt Text Analysis Results</span>
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
    </SEOToolLayout>
  )
}

