"use client"

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, Target, BarChart3, ArrowUp, ArrowDown, Minus, Calendar, Search } from 'lucide-react'

export default function KeywordTrackerPage() {
  return (
    <SEOToolLayout
      toolId="keyword-tracker"
      toolName="Keyword Tracker"
      toolDescription="Track keyword rankings over time to monitor your SEO progress and identify opportunities."
    >
      {/* Results will be displayed here */}
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Keyword Ranking Overview</span>
            </CardTitle>
            <CardDescription>
              Track your keyword performance and ranking changes over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">47</div>
                <div className="text-sm text-blue-600">Tracked Keywords</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">23</div>
                <div className="text-sm text-green-600">Top 10 Rankings</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">+12</div>
                <div className="text-sm text-purple-600">Improved This Month</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">18.5</div>
                <div className="text-sm text-orange-600">Avg. Position</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Top Performing Keywords</span>
            </CardTitle>
            <CardDescription>
              Your best-ranking keywords with recent performance data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  keyword: "seo optimization tools",
                  currentPosition: 3,
                  previousPosition: 5,
                  change: "+2",
                  searchVolume: 8900,
                  difficulty: "Medium",
                  trend: "up"
                },
                {
                  keyword: "keyword research software",
                  currentPosition: 7,
                  previousPosition: 9,
                  change: "+2",
                  searchVolume: 5600,
                  difficulty: "Low",
                  trend: "up"
                },
                {
                  keyword: "seo analysis platform",
                  currentPosition: 4,
                  previousPosition: 4,
                  change: "0",
                  searchVolume: 3200,
                  difficulty: "Medium",
                  trend: "stable"
                },
                {
                  keyword: "website seo checker",
                  currentPosition: 12,
                  previousPosition: 15,
                  change: "+3",
                  searchVolume: 7800,
                  difficulty: "High",
                  trend: "up"
                },
                {
                  keyword: "seo audit tools",
                  currentPosition: 8,
                  previousPosition: 6,
                  change: "-2",
                  searchVolume: 4500,
                  difficulty: "Medium",
                  trend: "down"
                }
              ].map((keyword, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{keyword.keyword}</h3>
                        <Badge variant={keyword.difficulty === 'Low' ? 'default' : keyword.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                          {keyword.difficulty}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Search Volume: {keyword.searchVolume.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">#{keyword.currentPosition}</div>
                        <div className="text-xs text-muted-foreground">Current</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">#{keyword.previousPosition}</div>
                        <div className="text-xs text-muted-foreground">Previous</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {keyword.trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
                        {keyword.trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
                        {keyword.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                        <span className={`text-sm font-medium ${
                          keyword.trend === 'up' ? 'text-green-600' : 
                          keyword.trend === 'down' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {keyword.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Ranking Trends (Last 6 Months)</span>
            </CardTitle>
            <CardDescription>
              Track how your keyword rankings have changed over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  keyword: "seo optimization tools",
                  months: [
                    { month: "Aug", position: 8 },
                    { month: "Sep", position: 7 },
                    { month: "Oct", position: 6 },
                    { month: "Nov", position: 5 },
                    { month: "Dec", position: 4 },
                    { month: "Jan", position: 3 }
                  ]
                },
                {
                  keyword: "keyword research software",
                  months: [
                    { month: "Aug", position: 12 },
                    { month: "Sep", position: 11 },
                    { month: "Oct", position: 10 },
                    { month: "Nov", position: 9 },
                    { month: "Dec", position: 8 },
                    { month: "Jan", position: 7 }
                  ]
                },
                {
                  keyword: "website seo checker",
                  months: [
                    { month: "Aug", position: 18 },
                    { month: "Sep", position: 16 },
                    { month: "Oct", position: 15 },
                    { month: "Nov", position: 14 },
                    { month: "Dec", position: 13 },
                    { month: "Jan", position: 12 }
                  ]
                }
              ].map((trend, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">{trend.keyword}</h4>
                  <div className="flex items-center space-x-4">
                    {trend.months.map((month, monthIndex) => (
                      <div key={monthIndex} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{month.month}</div>
                        <div className="text-lg font-bold">#{month.position}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competitor Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Competitor Keyword Analysis</span>
            </CardTitle>
            <CardDescription>
              See how your keywords rank compared to your main competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  keyword: "seo optimization tools",
                  yourPosition: 3,
                  competitors: [
                    { domain: "competitor1.com", position: 1 },
                    { domain: "competitor2.com", position: 2 },
                    { domain: "competitor3.com", position: 4 }
                  ]
                },
                {
                  keyword: "keyword research software",
                  yourPosition: 7,
                  competitors: [
                    { domain: "competitor1.com", position: 5 },
                    { domain: "competitor2.com", position: 6 },
                    { domain: "competitor3.com", position: 8 }
                  ]
                },
                {
                  keyword: "seo analysis platform",
                  yourPosition: 4,
                  competitors: [
                    { domain: "competitor1.com", position: 1 },
                    { domain: "competitor2.com", position: 2 },
                    { domain: "competitor3.com", position: 3 }
                  ]
                }
              ].map((analysis, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">{analysis.keyword}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                      <span className="font-medium">Your Site</span>
                      <Badge variant="default">#{analysis.yourPosition}</Badge>
                    </div>
                    {analysis.competitors.map((comp, compIndex) => (
                      <div key={compIndex} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{comp.domain}</span>
                        <Badge variant="outline">#{comp.position}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Ranking Opportunities</span>
            </CardTitle>
            <CardDescription>
              Keywords that are close to ranking in top positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  keyword: "seo tools comparison",
                  currentPosition: 11,
                  targetPosition: "Top 10",
                  searchVolume: 3200,
                  difficulty: "Medium",
                  opportunity: "High"
                },
                {
                  keyword: "free seo analysis",
                  currentPosition: 13,
                  targetPosition: "Top 10",
                  searchVolume: 4500,
                  difficulty: "Low",
                  opportunity: "Very High"
                },
                {
                  keyword: "seo audit checklist",
                  currentPosition: 15,
                  targetPosition: "Top 10",
                  searchVolume: 2100,
                  difficulty: "Low",
                  opportunity: "High"
                },
                {
                  keyword: "website seo optimization",
                  currentPosition: 12,
                  targetPosition: "Top 10",
                  searchVolume: 3800,
                  difficulty: "Medium",
                  opportunity: "Medium"
                }
              ].map((opportunity, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{opportunity.keyword}</h4>
                      <div className="text-sm text-muted-foreground">
                        Search Volume: {opportunity.searchVolume.toLocaleString()} • Difficulty: {opportunity.difficulty}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={opportunity.opportunity === 'Very High' ? 'default' : opportunity.opportunity === 'High' ? 'secondary' : 'outline'}>
                        {opportunity.opportunity} Opportunity
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current:</span> #{opportunity.currentPosition}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span> {opportunity.targetPosition}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gap:</span> {opportunity.currentPosition - 10} positions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Optimization Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <strong>Focus on Top 10 Opportunities:</strong> You have 4 keywords within 5 positions of the top 10. Prioritize optimizing content for these keywords.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Monitor Ranking Trends:</strong> Most of your tracked keywords are showing positive trends. Continue your current optimization strategy.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Search className="h-4 w-4" />
                <AlertDescription>
                  <strong>Competitor Analysis:</strong> Focus on keywords where competitors rank higher than you. Analyze their content strategy and improve yours.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  <strong>Regular Monitoring:</strong> Set up weekly tracking for your top keywords and monthly reviews for your full keyword portfolio.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}
