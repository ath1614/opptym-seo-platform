"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  ExternalLink,
  Image,
  Link,
  Smartphone,
  Search,
  Code,
  Shield,
  Zap,
  Eye,
  Settings,
  FileText
} from 'lucide-react'

interface SEOIssue {
  id: string
  category: 'meta-tags' | 'images' | 'links' | 'mobile' | 'performance' | 'accessibility' | 'content' | 'technical'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  recommendation: string
  fixEffort: 'easy' | 'medium' | 'hard'
  seoImpact: 'high' | 'medium' | 'low'
  affectedPages: number
  examples?: string[]
}

interface SEOIssuesAnalysisProps {
  analysisData: {
    metaTags?: {
      title: { status: string; recommendation?: string; content?: string }
      description: { status: string; recommendation?: string; content?: string }
      viewport: { status: string }
      canonical: { status: string }
    }
    altText?: {
      missingAlt: number
      images?: Array<{ alt?: string; src?: string }>
    }
    brokenLinks?: {
      broken: number
      links?: Array<{ status?: number | string; url?: string }>
    }
    pageSpeed?: {
      overallScore: number
    }
    recommendations?: Array<string>
  }
}

const categoryIcons = {
  'meta-tags': Search,
  'images': Image,
  'links': Link,
  'mobile': Smartphone,
  'performance': Zap,
  'accessibility': Eye,
  'content': FileText,
  'technical': Settings
}

const severityColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
}

const effortColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
}

export function SEOIssuesAnalysis({ analysisData }: SEOIssuesAnalysisProps) {
  // Generate SEO issues from analysis data
  const generateSEOIssues = (): SEOIssue[] => {
    const issues: SEOIssue[] = []

    // Meta Tags Issues
    if (analysisData.metaTags) {
      if (analysisData.metaTags.title.status !== 'good') {
        issues.push({
          id: 'meta-title',
          category: 'meta-tags',
          severity: analysisData.metaTags.title.status === 'error' ? 'critical' : 'high',
          title: 'Title Tag Issues',
          description: analysisData.metaTags.title.recommendation,
          impact: 'Affects search engine rankings and click-through rates',
          recommendation: 'Optimize title tag length and content for better SEO performance',
          fixEffort: 'easy',
          seoImpact: 'high',
          affectedPages: 1,
          examples: [analysisData.metaTags.title.content]
        })
      }

      if (analysisData.metaTags.description.status !== 'good') {
        issues.push({
          id: 'meta-description',
          category: 'meta-tags',
          severity: analysisData.metaTags.description.status === 'error' ? 'critical' : 'high',
          title: 'Meta Description Issues',
          description: analysisData.metaTags.description.recommendation,
          impact: 'Affects search result snippets and click-through rates',
          recommendation: 'Write compelling meta descriptions within 120-160 characters',
          fixEffort: 'easy',
          seoImpact: 'high',
          affectedPages: 1,
          examples: [analysisData.metaTags.description.content]
        })
      }

      if (analysisData.metaTags.viewport.status === 'error') {
        issues.push({
          id: 'viewport-missing',
          category: 'mobile',
          severity: 'critical',
          title: 'Missing Viewport Meta Tag',
          description: 'Viewport meta tag is missing, affecting mobile optimization',
          impact: 'Poor mobile user experience and mobile search rankings',
          recommendation: 'Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">',
          fixEffort: 'easy',
          seoImpact: 'high',
          affectedPages: 1
        })
      }

      if (analysisData.metaTags.canonical.status === 'warning') {
        issues.push({
          id: 'canonical-missing',
          category: 'technical',
          severity: 'medium',
          title: 'Missing Canonical URL',
          description: 'Canonical URL is not set, which may cause duplicate content issues',
          impact: 'Potential duplicate content penalties from search engines',
          recommendation: 'Add canonical URL to prevent duplicate content issues',
          fixEffort: 'easy',
          seoImpact: 'medium',
          affectedPages: 1
        })
      }
    }

    // Image Alt Text Issues
    if (analysisData.altText) {
      if (analysisData.altText.missingAlt > 0) {
        issues.push({
          id: 'missing-alt-text',
          category: 'images',
          severity: analysisData.altText.missingAlt > 5 ? 'high' : 'medium',
          title: 'Missing Alt Text',
          description: `${analysisData.altText.missingAlt} images are missing alt text`,
          impact: 'Poor accessibility and missed SEO opportunities',
          recommendation: 'Add descriptive alt text to all images for better accessibility and SEO',
          fixEffort: 'medium',
          seoImpact: 'medium',
          affectedPages: 1,
          examples: analysisData.altText.images?.filter((img: { alt?: string }) => !img.alt).map((img: { src?: string }) => img.src || '').slice(0, 3)
        })
      }
    }

    // Broken Links Issues
    if (analysisData.brokenLinks) {
      if (analysisData.brokenLinks.broken > 0) {
        issues.push({
          id: 'broken-links',
          category: 'links',
          severity: analysisData.brokenLinks.broken > 10 ? 'high' : 'medium',
          title: 'Broken Links Found',
          description: `${analysisData.brokenLinks.broken} broken links found on the website`,
          impact: 'Poor user experience and lost link equity',
          recommendation: 'Fix or remove broken links to improve user experience and SEO',
          fixEffort: 'medium',
          seoImpact: 'medium',
          affectedPages: 1,
          examples: analysisData.brokenLinks.links?.filter((link: { status?: number | string }) => link.status === 404).map((link: { url?: string }) => link.url || '').slice(0, 3)
        })
      }
    }

    // Page Speed Issues
    if (analysisData.pageSpeed) {
      if (analysisData.pageSpeed.overallScore < 70) {
        issues.push({
          id: 'page-speed',
          category: 'performance',
          severity: analysisData.pageSpeed.overallScore < 50 ? 'critical' : 'high',
          title: 'Poor Page Speed',
          description: `Page speed score is ${analysisData.pageSpeed.overallScore}, which is below recommended threshold`,
          impact: 'Poor user experience and lower search rankings',
          recommendation: 'Optimize images, enable compression, and minify CSS/JS files',
          fixEffort: 'hard',
          seoImpact: 'high',
          affectedPages: 1
        })
      }
    }

    return issues
  }

  const issues = generateSEOIssues()
  const criticalIssues = issues.filter(issue => issue.severity === 'critical')
  const highIssues = issues.filter(issue => issue.severity === 'high')
  const mediumIssues = issues.filter(issue => issue.severity === 'medium')
  const lowIssues = issues.filter(issue => issue.severity === 'low')

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Info
    return <IconComponent className="h-4 w-4" />
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Issues Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>SEO Issues Summary</span>
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of SEO issues found on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{criticalIssues.length}</div>
              <div className="text-sm text-red-600">Critical</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{highIssues.length}</div>
              <div className="text-sm text-orange-600">High</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{mediumIssues.length}</div>
              <div className="text-sm text-yellow-600">Medium</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{lowIssues.length}</div>
              <div className="text-sm text-blue-600">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Critical Issues</span>
            </CardTitle>
            <CardDescription>
              Issues that require immediate attention and significantly impact SEO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalIssues.map((issue) => (
                <Alert key={issue.id} className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(issue.category)}
                        <span className="font-semibold">{issue.title}</span>
                        <Badge className={severityColors[issue.severity]}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm">{issue.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Impact: {issue.impact}</span>
                        <span>Effort: {issue.fixEffort}</span>
                        <span>SEO Impact: {issue.seoImpact}</span>
                      </div>
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-sm font-medium text-green-700">Recommendation:</p>
                        <p className="text-sm">{issue.recommendation}</p>
                      </div>
                      {issue.examples && issue.examples.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                          <div className="space-y-1">
                            {issue.examples.map((example, index) => (
                              <div key={index} className="text-xs font-mono bg-gray-100 p-1 rounded">
                                {example}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Priority Issues */}
      {highIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <span>High Priority Issues</span>
            </CardTitle>
            <CardDescription>
              Issues that should be addressed soon for better SEO performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highIssues.map((issue) => (
                <Alert key={issue.id} className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(issue.category)}
                        <span className="font-semibold">{issue.title}</span>
                        <Badge className={severityColors[issue.severity]}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm">{issue.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Impact: {issue.impact}</span>
                        <span>Effort: {issue.fixEffort}</span>
                        <span>SEO Impact: {issue.seoImpact}</span>
                      </div>
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-sm font-medium text-green-700">Recommendation:</p>
                        <p className="text-sm">{issue.recommendation}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medium Priority Issues */}
      {mediumIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Medium Priority Issues</span>
            </CardTitle>
            <CardDescription>
              Issues that can be addressed when time permits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mediumIssues.map((issue) => (
                <Alert key={issue.id} className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(issue.category)}
                        <span className="font-semibold">{issue.title}</span>
                        <Badge className={severityColors[issue.severity]}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm">{issue.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Impact: {issue.impact}</span>
                        <span>Effort: {issue.fixEffort}</span>
                        <span>SEO Impact: {issue.seoImpact}</span>
                      </div>
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-sm font-medium text-green-700">Recommendation:</p>
                        <p className="text-sm">{issue.recommendation}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Priority Issues */}
      {lowIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-600">
              <Info className="h-5 w-5" />
              <span>Low Priority Issues</span>
            </CardTitle>
            <CardDescription>
              Minor issues that can be addressed for optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowIssues.map((issue) => (
                <Alert key={issue.id} className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(issue.category)}
                        <span className="font-semibold">{issue.title}</span>
                        <Badge className={severityColors[issue.severity]}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm">{issue.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Impact: {issue.impact}</span>
                        <span>Effort: {issue.fixEffort}</span>
                        <span>SEO Impact: {issue.seoImpact}</span>
                      </div>
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-sm font-medium text-green-700">Recommendation:</p>
                        <p className="text-sm">{issue.recommendation}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Recommended Action Plan</span>
          </CardTitle>
          <CardDescription>
            Prioritized list of actions to improve your website's SEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues
              .sort((a, b) => {
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                return severityOrder[a.severity] - severityOrder[b.severity]
              })
              .map((issue, index) => (
                <div key={issue.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getCategoryIcon(issue.category)}
                      <span className="font-semibold">{issue.title}</span>
                      <Badge className={severityColors[issue.severity]}>
                        {issue.severity}
                      </Badge>
                      <Badge className={effortColors[issue.fixEffort]}>
                        {issue.fixEffort} effort
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{issue.recommendation}</p>
                    <div className="text-xs text-muted-foreground">
                      SEO Impact: {issue.seoImpact} • Affected Pages: {issue.affectedPages}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
