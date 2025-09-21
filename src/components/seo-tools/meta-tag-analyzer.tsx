"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

export function MetaTagResults() {
  // This would receive results as props in a real implementation
  const results = {
    url: 'https://example.com',
    title: {
      content: 'Example Website - Your Trusted Partner',
      length: 42,
      status: 'good',
      recommendation: 'Title length is optimal for SEO'
    },
    description: {
      content: 'We provide excellent services to help your business grow. Contact us today for a free consultation.',
      length: 98,
      status: 'good',
      recommendation: 'Description length is within optimal range'
    },
    keywords: {
      content: 'business, services, consultation, growth',
      status: 'warning',
      recommendation: 'Meta keywords are not recommended for SEO. Consider removing them.'
    },
    viewport: {
      content: 'width=device-width, initial-scale=1.0',
      status: 'good',
      recommendation: 'Viewport meta tag is properly configured for mobile'
    },
    robots: {
      content: 'index, follow',
      status: 'good',
      recommendation: 'Robots meta tag allows search engine indexing'
    },
    openGraph: {
      title: 'Example Website - Your Trusted Partner',
      description: 'We provide excellent services to help your business grow.',
      image: 'https://example.com/og-image.jpg',
      url: 'https://example.com',
      status: 'good',
      recommendation: 'Open Graph tags are properly configured for social sharing'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Example Website - Your Trusted Partner',
      description: 'We provide excellent services to help your business grow.',
      image: 'https://example.com/twitter-image.jpg',
      status: 'good',
      recommendation: 'Twitter Card tags are properly configured'
    },
    canonical: {
      content: 'https://example.com',
      status: 'good',
      recommendation: 'Canonical URL is properly set'
    },
    hreflang: {
      content: 'en-US',
      status: 'good',
      recommendation: 'Hreflang is properly configured for language targeting'
    },
    score: 85,
    issues: [
      {
        type: 'warning',
        message: 'Meta keywords tag is present but not recommended for SEO',
        severity: 'low'
      }
    ],
    recommendations: [
      'Remove the meta keywords tag as it is not used by search engines',
      'Consider adding structured data markup for better search results',
      'Add more specific Open Graph images for different page types'
    ]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
      default:
        return <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Meta Tag Analysis Score</CardTitle>
          <CardDescription>
            Overall assessment of your meta tags optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-primary">{results.score}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <Badge className={getStatusColor(results.score >= 80 ? 'good' : results.score >= 60 ? 'warning' : 'error')}>
                  {results.score >= 80 ? 'Excellent' : results.score >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              <Progress value={results.score} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Meta Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(results.title.status)}
              <span>Title Tag</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Content</p>
              <p className="text-sm">{results.title.content}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Length</span>
              <Badge variant="outline">{results.title.length} characters</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
              <p className="text-sm text-green-600 dark:text-green-400">{results.title.recommendation}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(results.description.status)}
              <span>Meta Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Content</p>
              <p className="text-sm">{results.description.content}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Length</span>
              <Badge variant="outline">{results.description.length} characters</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
              <p className="text-sm text-green-600 dark:text-green-400">{results.description.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Meta Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(results.viewport.status)}
              <span>Viewport</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Content</p>
              <p className="text-sm font-mono">{results.viewport.content}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
              <p className="text-sm text-green-600 dark:text-green-400">{results.viewport.recommendation}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(results.robots.status)}
              <span>Robots</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Content</p>
              <p className="text-sm font-mono">{results.robots.content}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
              <p className="text-sm text-green-600 dark:text-green-400">{results.robots.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(results.openGraph.status)}
              <span>Open Graph</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-sm">{results.openGraph.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{results.openGraph.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Image</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 break-all">{results.openGraph.image}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
              <p className="text-sm text-green-600 dark:text-green-400">{results.openGraph.recommendation}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(results.twitter.status)}
              <span>Twitter Cards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Card Type</p>
              <p className="text-sm font-mono">{results.twitter.card}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-sm">{results.twitter.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Image</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 break-all">{results.twitter.image}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
              <p className="text-sm text-green-600 dark:text-green-400">{results.twitter.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issues Found</CardTitle>
            <CardDescription>
              Problems that need to be addressed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.issues.length > 0 ? (
              <div className="space-y-3">
                {results.issues.map((issue, index) => (
                  <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>{issue.message}</span>
                        <Badge variant="outline" className="ml-2">
                          {issue.severity}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No issues found!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Suggestions to improve your meta tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
