"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { ExternalLink, TrendingUp, Shield, AlertTriangle, CheckCircle, Globe, Users, Search, Loader2, Info } from 'lucide-react'

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

export default function BacklinkScannerPage() {
  const { data: session } = useSession()
  const { showToast } = useToast()
  const [targetUrl, setTargetUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [stats, setStats] = useState<BacklinkStats | null>(null)
  const [hasScanned, setHasScanned] = useState(false)

  const handleScan = async () => {
    if (!targetUrl.trim()) {
      showToast({
        title: 'Error',
        description: 'Please enter a target URL to scan',
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
        body: JSON.stringify({ targetUrl: targetUrl.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setBacklinks(data.backlinks || [])
        setStats(data.stats)
        setHasScanned(true)
        showToast({
          title: 'Success',
          description: data.message || 'Backlink scan completed',
          variant: 'default'
        })
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

  const loadExistingBacklinks = async () => {
    try {
      const response = await fetch('/api/backlinks?limit=100')
      const data = await response.json()
      
      if (response.ok) {
        setBacklinks(data.backlinks || [])
        setStats(data.stats)
        setHasScanned(true)
      }
    } catch (error) {
      console.error('Failed to load existing backlinks:', error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      loadExistingBacklinks()
    }
  }, [session?.user])

  return (
    <SEOToolLayout
      toolId="backlink-scanner"
      toolName="Backlink Scanner"
      toolDescription="Analyze backlinks pointing to your website to understand your link profile and identify opportunities."
      mockData={null}
    >
      <div className="space-y-6">
        {/* Important Disclaimer */}
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Important Disclaimer:</strong> Our backlink scanner provides automated analysis based on available data sources. 
            We do not guarantee the accuracy or completeness of backlink detection. Backlinks are generated automatically when possible 
            through directory submissions and other SEO activities, but results may vary. This tool is for informational purposes only 
            and should not be the sole basis for SEO decisions.
          </AlertDescription>
        </Alert>

        {/* Scan Input */}
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
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
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

        {/* Results */}
        {hasScanned && (
          <>
            {/* Overall Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ExternalLink className="h-5 w-5 text-primary" />
                    <span>Backlink Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Comprehensive analysis of your website's backlink profile and authority
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalBacklinks}</div>
                      <div className="text-sm text-blue-600">Total Backlinks</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.uniqueDomains}</div>
                      <div className="text-sm text-green-600">Referring Domains</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.avgDomainAuthority}</div>
                      <div className="text-sm text-purple-600">Avg Domain Authority</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.highQuality}</div>
                      <div className="text-sm text-orange-600">High Quality Links</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Backlinks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Discovered Backlinks</span>
                </CardTitle>
                <CardDescription>
                  Backlinks discovered through automated analysis and directory submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {backlinks.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No backlinks found yet. Try scanning a URL to discover backlinks.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {backlinks.slice(0, 10).map((backlink) => (
                      <div key={backlink._id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{backlink.sourceDomain}</span>
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
                            <Badge 
                              variant={
                                backlink.linkQuality === 'high' ? 'default' : 
                                backlink.linkQuality === 'medium' ? 'secondary' : 
                                'outline'
                              }
                            >
                              {backlink.linkQuality} Quality
                            </Badge>
                            <Badge variant="outline">{backlink.linkType}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Link Profile Analysis */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Link Profile Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of your backlink profile characteristics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Link Quality Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>High Quality:</span>
                          <span className="font-medium text-green-600">{stats.highQuality} ({stats.totalBacklinks > 0 ? Math.round((stats.highQuality / stats.totalBacklinks) * 100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medium Quality:</span>
                          <span className="font-medium text-blue-600">{stats.mediumQuality} ({stats.totalBacklinks > 0 ? Math.round((stats.mediumQuality / stats.totalBacklinks) * 100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low Quality:</span>
                          <span className="font-medium text-orange-600">{stats.lowQuality} ({stats.totalBacklinks > 0 ? Math.round((stats.lowQuality / stats.totalBacklinks) * 100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Toxic Links:</span>
                          <span className="font-medium text-red-600">{stats.toxicLinks} ({stats.totalBacklinks > 0 ? Math.round((stats.toxicLinks / stats.totalBacklinks) * 100) : 0}%)</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Profile Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Backlinks:</span>
                          <span className="font-medium">{stats.totalBacklinks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unique Domains:</span>
                          <span className="font-medium">{stats.uniqueDomains}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Domain Authority:</span>
                          <span className="font-medium">{stats.avgDomainAuthority}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profile Health:</span>
                          <span className={`font-medium ${stats.toxicLinks === 0 ? 'text-green-600' : stats.toxicLinks < 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {stats.toxicLinks === 0 ? 'Clean' : stats.toxicLinks < 5 ? 'Good' : 'Needs Attention'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Link Building Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Focus on High-Quality Links:</strong> {stats && stats.highQuality < 5 ? 'You have very few high-quality backlinks. ' : 'Continue building high-quality backlinks from '} reputable, relevant websites with strong domain authority.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <ExternalLink className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Diversify Link Sources:</strong> Use our directory submission tool to automatically generate backlinks from various sources. This helps diversify your link profile naturally.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Monitor Your Profile:</strong> {stats && stats.toxicLinks > 0 ? `You have ${stats.toxicLinks} potentially toxic links. ` : 'Your link profile appears clean. '}Regular monitoring helps maintain a healthy backlink profile.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Automated Link Building:</strong> Our platform automatically generates backlinks through directory submissions and other SEO activities. Results may vary and are not guaranteed.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Additional Disclaimer */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Automated Backlink Generation:</strong> Our system attempts to generate backlinks automatically through directory submissions and other SEO activities. 
                However, we cannot guarantee that backlinks will be created or maintained. Backlink generation depends on various factors including directory approval processes, 
                website policies, and external factors beyond our control. Results may vary significantly between different websites and submission attempts.
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </SEOToolLayout>
  )
}
