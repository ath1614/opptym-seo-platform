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
import { useToast } from '@/components/ui/toast'
import { ExternalLink, TrendingUp, Shield, AlertTriangle, CheckCircle, Globe, Users, Search, Loader2, Info, ArrowLeft, Download } from 'lucide-react'

interface Backlink {
  _id: string
  sourceUrl: string
  targetUrl: string
  sourceDomain: string
  anchorText?: string
  linkType: string
  domainAuthority?: number
  linkQuality: string
  discoveredAt: string
  title?: string
}

interface BacklinkStats {
  totalBacklinks: number
  highQuality: number
  mediumQuality: number
  lowQuality: number
  toxicLinks: number
  avgDomainAuthority: number
  uniqueDomains: number
}

interface Project {
  _id: string
  projectName: string
  websiteURL: string
}

export default function BacklinkScannerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [isScanning, setIsScanning] = useState(false)
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [stats, setStats] = useState<BacklinkStats | null>(null)

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

  const handleScan = async () => {
    if (!selectedProject) {
      showToast({
        title: 'Error',
        description: 'Please select a project to scan',
        variant: 'destructive'
      })
      return
    }

    setIsScanning(true)
    try {
      const response = await fetch(`/api/tools/${selectedProject}/run-backlinks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Backlink Analysis Response:', data)
        setBacklinks(data.backlinks || [])
        setStats(data.stats || null)
        showToast({
          title: 'Scan Complete',
          description: 'Backlink analysis completed successfully',
          variant: 'success'
        })
      } else {
        showToast({
          title: 'Scan Failed',
          description: data.error || 'Failed to scan backlinks',
          variant: 'destructive'
        })
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Network error occurred during scan',
        variant: 'destructive'
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleExport = () => {
    if (!backlinks.length) return
    
    const csvContent = [
      'Source URL,Target URL,Domain,Anchor Text,Link Type,Quality,DA',
      ...backlinks.map(link => 
        `"${link.sourceUrl}","${link.targetUrl}","${link.sourceDomain}","${link.anchorText || ''}","${link.linkType}","${link.linkQuality}","${link.domainAuthority || 'N/A'}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backlinks-analysis.csv'
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
              <h1 className="text-2xl font-bold">Backlink Scanner</h1>
              <p className="text-muted-foreground">Discover and analyze backlinks to improve your website's authority and SEO</p>
            </div>
          </div>
          {backlinks.length > 0 && (
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
              <ExternalLink className="h-5 w-5 text-primary" />
              <span>Backlink Analysis</span>
            </CardTitle>
            <CardDescription>
              Select a project to discover and analyze backlinks for SEO optimization
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
                onClick={handleScan} 
                disabled={isScanning || !selectedProject}
                className="w-full"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning Backlinks...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan Backlinks
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {stats && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Backlink Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalBacklinks}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Backlinks</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.highQuality}
                    </div>
                    <div className="text-sm text-muted-foreground">High Quality</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.mediumQuality}
                    </div>
                    <div className="text-sm text-muted-foreground">Medium Quality</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats.lowQuality}
                    </div>
                    <div className="text-sm text-muted-foreground">Low Quality</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backlinks List */}
            {backlinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span>Discovered Backlinks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {backlinks.slice(0, 10).map((backlink, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm break-all">{backlink.sourceUrl}</span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-muted-foreground">
                              Domain: {backlink.sourceDomain}
                            </p>
                            {backlink.anchorText && (
                              <p className="text-sm text-muted-foreground">
                                Anchor: {backlink.anchorText}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={backlink.linkQuality === 'high' ? 'default' : backlink.linkQuality === 'medium' ? 'secondary' : 'destructive'}>
                            {backlink.linkQuality}
                          </Badge>
                          {backlink.domainAuthority && (
                            <Badge variant="outline">
                              DA: {backlink.domainAuthority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {backlinks.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground">
                        Showing 10 of {backlinks.length} backlinks
                      </div>
                    )}
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