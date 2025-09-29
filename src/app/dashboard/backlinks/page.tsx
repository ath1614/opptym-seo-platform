"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'
import { 
  ExternalLink, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Globe, 
  Search, 
  Loader2, 
  Info,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  status: string
  projectId?: string
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

export default function BacklinksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [stats, setStats] = useState<BacklinkStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [qualityFilter, setQualityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('active')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isScanning, setIsScanning] = useState(false)
  const [scanUrl, setScanUrl] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      loadBacklinks()
    }
  }, [session?.user, currentPage, searchTerm, qualityFilter, statusFilter])

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  const loadBacklinks = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(qualityFilter !== 'all' && { quality: qualityFilter }),
        status: statusFilter
      })

      const response = await fetch(`/api/backlinks?${params}`)
      const data = await response.json()

      if (response.ok) {
        setBacklinks(data.backlinks || [])
        setStats(data.stats)
        setTotalPages(data.totalPages || 1)
      } else {
        showToast({
          title: 'Error',
          description: 'Failed to load backlinks',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to load backlinks:', error)
      showToast({
        title: 'Error',
        description: 'Failed to load backlinks',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScan = async () => {
    if (!scanUrl.trim()) {
      showToast({
        title: 'Error',
        description: 'Please enter a URL to scan',
        variant: 'destructive'
      })
      return
    }

    setIsScanning(true)
    try {
      const response = await fetch('/api/backlinks/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUrl: scanUrl.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast({
          title: 'Success',
          description: data.message || 'Backlink scan completed',
          variant: 'default'
        })
        // Reload backlinks after successful scan
        await loadBacklinks()
      } else {
        showToast({
          title: 'Error',
          description: data.error || 'Failed to scan backlinks',
          variant: 'destructive'
        })
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to scan backlinks',
        variant: 'destructive'
      })
    } finally {
      setIsScanning(false)
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20'
      case 'medium': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20'
      case 'low': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/20'
      case 'toxic': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20'
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20'
      case 'lost': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20'
      case 'pending': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20'
      case 'disavowed': return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/20'
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/20'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backlinks</h1>
            <p className="text-muted-foreground">
              Monitor and analyze your website's backlink profile
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadBacklinks}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

      {/* Important Disclaimer */}
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <strong>Important Disclaimer:</strong> Our backlink scanner provides automated analysis based on available data sources. 
          We do not guarantee the accuracy or completeness of backlink detection. Backlinks are generated automatically when possible 
          through directory submissions and other SEO activities, but results may vary. This tool is for informational purposes only 
          and should not be the sole basis for SEO decisions.
        </AlertDescription>
      </Alert>

      {/* Scan Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-primary" />
            <span>Scan for Backlinks</span>
          </CardTitle>
          <CardDescription>
            Enter a URL to discover backlinks pointing to that website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="https://example.com"
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleScan} 
              disabled={isScanning}
              className="min-w-[120px]"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ExternalLink className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Backlinks</p>
                  <p className="text-2xl font-bold">{stats.totalBacklinks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Unique Domains</p>
                  <p className="text-2xl font-bold">{stats.uniqueDomains}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Domain Authority</p>
                  <p className="text-2xl font-bold">{stats.avgDomainAuthority}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">High Quality</p>
                  <p className="text-2xl font-bold">{stats.highQuality}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search backlinks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                <SelectItem value="high">High Quality</SelectItem>
                <SelectItem value="medium">Medium Quality</SelectItem>
                <SelectItem value="low">Low Quality</SelectItem>
                <SelectItem value="toxic">Toxic</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="disavowed">Disavowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Backlinks List */}
      <Card>
        <CardHeader>
          <CardTitle>Backlinks</CardTitle>
          <CardDescription>
            {backlinks.length} backlinks found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : backlinks.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No backlinks found. Try scanning a URL to discover backlinks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backlinks.map((backlink) => (
                <div key={backlink._id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold dark:text-gray-100">{backlink.sourceDomain}</span>
                        {backlink.domainAuthority && (
                          <Badge variant="outline">DA: {backlink.domainAuthority}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {backlink.title || backlink.sourceUrl}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {backlink.anchorText && `Anchor: "${backlink.anchorText}"`} • 
                        Discovered: {new Date(backlink.discoveredAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getQualityColor(backlink.linkQuality)}>
                        {backlink.linkQuality} Quality
                      </Badge>
                      <Badge className={getStatusColor(backlink.status)}>
                        {backlink.status}
                      </Badge>
                      <Badge variant="outline">{backlink.linkType}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Disclaimer */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Automated Backlink Generation:</strong> Our system attempts to generate backlinks automatically through directory submissions and other SEO activities. 
          However, we cannot guarantee that backlinks will be created or maintained. Backlink generation depends on various factors including directory approval processes, 
          website policies, and external factors beyond our control. Results may vary significantly between different websites and submission attempts.
        </AlertDescription>
      </Alert>
      </div>
    </DashboardLayout>
  )
}
