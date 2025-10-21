"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Globe, Loader2, FileText, AlertTriangle, CheckCircle, XCircle, Search, Zap, RefreshCw } from 'lucide-react'

export default function AnalyzeWebsitePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any | null>(null)
  const [reportStatus, setReportStatus] = useState<string | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  // Usage banner state
  const [usageStats, setUsageStats] = useState<any | null>(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState<string | null>(null)

  const runAnalysis = async () => {
    setError(null)
    setReportStatus(null)
    setAnalysis(null)

    const target = url.trim()
    if (!target) {
      setError('Please enter a website URL.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/seo-tools/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, toolType: 'website-analyzer' })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to analyze the website.')
        return
      }
      setAnalysis(json.data)
    } catch (e) {
      setError('Network error while running analysis.')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    if (!analysis || !url.trim()) return
    try {
      setReportLoading(true)
      setReportStatus(null)
      const summary = {
        overallScore: analysis.overallScore,
        brokenLinks: analysis.brokenLinks?.broken ?? 0,
        metaTitleStatus: analysis.metaTags?.title?.status ?? 'unknown',
        metaDescriptionStatus: analysis.metaTags?.description?.status ?? 'unknown',
        altTextCoverage: analysis.altText?.healthScore ?? 0,
        pageSpeedScore: analysis.pageSpeed?.overallScore ?? 0
      }
      const res = await fetch('/api/reports/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), analysisSummary: summary })
      })
      const json = await res.json()
      if (!res.ok) {
        setReportStatus(json.error || 'Failed to generate report.')
        return
      }
      setReportStatus('Report generated successfully. Downloading JSON...')
      // Offer a simple JSON export for now
      const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' })
      const dlUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = dlUrl
      a.download = `seo-analysis-${new Date().toISOString().slice(0,10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(dlUrl)
    } catch (e) {
      setReportStatus('Network error while generating report.')
    } finally {
      setReportLoading(false)
    }
  }

  // Fetch usage stats for banner
  const fetchUsageStats = async () => {
    try {
      setUsageLoading(true)
      setUsageError(null)
      const res = await fetch('/api/dashboard/usage')
      const json = await res.json()
      if (!res.ok) {
        setUsageError(json.error || 'Failed to fetch usage stats.')
        return
      }
      setUsageStats(json)
    } catch (e) {
      setUsageError('Network error while fetching usage stats.')
    } finally {
      setUsageLoading(false)
    }
  }

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fmtLimit = (value: any) => (value === 'unlimited' || value === -1 ? '∞' : value)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Globe className="h-6 w-6" />
            <span>Analyze Website</span>
          </h1>
          <p className="text-muted-foreground mt-2">Run a quick, aggregated SEO review across five core checks: meta tags, alt text, broken links, page speed, and canonical.</p>
        </div>
      </div>

      {/* Usage & Limits Banner */}
      <Alert className="border-blue-200">
        <Zap className="h-4 w-4" />
        <AlertTitle>Usage & Limits</AlertTitle>
        <AlertDescription>
          {usageLoading ? (
            <div className="text-sm">Loading usage...</div>
          ) : usageError ? (
            <div className="text-sm text-red-600">{usageError}</div>
          ) : usageStats ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={usageStats.plan === 'free' ? 'secondary' : 'default'}>
                    Plan: {usageStats.plan?.toUpperCase?.()}
                  </Badge>
                  {usageStats.isAtLimit?.seoTools || usageStats.isAtLimit?.reports ? (
                    <Badge variant="destructive">Limit reached</Badge>
                  ) : (
                    <Badge variant="outline">Within limits</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={fetchUsageStats} className="h-8">
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="text-sm">
                  <div className="font-medium">SEO Tools</div>
                  <div className="text-muted-foreground">
                    Monthly: {usageStats.usage?.seoTools} / {fmtLimit(usageStats.limits?.seoTools)}
                  </div>
                  <div className="text-muted-foreground">
                    Today: {usageStats.todayUsage?.seoTools ?? 0} / {fmtLimit(usageStats.dailyLimits?.seoToolsPerDay ?? usageStats.dailyLimits?.seoToolsPerDay)}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Reports</div>
                  <div className="text-muted-foreground">
                    Monthly: {usageStats.usage?.reports} / {fmtLimit(usageStats.limits?.reports)}
                  </div>
                  <div className="text-muted-foreground">
                    Today: {usageStats.todayUsage?.reports ?? 0} / {fmtLimit(usageStats.dailyLimits?.reportsPerDay ?? usageStats.dailyLimits?.reportsPerDay)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm">No usage data available.</div>
          )}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Enter Website URL</CardTitle>
          <CardDescription>We’ll fetch the page and analyze key on-page SEO signals.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Label htmlFor="url">Website URL</Label>
              <Input id="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <Button onClick={runAnalysis} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-4 flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Overall score and quick health indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Score</span>
                    <Badge variant="outline">{analysis.overallScore}%</Badge>
                  </div>
                  <Progress value={analysis.overallScore || 0} className="h-2 mt-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analysis.brokenLinks?.broken ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Broken Links</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analysis.altText?.healthScore ?? 0}%</div>
                    <div className="text-xs text-muted-foreground">Alt Text Coverage</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meta Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Meta Tags</CardTitle>
              <CardDescription>Title, description, viewport, robots, OG, canonical</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Title</span>
                    <Badge variant="outline">{analysis.metaTags?.title?.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{analysis.metaTags?.title?.recommendation}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Description</span>
                    <Badge variant="outline">{analysis.metaTags?.description?.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{analysis.metaTags?.description?.recommendation}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Viewport</span>
                    <Badge variant="outline">{analysis.metaTags?.viewport?.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{analysis.metaTags?.viewport?.recommendation}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Robots</span>
                    <Badge variant="outline">{analysis.metaTags?.robots?.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{analysis.metaTags?.robots?.recommendation}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Open Graph</span>
                    <Badge variant="outline">{analysis.metaTags?.openGraph?.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{analysis.metaTags?.openGraph?.recommendation}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Canonical</span>
                    <Badge variant="outline">{analysis.metaTags?.canonical?.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{analysis.metaTags?.canonical?.recommendation}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Broken Links */}
          <Card>
            <CardHeader>
              <CardTitle>Link Health</CardTitle>
              <CardDescription>Broken vs working links and redirects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.brokenLinks?.total ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Total Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analysis.brokenLinks?.broken ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Broken</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.brokenLinks?.working ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Working</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{analysis.brokenLinks?.redirects ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Redirects</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alt Text */}
          <Card>
            <CardHeader>
              <CardTitle>Alt Text</CardTitle>
              <CardDescription>Coverage and image accessibility issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Alt Text Coverage</span>
                <Badge variant="outline">{analysis.altText?.healthScore ?? 0}%</Badge>
              </div>
              <Progress value={analysis.altText?.healthScore || 0} className="h-2" />
            </CardContent>
          </Card>

          {/* Page Speed */}
          <Card>
            <CardHeader>
              <CardTitle>Page Speed (Simulated)</CardTitle>
              <CardDescription>Performance, accessibility, best practices, and SEO scores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall</span>
                <Badge variant="outline">{analysis.pageSpeed?.overallScore ?? 0}</Badge>
              </div>
              <Progress value={analysis.pageSpeed?.overallScore || 0} className="h-2" />
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Prioritized, actionable suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 ? (
                <div className="space-y-2">
                  {analysis.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="flex items-start space-x-2">
                      {rec.priority === 'high' ? (
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      ) : rec.priority === 'medium' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{rec.title}</div>
                        <div className="text-xs text-muted-foreground">{rec.description}</div>
                        <div className="text-xs"><Badge variant="secondary">{rec.category}</Badge> <Badge variant="outline">{rec.priority}</Badge></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No recommendations available.</div>
              )}
            </CardContent>
          </Card>

          {/* Generate Report */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>Save and export this analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Button onClick={generateReport} disabled={reportLoading}>
                  {reportLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
                {reportStatus && (
                  <span className="text-sm text-muted-foreground">{reportStatus}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}