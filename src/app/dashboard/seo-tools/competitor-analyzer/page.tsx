"use client"

import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, TrendingUp, Target, BarChart3, ExternalLink, Search, Eye, Zap } from 'lucide-react'

export default function CompetitorAnalyzerPage() {
  return (
    <SEOToolLayout
      toolId="competitor-analyzer"
      toolName="Competitor Analyzer"
      toolDescription="Analyze competitor websites and strategies to identify opportunities and improve your SEO performance."
    >
      {/* Results will be displayed here */}
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Competitor Analysis Overview</span>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your top competitors and their SEO strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-blue-600">Competitors Analyzed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">23</div>
                <div className="text-sm text-green-600">Opportunities Found</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <div className="text-sm text-purple-600">Shared Keywords</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">4.2</div>
                <div className="text-sm text-orange-600">Avg. Competitor DA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Competitor Overview</span>
            </CardTitle>
            <CardDescription>
              Key metrics and performance indicators for your main competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  domain: "competitor1.com",
                  da: 65,
                  backlinks: 3456,
                  organicTraffic: 125000,
                  keywords: 2340,
                  topKeywords: ["seo tools", "keyword research", "seo analysis"],
                  strengths: ["High domain authority", "Strong backlink profile", "Comprehensive content"],
                  weaknesses: ["Slow loading speed", "Poor mobile experience"]
                },
                {
                  domain: "competitor2.com",
                  da: 58,
                  backlinks: 2890,
                  organicTraffic: 98000,
                  keywords: 1890,
                  topKeywords: ["seo software", "website analysis", "seo audit"],
                  strengths: ["Fast loading speed", "Great user experience", "Strong social presence"],
                  weaknesses: ["Lower domain authority", "Limited content depth"]
                },
                {
                  domain: "competitor3.com",
                  da: 45,
                  backlinks: 1234,
                  organicTraffic: 45000,
                  keywords: 890,
                  topKeywords: ["free seo tools", "seo checker", "website seo"],
                  strengths: ["Free tools attract users", "Good local SEO", "Active community"],
                  weaknesses: ["Limited features", "Weak backlink profile", "Poor content quality"]
                }
              ].map((competitor, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{competitor.domain}</h3>
                        <Badge variant="outline">DA: {competitor.da}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Backlinks:</span> {competitor.backlinks.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Traffic:</span> {competitor.organicTraffic.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Keywords:</span> {competitor.keywords.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Top Keywords:</span> {competitor.topKeywords.slice(0, 2).join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <h4 className="font-medium text-sm text-green-600 mb-1">Strengths:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {competitor.strengths.map((strength, strengthIndex) => (
                          <li key={strengthIndex}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-red-600 mb-1">Weaknesses:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {competitor.weaknesses.map((weakness, weaknessIndex) => (
                          <li key={weaknessIndex}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Keyword Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Keyword Gap Analysis</span>
            </CardTitle>
            <CardDescription>
              Keywords your competitors rank for but you don't - potential opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  keyword: "seo tools comparison",
                  searchVolume: 3200,
                  difficulty: "Medium",
                  competitors: ["competitor1.com", "competitor2.com"],
                  opportunity: "High",
                  yourPosition: "Not ranking"
                },
                {
                  keyword: "best seo software 2024",
                  searchVolume: 4500,
                  difficulty: "High",
                  competitors: ["competitor1.com", "competitor3.com"],
                  opportunity: "Medium",
                  yourPosition: "Not ranking"
                },
                {
                  keyword: "free seo analysis tools",
                  searchVolume: 2800,
                  difficulty: "Low",
                  competitors: ["competitor2.com", "competitor3.com"],
                  opportunity: "Very High",
                  yourPosition: "Not ranking"
                },
                {
                  keyword: "seo audit checklist",
                  searchVolume: 2100,
                  difficulty: "Low",
                  competitors: ["competitor1.com"],
                  opportunity: "High",
                  yourPosition: "Not ranking"
                },
                {
                  keyword: "website seo optimization guide",
                  searchVolume: 3800,
                  difficulty: "Medium",
                  competitors: ["competitor2.com", "competitor3.com"],
                  opportunity: "High",
                  yourPosition: "Not ranking"
                }
              ].map((keyword, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{keyword.keyword}</h4>
                      <div className="text-sm text-muted-foreground">
                        Search Volume: {keyword.searchVolume.toLocaleString()} • Difficulty: {keyword.difficulty}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={keyword.opportunity === 'Very High' ? 'default' : keyword.opportunity === 'High' ? 'secondary' : 'outline'}>
                        {keyword.opportunity} Opportunity
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Competitors ranking: {keyword.competitors.join(", ")} • Your position: {keyword.yourPosition}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Content Gap Analysis</span>
            </CardTitle>
            <CardDescription>
              Content topics and formats your competitors are using that you might be missing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Content Types You're Missing</h4>
                <div className="space-y-2">
                  {[
                    { type: "Video Tutorials", competitors: ["competitor1.com", "competitor2.com"], opportunity: "High" },
                    { type: "Interactive Tools", competitors: ["competitor1.com"], opportunity: "Very High" },
                    { type: "Case Studies", competitors: ["competitor2.com", "competitor3.com"], opportunity: "Medium" },
                    { type: "Webinars", competitors: ["competitor1.com"], opportunity: "High" },
                    { type: "Infographics", competitors: ["competitor3.com"], opportunity: "Medium" }
                  ].map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div>
                        <span className="font-medium text-sm">{content.type}</span>
                        <div className="text-xs text-muted-foreground">
                          Used by: {content.competitors.join(", ")}
                        </div>
                      </div>
                      <Badge variant={content.opportunity === 'Very High' ? 'default' : content.opportunity === 'High' ? 'secondary' : 'outline'}>
                        {content.opportunity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Topic Opportunities</h4>
                <div className="space-y-2">
                  {[
                    { topic: "Local SEO", competitors: ["competitor2.com"], opportunity: "High" },
                    { topic: "E-commerce SEO", competitors: ["competitor1.com", "competitor3.com"], opportunity: "Medium" },
                    { topic: "Technical SEO", competitors: ["competitor1.com"], opportunity: "Very High" },
                    { topic: "Content Marketing", competitors: ["competitor2.com"], opportunity: "High" },
                    { topic: "Link Building", competitors: ["competitor1.com", "competitor2.com"], opportunity: "Medium" }
                  ].map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div>
                        <span className="font-medium text-sm">{topic.topic}</span>
                        <div className="text-xs text-muted-foreground">
                          Covered by: {topic.competitors.join(", ")}
                        </div>
                      </div>
                      <Badge variant={topic.opportunity === 'Very High' ? 'default' : topic.opportunity === 'High' ? 'secondary' : 'outline'}>
                        {topic.opportunity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backlink Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5" />
              <span>Backlink Profile Comparison</span>
            </CardTitle>
            <CardDescription>
              How your backlink profile compares to your competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  metric: "Total Backlinks",
                  yourValue: 1247,
                  competitor1: 3456,
                  competitor2: 2890,
                  competitor3: 1234,
                  yourRank: 2
                },
                {
                  metric: "Referring Domains",
                  yourValue: 156,
                  competitor1: 456,
                  competitor2: 389,
                  competitor3: 198,
                  yourRank: 3
                },
                {
                  metric: "Domain Authority",
                  yourValue: 42,
                  competitor1: 65,
                  competitor2: 58,
                  competitor3: 45,
                  yourRank: 4
                },
                {
                  metric: "High-Quality Links",
                  yourValue: 45,
                  competitor1: 234,
                  competitor2: 189,
                  competitor3: 67,
                  yourRank: 3
                }
              ].map((metric, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">{metric.metric}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-2 bg-primary/10 rounded">
                      <div className="font-bold">You</div>
                      <div className="text-lg">{metric.yourValue.toLocaleString()}</div>
                      <Badge variant="outline">Rank #{metric.yourRank}</Badge>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold">Competitor 1</div>
                      <div className="text-lg">{metric.competitor1.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold">Competitor 2</div>
                      <div className="text-lg">{metric.competitor2.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold">Competitor 3</div>
                      <div className="text-lg">{metric.competitor3.toLocaleString()}</div>
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
              <span>Competitive Strategy Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Search className="h-4 w-4" />
                <AlertDescription>
                  <strong>Target Keyword Gaps:</strong> Focus on 23 high-opportunity keywords that competitors rank for but you don't. Start with "free seo analysis tools" and "seo audit checklist".
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Content Strategy:</strong> Create interactive tools and video tutorials to match competitor content types. Focus on technical SEO content where you have the highest opportunity.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  <strong>Link Building:</strong> Your backlink profile is weaker than competitors. Focus on earning high-quality links from the same domains your competitors are getting links from.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Competitive Advantage:</strong> Leverage competitor weaknesses like slow loading speeds and poor mobile experience to differentiate your platform.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}
