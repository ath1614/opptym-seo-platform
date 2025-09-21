"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, XCircle, Info, Gauge, Clock, Zap } from 'lucide-react'

export function PageSpeedResults() {
  const results = {
    url: 'https://example.com',
    overallScore: 78,
    performance: {
      score: 78,
      status: 'good',
      metrics: {
        firstContentfulPaint: 1.2,
        largestContentfulPaint: 2.1,
        firstInputDelay: 45,
        cumulativeLayoutShift: 0.08
      }
    },
    accessibility: {
      score: 92,
      status: 'excellent',
      issues: [
        {
          type: 'warning',
          message: 'Some images may not have alt text',
          severity: 'low'
        }
      ]
    },
    bestPractices: {
      score: 85,
      status: 'good',
      issues: [
        {
          type: 'warning',
          message: 'Consider using HTTPS for all resources',
          severity: 'medium'
        }
      ]
    },
    seo: {
      score: 88,
      status: 'good',
      issues: [
        {
          type: 'info',
          message: 'Consider adding more structured data',
          severity: 'low'
        }
      ]
    },
    recommendations: [
      'Optimize images to reduce file sizes',
      'Enable compression for text resources',
      'Minify CSS and JavaScript files',
      'Use a Content Delivery Network (CDN)',
      'Implement lazy loading for images'
    ],
    opportunities: [
      {
        name: 'Optimize Images',
        savings: '2.1s',
        description: 'Optimizing images could save 2.1 seconds of load time'
      },
      {
        name: 'Enable Compression',
        savings: '1.8s',
        description: 'Enabling compression could save 1.8 seconds of load time'
      },
      {
        name: 'Minify CSS',
        savings: '0.9s',
        description: 'Minifying CSS could save 0.9 seconds of load time'
      }
    ]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-500" />
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
      case 'excellent':
        return 'bg-green-100 text-green-800'
      case 'good':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Page Speed Analysis</CardTitle>
          <CardDescription>
            Overall performance assessment of your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
              {results.overallScore}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <Badge className={getStatusColor(results.overallScore >= 90 ? 'excellent' : results.overallScore >= 70 ? 'good' : 'warning')}>
                  {results.overallScore >= 90 ? 'Excellent' : results.overallScore >= 70 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              <Progress value={results.overallScore} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>
            Key metrics that affect user experience and SEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">First Contentful Paint</h3>
              <p className="text-2xl font-bold text-green-600">{results.performance.metrics.firstContentfulPaint}s</p>
              <p className="text-sm text-muted-foreground">Good</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                <Gauge className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Largest Contentful Paint</h3>
              <p className="text-2xl font-bold text-green-600">{results.performance.metrics.largestContentfulPaint}s</p>
              <p className="text-sm text-muted-foreground">Good</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold">First Input Delay</h3>
              <p className="text-2xl font-bold text-yellow-600">{results.performance.metrics.firstInputDelay}ms</p>
              <p className="text-sm text-muted-foreground">Needs Improvement</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                <Gauge className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Cumulative Layout Shift</h3>
              <p className="text-2xl font-bold text-green-600">{results.performance.metrics.cumulativeLayoutShift}</p>
              <p className="text-sm text-muted-foreground">Good</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            {getStatusIcon(results.performance.status)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(results.performance.score)}`}>
              {results.performance.score}
            </div>
            <Progress value={results.performance.score} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
            {getStatusIcon(results.accessibility.status)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(results.accessibility.score)}`}>
              {results.accessibility.score}
            </div>
            <Progress value={results.accessibility.score} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Practices</CardTitle>
            {getStatusIcon(results.bestPractices.status)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(results.bestPractices.score)}`}>
              {results.bestPractices.score}
            </div>
            <Progress value={results.bestPractices.score} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO</CardTitle>
            {getStatusIcon(results.seo.status)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(results.seo.score)}`}>
              {results.seo.score}
            </div>
            <Progress value={results.seo.score} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Optimization Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Opportunities</CardTitle>
          <CardDescription>
            Potential improvements that could enhance your page speed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.opportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{opportunity.name}</h4>
                  <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{opportunity.savings}</div>
                  <div className="text-sm text-muted-foreground">potential savings</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            <div className="space-y-3">
              {[
                ...results.accessibility.issues,
                ...results.bestPractices.issues,
                ...results.seo.issues
              ].map((issue, index) => (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Suggestions to improve your page speed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
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
