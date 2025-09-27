"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, AlertTriangle, XCircle, Info, BarChart3, TrendingUp, Target, Lightbulb, Users, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react'

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
        recommendation: 'Good keyword density for SEO',
        impact: 'High',
        semanticVariations: ['search engine optimization', 'search ranking', 'SERP'],
        idealDensity: '0.8-1.2%',
        position: 'primary',
        trendChange: 0.12,
        lastMonthDensity: 0.84,
        searchVolume: 165000,
        difficulty: 'High'
      },
      {
        keyword: 'marketing',
        count: 8,
        density: 0.64,
        status: 'good',
        recommendation: 'Optimal density for marketing keyword',
        impact: 'Medium',
        semanticVariations: ['digital marketing', 'online marketing', 'promotion'],
        idealDensity: '0.5-1.0%',
        position: 'secondary',
        trendChange: -0.05,
        lastMonthDensity: 0.69,
        searchVolume: 89000,
        difficulty: 'Medium'
      },
      {
        keyword: 'digital',
        count: 15,
        density: 1.2,
        status: 'warning',
        recommendation: 'Slightly high density, consider reducing usage',
        impact: 'Medium',
        semanticVariations: ['online', 'web-based', 'internet'],
        idealDensity: '0.5-1.0%',
        position: 'secondary',
        trendChange: 0.25,
        lastMonthDensity: 0.95,
        searchVolume: 45000,
        difficulty: 'Low'
      },
      {
        keyword: 'strategy',
        count: 6,
        density: 0.48,
        status: 'good',
        recommendation: 'Good keyword density for strategy',
        impact: 'Medium',
        semanticVariations: ['plan', 'approach', 'methodology'],
        idealDensity: '0.3-0.8%',
        position: 'supporting',
        trendChange: 0,
        lastMonthDensity: 0.48,
        searchVolume: 32000,
        difficulty: 'Medium'
      },
      {
        keyword: 'content',
        count: 20,
        density: 1.6,
        status: 'error',
        recommendation: 'Keyword density too high, risk of keyword stuffing',
        impact: 'High',
        semanticVariations: ['articles', 'blog posts', 'information'],
        idealDensity: '0.5-1.0%',
        position: 'primary',
        trendChange: 0.35,
        lastMonthDensity: 1.25,
        searchVolume: 78000,
        difficulty: 'Medium'
      }
    ],
    keywordDistribution: {
      title: ['SEO', 'marketing'],
      headings: ['digital', 'strategy', 'content'],
      body: ['SEO', 'marketing', 'digital', 'strategy', 'content'],
      meta: ['SEO', 'marketing']
    },
    competitorAnalysis: [
      {
        competitor: 'competitor1.com',
        overallScore: 85,
        keywordDensities: {
          'SEO': 0.85,
          'marketing': 0.72,
          'digital': 0.65,
          'strategy': 0.52,
          'content': 0.95
        },
        strengths: ['Balanced keyword distribution', 'Strong semantic variations'],
        weaknesses: ['Lower content volume', 'Missing LSI keywords']
      },
      {
        competitor: 'competitor2.com',
        overallScore: 79,
        keywordDensities: {
          'SEO': 0.92,
          'marketing': 0.58,
          'digital': 0.78,
          'strategy': 0.45,
          'content': 1.05
        },
        strengths: ['High primary keyword focus', 'Good technical implementation'],
        weaknesses: ['Keyword stuffing in some areas', 'Limited semantic coverage']
      }
    ],
    lsiKeywords: [
      {
        keyword: 'search engine optimization',
        relevance: 95,
        currentUsage: 3,
        recommendedUsage: '5-8',
        difficulty: 'Medium'
      },
      {
        keyword: 'organic traffic',
        relevance: 88,
        currentUsage: 1,
        recommendedUsage: '3-5',
        difficulty: 'Low'
      },
      {
        keyword: 'SERP ranking',
        relevance: 82,
        currentUsage: 0,
        recommendedUsage: '2-4',
        difficulty: 'Medium'
      },
      {
        keyword: 'keyword research',
        relevance: 79,
        currentUsage: 2,
        recommendedUsage: '3-6',
        difficulty: 'High'
      },
      {
        keyword: 'content optimization',
        relevance: 76,
        currentUsage: 1,
        recommendedUsage: '2-4',
        difficulty: 'Low'
      }
    ],
    historicalData: [
      { month: 'Jan', score: 72, primaryKeywordDensity: 0.84, issues: 3 },
      { month: 'Feb', score: 75, primaryKeywordDensity: 0.89, issues: 2 },
      { month: 'Mar', score: 78, primaryKeywordDensity: 0.96, issues: 1 },
      { month: 'Apr', score: 78, primaryKeywordDensity: 0.96, issues: 1 }
    ],
    contentOptimization: [
      {
        section: 'Title Tag',
        currentKeywords: ['SEO', 'marketing'],
        suggestions: ['Add "strategy" for better topical coverage', 'Consider "optimization" as a semantic variation'],
        priority: 'High',
        estimatedImpact: '+12% CTR'
      },
      {
        section: 'H1 Headings',
        currentKeywords: ['digital', 'content'],
        suggestions: ['Include primary keyword "SEO" in at least one H1', 'Balance keyword distribution across headings'],
        priority: 'High',
        estimatedImpact: '+8% relevance score'
      },
      {
        section: 'Meta Description',
        currentKeywords: ['SEO', 'marketing'],
        suggestions: ['Add "strategy" and "optimization" keywords', 'Ensure natural readability while including keywords'],
        priority: 'Medium',
        estimatedImpact: '+5% CTR'
      },
      {
        section: 'Body Content',
        currentKeywords: ['SEO', 'marketing', 'digital', 'strategy', 'content'],
        suggestions: ['Reduce "content" keyword density by 25%', 'Increase semantic variations usage', 'Add more LSI keywords naturally'],
        priority: 'High',
        estimatedImpact: '+15% topical relevance'
      }
    ],
    recommendations: [
      {
        text: 'Reduce the density of "content" keyword to avoid keyword stuffing',
        priority: 'High',
        action: 'Replace some instances with semantic variations like "articles" or "information"',
        category: 'Density Optimization',
        estimatedTime: '15 minutes',
        difficulty: 'Easy'
      },
      {
        text: 'Consider using "digital" keyword more naturally in the content',
        priority: 'Medium',
        action: 'Distribute more evenly throughout the text or replace with variations',
        category: 'Distribution',
        estimatedTime: '20 minutes',
        difficulty: 'Medium'
      },
      {
        text: 'Add more semantic variations of your primary keywords',
        priority: 'Medium',
        action: 'Use LSI keywords to improve topical relevance without overusing primary terms',
        category: 'Semantic Enhancement',
        estimatedTime: '30 minutes',
        difficulty: 'Medium'
      },
      {
        text: 'Ensure keywords appear naturally in headings and subheadings',
        priority: 'High',
        action: 'Restructure headings to include target keywords where relevant',
        category: 'Structure Optimization',
        estimatedTime: '25 minutes',
        difficulty: 'Easy'
      },
      {
        text: 'Optimize meta description with primary keywords',
        priority: 'High',
        action: 'Include SEO and marketing keywords in meta description while keeping it readable',
        category: 'Meta Optimization',
        estimatedTime: '10 minutes',
        difficulty: 'Easy'
      }
    ],
    score: 78,
    industryAverage: 82,
    lastAnalyzed: '2024-04-15T10:30:00Z'
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

  const getDensityColor = (density: number) => {
    if (density <= 0.5) return 'text-green-600'
    if (density <= 1.0) return 'text-yellow-600'
    if (density <= 2.0) return 'text-orange-600'
    return 'text-red-600'
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-green-500" />
    if (change < 0) return <ArrowDown className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-gray-500" />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-red-500 text-red-700 dark:border-red-400 dark:text-red-300'
      case 'Medium':
        return 'border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300'
      case 'Low':
        return 'border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-300'
      default:
        return 'border-gray-500 text-gray-700 dark:border-gray-400 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Score with Historical Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Keyword Density Analysis Score</CardTitle>
            <CardDescription>
              Overall assessment of your keyword density optimization with historical trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <div className="text-4xl font-bold text-primary">{results.score}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge className={getStatusColor(results.score >= 80 ? 'good' : results.score >= 60 ? 'warning' : 'error')}>
                    {results.score >= 80 ? 'Excellent' : results.score >= 60 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Last analyzed: {new Date(results.lastAnalyzed).toLocaleDateString()}
                  </div>
                </div>
                <Progress value={results.score} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Your Score: {results.score}</span>
                  <span>Industry Average: {results.industryAverage}</span>
                </div>
              </div>
            </div>
            
            {/* Historical Trend Chart */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Score Trend (Last 4 Months)</h4>
              <div className="flex items-end space-x-2 h-20">
                {results.historicalData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary/20 rounded-t flex items-end justify-center text-xs font-medium text-primary"
                      style={{ height: `${(data.score / 100) * 60}px` }}
                    >
                      {data.score}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Words</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.totalWords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Words analyzed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keywords Found</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.totalKeywords}</div>
              <p className="text-xs text-muted-foreground">Unique keywords</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Density</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(results.keywordDensity.reduce((acc, kw) => acc + kw.density, 0) / results.keywordDensity.length).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Average keyword density</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Tabs Interface */}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="lsi">LSI Keywords</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Keyword Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Keyword Analysis</CardTitle>
              <CardDescription>
                Comprehensive breakdown of keyword density with trends and recommendations
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
                        <Badge variant="outline" className={
                          keyword.position === 'primary' ? 'border-blue-500 text-blue-700' : 
                          keyword.position === 'secondary' ? 'border-green-500 text-green-700' : 
                          'border-gray-500 text-gray-700'
                        }>
                          {keyword.position}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">{keyword.count} occurrences</div>
                          {getTrendIcon(keyword.trendChange)}
                          <span className={`text-xs ${keyword.trendChange > 0 ? 'text-green-600' : keyword.trendChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {keyword.trendChange > 0 ? '+' : ''}{(keyword.trendChange * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className={`text-sm font-bold ${getDensityColor(keyword.density)}`}>
                          {keyword.density}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Current Density</span>
                        <span>{keyword.density}% <span className="text-xs text-muted-foreground">(Ideal: {keyword.idealDensity})</span></span>
                      </div>
                      <Progress 
                        value={Math.min(keyword.density * 50, 100)} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Last month: {keyword.lastMonthDensity}%</span>
                        <span>Search volume: {keyword.searchVolume?.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Impact & Difficulty</h4>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className={
                            keyword.impact === 'High' ? 'border-red-500 text-red-700' : 
                            keyword.impact === 'Medium' ? 'border-yellow-500 text-yellow-700' : 
                            'border-blue-500 text-blue-700'
                          }>
                            {keyword.impact} Impact
                          </Badge>
                          <Badge variant="outline" className={
                            keyword.difficulty === 'High' ? 'border-red-500 text-red-700' : 
                            keyword.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-700' : 
                            'border-green-500 text-green-700'
                          }>
                            {keyword.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium mb-1">Semantic Variations</h4>
                        <div className="flex flex-wrap gap-1">
                          {keyword.semanticVariations.map((variation, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{variation}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {keyword.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Distribution Analysis</CardTitle>
              <CardDescription>
                Where your keywords appear across different page elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Title Tag
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywordDistribution.title.map((keyword, index) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Headings (H1-H6)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywordDistribution.headings.map((keyword, index) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Body Content
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywordDistribution.body.map((keyword, index) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Meta Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywordDistribution.meta.map((keyword, index) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Keyword Analysis</CardTitle>
              <CardDescription>
                Compare your keyword density with top competitors and learn from their strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {results.competitorAnalysis.map((competitor, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{competitor.competitor}</h3>
                        <Badge variant="outline" className={
                          competitor.overallScore >= 80 ? 'border-green-500 text-green-700' : 
                          competitor.overallScore >= 60 ? 'border-yellow-500 text-yellow-700' : 
                          'border-red-500 text-red-700'
                        }>
                          Score: {competitor.overallScore}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        View Full Analysis
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Keyword Density Comparison</h4>
                        <div className="space-y-3">
                          {Object.entries(competitor.keywordDensities).map(([keyword, density], i) => {
                            const yourDensity = results.keywordDensity.find(k => k.keyword === keyword)?.density || 0;
                            const difference = (yourDensity - density).toFixed(2);
                            const isHigher = parseFloat(difference) > 0;
                            
                            return (
                              <div key={i} className="grid grid-cols-4 gap-2 items-center">
                                <div className="font-medium">{keyword}</div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">{density.toFixed(2)}%</span>
                                  <Progress value={density * 50} className="h-1.5 flex-1" />
                                </div>
                                <div className="text-sm text-center">
                                  vs {yourDensity.toFixed(2)}%
                                </div>
                                <div className="text-sm text-right">
                                  <span className={isHigher ? 'text-green-600' : 'text-red-600'}>
                                    {isHigher ? '+' : ''}{difference}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 text-green-700">Strengths</h4>
                          <ul className="text-sm space-y-1">
                            {competitor.strengths.map((strength, i) => (
                              <li key={i} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 text-red-700">Weaknesses</h4>
                          <ul className="text-sm space-y-1">
                            {competitor.weaknesses.map((weakness, i) => (
                              <li key={i} className="flex items-center">
                                <XCircle className="h-3 w-3 text-red-500 mr-2" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LSI Keywords Tab */}
        <TabsContent value="lsi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LSI Keywords & Semantic Enhancement</CardTitle>
              <CardDescription>
                Latent Semantic Indexing keywords to improve topical relevance and avoid keyword stuffing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.lsiKeywords.map((lsi, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <h3 className="font-semibold">{lsi.keyword}</h3>
                        <Badge variant="outline" className={
                          lsi.relevance >= 90 ? 'border-green-500 text-green-700' : 
                          lsi.relevance >= 80 ? 'border-yellow-500 text-yellow-700' : 
                          'border-blue-500 text-blue-700'
                        }>
                          {lsi.relevance}% relevance
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(lsi.difficulty)}>
                          {lsi.difficulty}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        Add to Content
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Current Usage</h4>
                        <div className="text-2xl font-bold text-primary">{lsi.currentUsage}</div>
                        <p className="text-xs text-muted-foreground">times used</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Recommended</h4>
                        <div className="text-2xl font-bold text-green-600">{lsi.recommendedUsage}</div>
                        <p className="text-xs text-muted-foreground">optimal range</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Opportunity</h4>
                        <div className="text-2xl font-bold text-blue-600">
                          +{parseInt(lsi.recommendedUsage.split('-')[0]) - lsi.currentUsage}
                        </div>
                        <p className="text-xs text-muted-foreground">more uses needed</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          {/* Content Optimization Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Content Optimization Suggestions</CardTitle>
              <CardDescription>
                Section-specific recommendations to improve keyword optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.contentOptimization.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Target className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{section.section}</h3>
                        <Badge variant="outline" className={getPriorityColor(section.priority)}>
                          {section.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {section.estimatedImpact}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">Current Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {section.currentKeywords.map((keyword, i) => (
                          <Badge key={i} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                      <ul className="text-sm space-y-1">
                        {section.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actionable Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Actionable Recommendations</CardTitle>
              <CardDescription>
                Prioritized steps to improve your keyword optimization with time estimates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-0 last:pb-0">
                    <div className={
                      rec.priority === 'High' ? 'text-red-500' : 
                      rec.priority === 'Medium' ? 'text-yellow-500' : 
                      'text-blue-500'
                    }>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rec.text}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {rec.estimatedTime}
                          </Badge>
                          <Badge variant="outline" className={
                            rec.difficulty === 'Easy' ? 'border-green-500 text-green-700' : 
                            rec.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-700' : 
                            'border-red-500 text-red-700'
                          }>
                            {rec.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.action}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Start Task
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
