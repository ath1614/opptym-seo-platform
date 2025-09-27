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
    score: 85,
    industryAverage: 72,
    competitorScores: [
      { name: 'competitor1.com', score: 78 },
      { name: 'competitor2.com', score: 82 },
      { name: 'competitor3.com', score: 69 }
    ],
    title: {
      content: 'Example Website - Your Trusted Partner',
      length: 42,
      status: 'good',
      recommendation: 'Title length is optimal for SEO',
      idealLength: '50-60 characters',
      keywordsPresent: ['website', 'partner'],
      impact: 'High',
      bestPractices: [
        'Include primary keyword near the beginning',
        'Keep each title unique across the site',
        'Make it compelling for users to click'
      ]
    },
    description: {
      content: 'We provide excellent services to help your business grow. Contact us today for a free consultation.',
      length: 98,
      status: 'good',
      recommendation: 'Description length is within optimal range',
      idealLength: '120-155 characters',
      keywordsPresent: ['services', 'business', 'consultation'],
      impact: 'Medium',
      bestPractices: [
        'Include primary and secondary keywords naturally',
        'Add a call-to-action when appropriate',
        'Avoid duplicate descriptions across pages'
      ]
    },
    keywords: {
      content: 'business, services, consultation, growth',
      status: 'warning',
      recommendation: 'Meta keywords are not recommended for SEO. Consider removing them.',
      impact: 'Low',
      bestPractices: [
        'Most search engines ignore this tag',
        'Can reveal SEO strategy to competitors',
        'Focus on content optimization instead'
      ]
    },
    viewport: {
      content: 'width=device-width, initial-scale=1',
      status: 'good',
      recommendation: 'Viewport is properly configured for mobile devices',
      impact: 'High'
    },
    robots: {
      content: 'index, follow',
      status: 'good',
      recommendation: 'Robots meta tag is properly configured',
      impact: 'Medium'
    },
    openGraph: {
      status: 'good',
      title: 'Example Website - Your Trusted Partner',
      description: 'We provide excellent services to help your business grow.',
      image: 'https://example.com/og-image.jpg',
      url: 'https://example.com',
      type: 'website',
      impact: 'High',
      recommendation: 'All essential Open Graph tags are present'
    },
    twitterCard: {
      status: 'good',
      card: 'summary_large_image',
      title: 'Example Website - Your Trusted Partner',
      description: 'We provide excellent services to help your business grow.',
      image: 'https://example.com/twitter-image.jpg',
      impact: 'Medium',
      recommendation: 'Twitter Card is properly configured'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Meta Tags Score</CardTitle>
          <CardDescription>
            Overall assessment of your meta tags optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-primary mb-2">{results.score}</div>
                <span className="text-sm font-medium">Your Score</span>
                <Badge className={getStatusColor(results.score >= 80 ? 'good' : results.score >= 60 ? 'warning' : 'error')}>
                  {results.score >= 80 ? 'Excellent' : results.score >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-amber-500 mb-2">{results.industryAverage}</div>
                <span className="text-sm font-medium">Industry Average</span>
              </div>
            </div>
            
            <div className="w-full">
              <h4 className="text-sm font-medium mb-3">Competitor Comparison</h4>
              <div className="space-y-3">
                {results.competitorScores.map((competitor, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-xs w-28 truncate">{competitor.name}</span>
                    <div className="flex-1">
                      <Progress 
                        value={competitor.score} 
                        className={`h-1.5 ${
                          competitor.score > results.score ? 'bg-red-100 dark:bg-red-900/50' : 
                          competitor.score === results.score ? 'bg-yellow-100 dark:bg-yellow-900/50' : 
                          'bg-green-100 dark:bg-green-900/50'
                        }`} 
                      />
                    </div>
                    <span className="text-xs font-medium">{competitor.score}</span>
                    <span className="text-xs">
                      {competitor.score > results.score ? 
                        <span className="text-red-500">↑</span> : 
                        <span className="text-green-500">↓</span>}
                    </span>
                  </div>
                ))}
              </div>
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
              <Badge className={getStatusColor(results.title.status)}>
                {results.title.impact} Impact
              </Badge>
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
              <Badge className={getStatusColor(results.openGraph.status)}>
                {results.openGraph.impact} Impact
              </Badge>
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
              <p className="text-sm font-mono text-blue-600">{results.openGraph.image}</p>
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
              {getStatusIcon(results.twitterCard.status)}
              <span>Twitter Card</span>
              <Badge className={getStatusColor(results.twitterCard.status)}>
                {results.twitterCard.impact} Impact
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Card Type</p>
              <p className="text-sm font-mono">{results.twitterCard.card}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-sm">{results.twitterCard.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{results.twitterCard.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
              <p className="text-sm text-green-600 dark:text-green-400">{results.twitterCard.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
