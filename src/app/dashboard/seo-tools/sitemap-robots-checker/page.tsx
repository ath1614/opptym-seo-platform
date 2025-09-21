"use client"

import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Map, FileText, CheckCircle, AlertTriangle, XCircle, Info, Search } from 'lucide-react'

export default function SitemapRobotsCheckerPage() {
  return (
    <SEOToolLayout
      toolId="sitemap-robots-checker"
      toolName="Sitemap & Robots Checker"
      toolDescription="Validate your sitemap and robots.txt files for proper search engine crawling and indexing."
    >
      {/* Results will be displayed here */}
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Map className="h-5 w-5 text-primary" />
              <span>Sitemap & Robots Analysis</span>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your sitemap and robots.txt configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-green-600">Sitemap Found</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-green-600">Robots.txt OK</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">247</div>
                <div className="text-sm text-blue-600">Pages Indexed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">95%</div>
                <div className="text-sm text-purple-600">Crawlability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sitemap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Map className="h-5 w-5" />
              <span>Sitemap Analysis</span>
            </CardTitle>
            <CardDescription>
              Detailed analysis of your XML sitemap structure and content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Sitemap Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-mono">/sitemap.xml</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Modified:</span>
                      <span>2024-01-15 14:30:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total URLs:</span>
                      <span className="font-medium">247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span>45.2 KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">Valid</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">URL Types</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pages:</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blog Posts:</span>
                      <span className="font-medium">78</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products:</span>
                      <span className="font-medium">13</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories:</span>
                      <span className="font-medium">8</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Sitemap Issues Found</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">3 URLs have missing lastmod dates</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Consider adding image sitemaps for better image SEO</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Robots.txt Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Robots.txt Analysis</span>
            </CardTitle>
            <CardDescription>
              Analysis of your robots.txt file and crawling directives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Current robots.txt Content:</h4>
                <pre className="text-sm font-mono whitespace-pre-wrap">
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /temp/
Disallow: /*.pdf$

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-images.xml`}
                </pre>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Crawl Directives</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Main site is crawlable</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Admin areas blocked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>PDF files blocked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Sitemap declared</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Blocked Directories</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>/admin/ - Admin panel</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>/private/ - Private content</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>/temp/ - Temporary files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>*.pdf - PDF files</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crawlability Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Crawlability Issues</span>
            </CardTitle>
            <CardDescription>
              Issues that may prevent search engines from properly crawling your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  issue: "Missing canonical URLs",
                  severity: "Medium",
                  affected: "12 pages",
                  description: "Some pages don't have canonical URLs specified, which may cause duplicate content issues."
                },
                {
                  issue: "Slow loading pages",
                  severity: "Low",
                  affected: "5 pages",
                  description: "A few pages take longer than 3 seconds to load, which may affect crawling efficiency."
                },
                {
                  issue: "Missing meta descriptions",
                  severity: "Low",
                  affected: "8 pages",
                  description: "Some pages are missing meta descriptions, which won't prevent crawling but affects SEO."
                },
                {
                  issue: "Deep linking structure",
                  severity: "Low",
                  affected: "3 pages",
                  description: "Some pages are more than 3 clicks deep from the homepage, making them harder to discover."
                }
              ].map((issue, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{issue.issue}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={issue.severity === 'High' ? 'destructive' : issue.severity === 'Medium' ? 'secondary' : 'outline'}>
                        {issue.severity}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Affected: {issue.affected}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Engine Indexing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Engine Indexing Status</span>
            </CardTitle>
            <CardDescription>
              How search engines are currently indexing your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Google</h4>
                <div className="text-2xl font-bold text-blue-600 mb-1">247</div>
                <div className="text-sm text-blue-600">Pages Indexed</div>
                <div className="text-xs text-muted-foreground mt-1">Last crawl: 2 hours ago</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">Bing</h4>
                <div className="text-2xl font-bold text-green-600 mb-1">231</div>
                <div className="text-sm text-green-600">Pages Indexed</div>
                <div className="text-xs text-muted-foreground mt-1">Last crawl: 4 hours ago</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2">Yahoo</h4>
                <div className="text-2xl font-bold text-purple-600 mb-1">198</div>
                <div className="text-sm text-purple-600">Pages Indexed</div>
                <div className="text-xs text-muted-foreground mt-1">Last crawl: 1 day ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Optimization Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Map className="h-4 w-4" />
                <AlertDescription>
                  <strong>Update Sitemap Regularly:</strong> Your sitemap is well-structured. Consider updating it more frequently to help search engines discover new content faster.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Optimize Robots.txt:</strong> Your robots.txt is properly configured. Consider adding crawl-delay directives if you experience server load issues.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Search className="h-4 w-4" />
                <AlertDescription>
                  <strong>Submit to Search Engines:</strong> Submit your sitemap to Google Search Console and Bing Webmaster Tools for faster indexing.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Monitor Indexing:</strong> Set up regular monitoring to track which pages are being indexed and identify any crawling issues early.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}
