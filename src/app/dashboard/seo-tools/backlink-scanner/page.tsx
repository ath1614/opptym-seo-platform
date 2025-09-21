"use client"

import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExternalLink, TrendingUp, Shield, AlertTriangle, CheckCircle, Globe, Users } from 'lucide-react'

export default function BacklinkScannerPage() {
  return (
    <SEOToolLayout
      toolId="backlink-scanner"
      toolName="Backlink Scanner"
      toolDescription="Analyze backlinks pointing to your website to understand your link profile and identify opportunities."
    >
      {/* Results will be displayed here */}
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              <span>Backlink Analysis</span>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your website's backlink profile and authority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <div className="text-sm text-blue-600">Total Backlinks</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">156</div>
                <div className="text-sm text-green-600">Referring Domains</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">42</div>
                <div className="text-sm text-purple-600">Domain Authority</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">8.5</div>
                <div className="text-sm text-orange-600">Trust Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Backlinks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Top Quality Backlinks</span>
            </CardTitle>
            <CardDescription>
              Your highest quality backlinks with strong domain authority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  domain: "techcrunch.com",
                  url: "https://techcrunch.com/2024/01/15/your-company-featured",
                  title: "Your Company Featured in TechCrunch",
                  da: 95,
                  traffic: "High",
                  type: "Editorial",
                  anchor: "SEO platform",
                  date: "2024-01-15"
                },
                {
                  domain: "forbes.com",
                  url: "https://forbes.com/sites/author/your-company-review",
                  title: "Forbes Review of Your Platform",
                  da: 92,
                  traffic: "High",
                  type: "Editorial",
                  anchor: "best SEO tools",
                  date: "2024-01-10"
                },
                {
                  domain: "searchengineland.com",
                  url: "https://searchengineland.com/seo-tools-comparison",
                  title: "SEO Tools Comparison Article",
                  da: 88,
                  traffic: "Medium",
                  type: "Editorial",
                  anchor: "comprehensive SEO platform",
                  date: "2024-01-08"
                },
                {
                  domain: "moz.com",
                  url: "https://moz.com/blog/seo-tools-roundup",
                  title: "Moz SEO Tools Roundup",
                  da: 91,
                  traffic: "High",
                  type: "Editorial",
                  anchor: "advanced SEO analysis",
                  date: "2024-01-05"
                }
              ].map((backlink, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{backlink.domain}</span>
                        <Badge variant="outline">DA: {backlink.da}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {backlink.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Anchor: "{backlink.anchor}" • Date: {backlink.date}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={backlink.traffic === 'High' ? 'default' : 'secondary'}>
                        {backlink.traffic} Traffic
                      </Badge>
                      <Badge variant="outline">{backlink.type}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Link Profile Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Link Profile Analysis</CardTitle>
            <CardDescription>
              Detailed breakdown of your backlink profile characteristics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Link Types</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Editorial Links:</span>
                    <span className="font-medium">892 (71.5%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Directory Listings:</span>
                    <span className="font-medium">156 (12.5%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Social Media:</span>
                    <span className="font-medium">89 (7.1%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Forum Links:</span>
                    <span className="font-medium">67 (5.4%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span className="font-medium">43 (3.5%)</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Link Quality</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>High Quality (DA 70+):</span>
                    <span className="font-medium text-green-600">45 (3.6%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium Quality (DA 30-69):</span>
                    <span className="font-medium text-blue-600">234 (18.8%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Quality (DA &lt;30):</span>
                    <span className="font-medium text-orange-600">968 (77.6%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Competitor Comparison</span>
            </CardTitle>
            <CardDescription>
              How your backlink profile compares to your main competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  competitor: "competitor1.com",
                  backlinks: 3456,
                  domains: 456,
                  da: 65,
                  yourBacklinks: 1247,
                  yourDomains: 156,
                  yourDa: 42
                },
                {
                  competitor: "competitor2.com",
                  backlinks: 2890,
                  domains: 389,
                  da: 58,
                  yourBacklinks: 1247,
                  yourDomains: 156,
                  yourDa: 42
                },
                {
                  competitor: "competitor3.com",
                  backlinks: 1234,
                  domains: 198,
                  da: 45,
                  yourBacklinks: 1247,
                  yourDomains: 156,
                  yourDa: 42
                }
              ].map((comp, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">{comp.competitor}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Backlinks</div>
                      <div className="font-medium">{comp.backlinks.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        You: {comp.yourBacklinks.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Referring Domains</div>
                      <div className="font-medium">{comp.domains}</div>
                      <div className="text-xs text-muted-foreground">
                        You: {comp.yourDomains}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Domain Authority</div>
                      <div className="font-medium">{comp.da}</div>
                      <div className="text-xs text-muted-foreground">
                        You: {comp.yourDa}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Toxic Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <Shield className="h-5 w-5" />
              <span>Toxic Link Analysis</span>
            </CardTitle>
            <CardDescription>
              Potentially harmful backlinks that may hurt your SEO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">12</div>
                  <div className="text-sm text-red-600">Toxic Links</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">8</div>
                  <div className="text-sm text-yellow-600">Suspicious Links</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">99.0%</div>
                  <div className="text-sm text-green-600">Clean Profile</div>
                </div>
              </div>
              
              <div className="space-y-2">
                {[
                  {
                    domain: "spam-site.com",
                    reason: "Spam directory",
                    risk: "High",
                    action: "Disavow"
                  },
                  {
                    domain: "link-farm.net",
                    reason: "Link farm",
                    risk: "High",
                    action: "Disavow"
                  },
                  {
                    domain: "suspicious-blog.org",
                    reason: "Low quality content",
                    risk: "Medium",
                    action: "Monitor"
                  }
                ].map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{link.domain}</div>
                      <div className="text-sm text-muted-foreground">{link.reason}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={link.risk === 'High' ? 'destructive' : 'secondary'}>
                        {link.risk} Risk
                      </Badge>
                      <Badge variant="outline">{link.action}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Link Building Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Focus on High-Quality Links:</strong> Only 3.6% of your backlinks are from high-authority domains. Prioritize earning links from reputable, relevant websites.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  <strong>Diversify Link Sources:</strong> 71.5% of your links are editorial. Consider diversifying with directory listings, resource pages, and industry partnerships.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Monitor Toxic Links:</strong> You have 12 toxic links that should be disavowed. Use Google's Disavow Tool to prevent penalties.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <strong>Build Local Authority:</strong> Focus on earning links from local businesses, industry publications, and relevant directories in your niche.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}
