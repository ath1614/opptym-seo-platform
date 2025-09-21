"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertTriangle, XCircle, Info, BarChart3 } from 'lucide-react'

export function KeywordDensityResults() {
  const results = {
    url: 'https://example.com',
    totalWords: 1250,
    totalKeywords: 45,
    keywordDensity: [
      {
        keyword: 'SEO',
        count: 12,
        density: 0.96,
        status: 'good',
        recommendation: 'Good keyword density for SEO'
      },
      {
        keyword: 'marketing',
        count: 8,
        density: 0.64,
        status: 'good',
        recommendation: 'Optimal density for marketing keyword'
      },
      {
        keyword: 'digital',
        count: 15,
        density: 1.2,
        status: 'warning',
        recommendation: 'Slightly high density, consider reducing usage'
      },
      {
        keyword: 'strategy',
        count: 6,
        density: 0.48,
        status: 'good',
        recommendation: 'Good keyword density for strategy'
      },
      {
        keyword: 'content',
        count: 20,
        density: 1.6,
        status: 'error',
        recommendation: 'Keyword density too high, risk of keyword stuffing'
      }
    ],
    keywordDistribution: {
      title: ['SEO', 'marketing'],
      headings: ['digital', 'strategy', 'content'],
      body: ['SEO', 'marketing', 'digital', 'strategy', 'content'],
      meta: ['SEO', 'marketing']
    },
    recommendations: [
      'Reduce the density of "content" keyword to avoid keyword stuffing',
      'Consider using "digital" keyword more naturally in the content',
      'Add more semantic variations of your primary keywords',
      'Ensure keywords appear naturally in headings and subheadings'
    ],
    score: 78
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
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getDensityColor = (density: number) => {
    if (density <= 0.5) return 'text-green-600'
    if (density <= 1.0) return 'text-yellow-600'
    if (density <= 2.0) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Density Analysis Score</CardTitle>
          <CardDescription>
            Overall assessment of your keyword density optimization
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

      {/* Content Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.totalWords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Words analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keywords Found</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.totalKeywords}</div>
            <p className="text-xs text-muted-foreground">
              Unique keywords
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Density</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(results.keywordDensity.reduce((acc, kw) => acc + kw.density, 0) / results.keywordDensity.length).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average keyword density
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Keyword Density Table */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Density Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of keyword density for each term
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.keywordDensity.map((keyword, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(keyword.status)}
                    <h3 className="font-semibold">{keyword.keyword}</h3>
                    <Badge className={getStatusColor(keyword.status)}>
                      {keyword.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{keyword.count} occurrences</div>
                    <div className={`text-sm font-bold ${getDensityColor(keyword.density)}`}>
                      {keyword.density}%
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Density</span>
                    <span>{keyword.density}%</span>
                  </div>
                  <Progress 
                    value={Math.min(keyword.density * 50, 100)} 
                    className="h-2"
                  />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {keyword.recommendation}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keyword Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Distribution</CardTitle>
          <CardDescription>
            Where your keywords appear across different page elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Title Tag</h4>
              <div className="flex flex-wrap gap-2">
                {results.keywordDistribution.title.map((keyword, index) => (
                  <Badge key={index} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Headings (H1-H6)</h4>
              <div className="flex flex-wrap gap-2">
                {results.keywordDistribution.headings.map((keyword, index) => (
                  <Badge key={index} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Body Content</h4>
              <div className="flex flex-wrap gap-2">
                {results.keywordDistribution.body.map((keyword, index) => (
                  <Badge key={index} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Meta Tags</h4>
              <div className="flex flex-wrap gap-2">
                {results.keywordDistribution.meta.map((keyword, index) => (
                  <Badge key={index} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Suggestions to improve your keyword density
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
  )
}
