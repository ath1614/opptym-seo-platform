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
    industryAverage: 72,
    mobileScore: 74,
    desktopScore: 82,
    lastScan: '2023-06-15T14:30:00Z',
    performance: {
      score: 78,
      status: 'good',
      metrics: {
        firstContentfulPaint: {
          value: 1.2,
          unit: 's',
          rating: 'good',
          description: 'First Contentful Paint marks the time at which the first text or image is painted',
          improvement: 'Reduce render-blocking resources and optimize critical rendering path'
        },
        largestContentfulPaint: {
          value: 2.1,
          unit: 's',
          rating: 'good',
          description: 'Largest Contentful Paint marks the time at which the largest text or image is painted',
          improvement: 'Optimize images and prioritize visible content'
        },
        firstInputDelay: {
          value: 45,
          unit: 'ms',
          rating: 'good',
          description: 'First Input Delay measures interactivity - time from user input to response',
          improvement: 'Minimize main thread work and reduce JavaScript execution time'
        },
        cumulativeLayoutShift: {
          value: 0.08,
          unit: '',
          rating: 'good',
          description: 'Cumulative Layout Shift measures visual stability',
          improvement: 'Set explicit width/height for images and avoid inserting content above existing content'
        },
        totalBlockingTime: {
          value: 120,
          unit: 'ms',
          rating: 'needs improvement',
          description: 'Sum of all time periods between FCP and Time to Interactive',
          improvement: 'Reduce third-party code impact and minimize main thread work'
        },
        speedIndex: {
          value: 2.8,
          unit: 's',
          rating: 'needs improvement',
          description: 'Speed Index shows how quickly the contents of a page are visibly populated',
          improvement: 'Minimize render-blocking resources and optimize critical rendering path'
        }
      }
    },
    accessibility: {
      score: 92,
      status: 'excellent',
      issues: [
        {
          type: 'warning',
          message: 'Some images may not have alt text',
          severity: 'low',
          impact: 'Screen readers cannot provide context for these images',
          recommendation: 'Add descriptive alt text to all images'
        },
        {
          type: 'warning',
          message: 'Insufficient color contrast',
          severity: 'medium',
          impact: 'Text may be difficult to read for users with low vision',
          recommendation: 'Ensure text has a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text'
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
          severity: 'medium',
          impact: 'Insecure resources can be modified by attackers',
          recommendation: 'Update all resource URLs to use HTTPS'
        },
        {
          type: 'warning',
          message: 'JavaScript libraries with known vulnerabilities detected',
          severity: 'high',
          impact: 'Security vulnerabilities can be exploited by attackers',
          recommendation: 'Update jQuery to version 3.5.0 or later'
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
          severity: 'low',
          impact: 'Missing rich results opportunities in search',
          recommendation: 'Implement Schema.org markup for your content type'
        },
        {
          type: 'warning',
          message: 'Mobile viewport not set',
          severity: 'high',
          impact: 'Page may not be properly optimized for mobile devices',
          recommendation: 'Add a viewport meta tag with width=device-width, initial-scale=1'
        }
      ]
    },
    recommendations: [
      {
        title: 'Optimize images',
        priority: 'high',
        impact: 'High',
        description: 'Properly sized and compressed images can significantly improve load times',
        implementation: 'Use WebP format, compress images, and implement responsive images with srcset',
        potentialImprovement: '2.1s load time reduction',
        tools: ['ImageOptim', 'WebP Converter', 'Squoosh']
      },
      {
        title: 'Enable text compression',
        priority: 'high',
        impact: 'High',
        description: 'Text compression reduces the size of HTTP responses',
        implementation: 'Enable Gzip or Brotli compression on your web server',
        potentialImprovement: '1.8s load time reduction',
        tools: ['Gzip', 'Brotli']
      },
      {
        title: 'Minify CSS and JavaScript',
        priority: 'medium',
        impact: 'Medium',
        description: 'Minification removes unnecessary characters from code',
        implementation: 'Use tools like Terser for JS and CSSNano for CSS minification',
        potentialImprovement: '0.9s load time reduction',
        tools: ['Terser', 'CSSNano', 'UglifyJS']
      },
      {
        title: 'Implement a CDN',
        priority: 'medium',
        impact: 'Medium',
        description: 'Content Delivery Networks reduce server response times',
        implementation: 'Set up a CDN like Cloudflare, Akamai, or AWS CloudFront',
        potentialImprovement: 'Up to 40% faster load times',
        tools: ['Cloudflare', 'AWS CloudFront', 'Akamai']
      },
      {
        title: 'Implement lazy loading',
        priority: 'medium',
        impact: 'Medium',
        description: 'Lazy loading defers loading of non-critical resources',
        implementation: 'Add loading="lazy" attribute to images or use Intersection Observer API',
        potentialImprovement: 'Faster initial page load',
        tools: ['Intersection Observer API', 'lazysizes.js']
      }
    ],
    opportunities: [
      {
        name: 'Optimize Images',
        savings: '2.1s',
        description: 'Optimizing images could save 2.1 seconds of load time',
        affectedResources: [
          'hero-image.jpg (1.2MB → potential 300KB)',
          'product-gallery.jpg (800KB → potential 200KB)'
        ],
        implementation: 'Convert to WebP format and apply proper compression'
      },
      {
        name: 'Enable Compression',
        savings: '1.8s',
        description: 'Enabling compression could save 1.8 seconds of load time',
        affectedResources: [
          'main.js (450KB → potential 120KB)',
          'styles.css (280KB → potential 70KB)'
        ],
        implementation: 'Configure server to use Gzip or Brotli compression'
      },
      {
        name: 'Minify CSS',
        savings: '0.9s',
        description: 'Minifying CSS could save 0.9 seconds of load time',
        affectedResources: [
          'styles.css (280KB → potential 210KB)',
          'components.css (150KB → potential 110KB)'
        ],
        implementation: 'Use CSSNano or other CSS minification tools'
      }
    ],
    historicalData: [
      { date: '2023-05-15', score: 72 },
      { date: '2023-05-30', score: 75 },
      { date: '2023-06-15', score: 78 }
    ],
    competitorComparison: [
      { name: 'Competitor A', score: 85, url: 'https://competitora.com' },
      { name: 'Competitor B', score: 73, url: 'https://competitorb.com' },
      { name: 'Competitor C', score: 68, url: 'https://competitorc.com' }
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
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center">
                <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
                  {results.overallScore}
                </div>
                <span className="text-sm font-medium mt-1">Overall Score</span>
                <Badge className={getStatusColor(results.overallScore >= 90 ? 'excellent' : results.overallScore >= 70 ? 'good' : 'warning')}>
                  {results.overallScore >= 90 ? 'Excellent' : results.overallScore >= 70 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`text-4xl font-bold ${getScoreColor(results.mobileScore)}`}>
                  {results.mobileScore}
                </div>
                <span className="text-sm font-medium mt-1">Mobile Score</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`text-4xl font-bold ${getScoreColor(results.desktopScore)}`}>
                  {results.desktopScore}
                </div>
                <span className="text-sm font-medium mt-1">Desktop Score</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-muted-foreground">
                  {results.industryAverage}
                </div>
                <span className="text-sm font-medium mt-1">Industry Average</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Competitor Comparison</h4>
              <div className="space-y-3">
                {results.competitorComparison.map((competitor, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{competitor.name}</span>
                      <span className={competitor.score > results.overallScore ? "text-red-500" : "text-green-500"}>
                        {competitor.score}
                        {competitor.score > results.overallScore ? 
                          <span className="ml-1">↑</span> : 
                          <span className="ml-1">↓</span>}
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${competitor.score > results.overallScore ? "bg-red-500" : "bg-green-500"}`}
                        style={{ width: `${competitor.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last scan: {new Date(results.lastScan).toLocaleString()}</span>
              <span>URL: {results.url}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>
            Key metrics that affect user experience and SEO ranking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results.performance.metrics).map(([key, metric]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center">
                    {key === 'firstContentfulPaint' && <Clock className="h-4 w-4 mr-2" />}
                    {key === 'largestContentfulPaint' && <Gauge className="h-4 w-4 mr-2" />}
                    {key === 'firstInputDelay' && <Zap className="h-4 w-4 mr-2" />}
                    {key === 'cumulativeLayoutShift' && <AlertTriangle className="h-4 w-4 mr-2" />}
                    {key === 'totalBlockingTime' && <Clock className="h-4 w-4 mr-2" />}
                    {key === 'speedIndex' && <Gauge className="h-4 w-4 mr-2" />}
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <Badge className={getStatusColor(metric.rating)}>
                    {metric.rating.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs font-medium">How to improve:</p>
                  <p className="text-xs">{metric.improvement}</p>
                </div>
              </div>
            ))}
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
          <CardDescription>Specific areas where you can improve performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.opportunities.map((opportunity, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{opportunity.name}</h4>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Save {opportunity.savings}
                  </Badge>
                </div>
                <p className="text-sm mb-3">{opportunity.description}</p>
                
                <div className="space-y-2">
                  <h5 className="text-xs font-medium">Affected Resources:</h5>
                  <ul className="text-xs space-y-1 list-disc pl-4">
                    {opportunity.affectedResources.map((resource, j) => (
                      <li key={j}>{resource}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-3 bg-muted p-2 rounded">
                  <p className="text-xs font-medium">Implementation:</p>
                  <p className="text-xs">{opportunity.implementation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Historical Data */}
      <Card>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
          <CardDescription>Track your page speed improvements over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Trend</span>
              <Badge variant={
                results.historicalData[results.historicalData.length - 1].score > 
                results.historicalData[0].score ? "default" : "destructive"
              }>
                {results.historicalData[results.historicalData.length - 1].score > 
                 results.historicalData[0].score ? "Improving" : "Declining"}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {results.historicalData.map((data, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <span className="text-sm w-24">{new Date(data.date).toLocaleDateString()}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">{data.score}</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getScoreColor(data.score).replace('text-', 'bg-')}`}
                        style={{ width: `${data.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <CardTitle>Actionable Recommendations</CardTitle>
            <CardDescription>
              Prioritized steps to improve your page speed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.recommendations.map((rec, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {rec.priority === 'high' ? (
                        <Badge variant="destructive" className="mr-2">High Priority</Badge>
                      ) : rec.priority === 'medium' ? (
                        <Badge variant="secondary" className="mr-2">Medium Priority</Badge>
                      ) : (
                        <Badge variant="outline" className="mr-2">Low Priority</Badge>
                      )}
                      <h4 className="font-medium">{rec.title}</h4>
                    </div>
                    <span className="text-xs text-muted-foreground">Potential Gain: {rec.potentialImprovement}</span>
                  </div>
                  <p className="text-sm mb-3">{rec.description}</p>
                  <div className="bg-muted p-3 rounded text-sm mb-3">
                    <div className="font-medium mb-1">How to implement:</div>
                    <div className="text-xs">{rec.implementation}</div>
                  </div>
                  {rec.tools && rec.tools.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-medium">Recommended tools: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rec.tools.map((tool, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">{tool}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
