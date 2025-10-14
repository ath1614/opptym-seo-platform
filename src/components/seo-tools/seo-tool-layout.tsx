/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { ArrowLeft, Download, RefreshCw, ExternalLink } from 'lucide-react'

interface SEOToolLayoutProps {
  toolId: string
  toolName: string
  toolDescription: string
  children: React.ReactNode
  mockData: any
}

export function SEOToolLayout({ 
  toolId, 
  toolName, 
  toolDescription, 
  children, 
  mockData 
}: SEOToolLayoutProps) {
  const [url, setUrl] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/seo-tool-projects')
      const data = await response.json()
      
      if (response.ok) {
        setProjects(data.projects)
      }
    } catch {
      // Handle error silently
    } finally {
      setIsLoading(false)
    }
  }

  const getToolRoute = (id: string) => {
    switch (id) {
      case 'technical-seo-auditor':
        return 'run-technical-seo-auditor'
      case 'keyword-tracker':
        return 'run-keyword-tracker'
      case 'keyword-researcher':
        return 'run-keyword-research'
      case 'page-speed-analyzer':
        return 'run-page-speed'
      case 'broken-link-scanner':
        return 'run-broken-links'
      case 'mobile-checker':
        return 'run-mobile-checker'
      case 'backlink-scanner':
        return 'run-backlinks'
      case 'canonical-checker':
        return 'run-canonical'
      case 'sitemap-robots-checker':
        return 'run-sitemap-robots'
      case 'keyword-density-checker':
        return 'run-keyword-density'
      case 'meta-tag-analyzer':
        return 'run-meta'
      case 'competitor-analyzer':
        return 'run-competitors'
      case 'alt-text-checker':
        return 'run-alt-text'
      default:
        return ''
    }
  }

  const handleAnalyze = async () => {
    const targetUrl = selectedProject ? 
      projects.find(p => p._id === selectedProject)?.websiteURL : 
      url.trim()

    if (!targetUrl) {
      showToast({
        title: 'URL Required',
        description: selectedProject ? 
          'Selected project has no website URL.' : 
          'Please enter a valid URL to analyze.',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Prefer project-specific API when a project is selected
      const projectSpecificRoute = selectedProject ? getToolRoute(toolId) : ''
      const response = selectedProject && projectSpecificRoute
        ? await fetch(`/api/tools/${selectedProject}/${projectSpecificRoute}`, {
            method: 'POST',
          })
        : await fetch('/api/seo-tools', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              toolId: toolId,
              url: targetUrl,
              projectId: selectedProject || null
            }),
          })

      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
        
        showToast({
          title: 'Analysis Complete',
          description: 'Your SEO analysis has been completed successfully.',
          variant: 'success'
        })
      } else {
        const errorData = await response.json()
        showToast({
          title: 'Analysis Failed',
          description: errorData.error || 'There was an error running the analysis.',
          variant: 'destructive'
        })
      }
    } catch {
      showToast({
        title: 'Analysis Failed',
        description: 'There was an error running the analysis. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExport = (format: 'json' | 'csv') => {
    if (!results) return

    const dataStr = format === 'json' 
      ? JSON.stringify(results, null, 2)
      : convertToCSV(results)
    
    const dataBlob = new Blob([dataStr], { type: `text/${format}` })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${toolId}-analysis.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast({
      title: 'Export Complete',
      description: `Results exported as ${format.toUpperCase()}`,
      variant: 'success'
    })
  }

  const convertToCSV = (data: any) => {
    // Simple CSV conversion - can be enhanced based on data structure
    const headers = Object.keys(data)
    const values = Object.values(data)
    return [headers.join(','), values.join(',')].join('\n')
  }

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
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
            <h1 className="text-2xl font-bold">{toolName}</h1>
            <p className="text-muted-foreground">{toolDescription}</p>
          </div>
        </div>
        {results && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Configuration</CardTitle>
          <CardDescription>
            Select a project to analyze its website URL, or enter a custom URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Select Project *</Label>
              <Select 
                value={selectedProject} 
                onValueChange={(value) => {
                  setSelectedProject(value)
                  if (value) {
                    const project = projects.find(p => p._id === value)
                    if (project?.websiteURL) {
                      setUrl(project.websiteURL)
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                  ) : projects.length === 0 ? (
                    <SelectItem value="none" disabled>No projects found</SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        <div className="flex flex-col">
                          <span>{project.title ?? project.projectName}</span>
                          <span className="text-xs text-muted-foreground">{project.websiteURL}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {projects.length === 0 && !isLoading && (
                <p className="text-sm text-muted-foreground">
                  No projects found. <Link href="/dashboard/projects/new" className="text-primary hover:underline">Create a project</Link> first.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={!validateUrl(url) && url ? 'border-red-500' : ''}
                disabled={!!selectedProject}
              />
              {selectedProject && (
                <p className="text-sm text-muted-foreground">
                  URL auto-populated from selected project
                </p>
              )}
              {!validateUrl(url) && url && !selectedProject && (
                <p className="text-sm text-red-500 dark:text-red-400">Please enter a valid URL</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleAnalyze}
              disabled={(!selectedProject && !url) || (!selectedProject && !validateUrl(url)) || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <RefreshCw className="h-12 w-12 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Analyzing Your Website</h3>
              <div className="space-y-3 max-w-md mx-auto">
                <p className="text-muted-foreground">
                  Our advanced SEO analysis engine is working to provide you with comprehensive and accurate insights.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>⏱️ This may take a few minutes</strong><br />
                    We're performing deep analysis to ensure quality and accurate results. 
                    Please be patient while we gather comprehensive data about your website.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <span className="ml-2">Processing...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && !isAnalyzing && (
        <div className="space-y-6">
          {children}
        </div>
      )}

      {/* No Results State */}
      {!results && !isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <ExternalLink className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
              <p className="text-muted-foreground">
                Enter a URL above and click &quot;Run Analysis&quot; to get started with your SEO analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
