"use client"

import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, CheckCircle, AlertTriangle, XCircle, Link, Globe, Search, Zap } from 'lucide-react'

export default function CanonicalCheckerPage() {
  return (
    <SEOToolLayout
      toolId="canonical-checker"
      toolName="Canonical Checker"
      toolDescription="Check canonical URLs and duplicate content issues to prevent SEO penalties and improve search rankings."
    >
      {/* Results will be displayed here */}
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Canonical URL Analysis</span>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of canonical URL implementation and duplicate content issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">247</div>
                <div className="text-sm text-green-600">Pages with Canonicals</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">8</div>
                <div className="text-sm text-red-600">Duplicate Content Issues</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">12</div>
                <div className="text-sm text-yellow-600">Canonical Warnings</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">97%</div>
                <div className="text-sm text-blue-600">Canonical Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duplicate Content Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Duplicate Content Issues</span>
            </CardTitle>
            <CardDescription>
              Pages with duplicate content that need canonical URL implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  page: "/products/seo-tools",
                  duplicate: "/products/seo-tools/",
                  issue: "Trailing slash inconsistency",
                  similarity: "100%",
                  description: "Same content accessible with and without trailing slash",
                  fix: "Add canonical URL pointing to the preferred version"
                },
                {
                  page: "/blog/seo-guide",
                  duplicate: "/blog/seo-guide?utm_source=google",
                  issue: "URL parameters creating duplicates",
                  similarity: "100%",
                  description: "Same content accessible with different URL parameters",
                  fix: "Add canonical URL to the clean version without parameters"
                },
                {
                  page: "/services/",
                  duplicate: "/services",
                  issue: "Trailing slash inconsistency",
                  similarity: "100%",
                  description: "Same content accessible with and without trailing slash",
                  fix: "Add canonical URL pointing to the preferred version"
                },
                {
                  page: "/about-us",
                  duplicate: "/about",
                  issue: "Multiple URLs for same content",
                  similarity: "95%",
                  description: "Very similar content accessible through different URLs",
                  fix: "Add canonical URL to the preferred version and redirect the other"
                }
              ].map((duplicate, index) => (
                <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800">{duplicate.page}</h4>
                      <p className="text-sm text-red-700 mt-1">
                        <strong>Duplicate:</strong> {duplicate.duplicate}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        <strong>Issue:</strong> {duplicate.issue}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        <strong>Similarity:</strong> {duplicate.similarity}
                      </p>
                      <p className="text-sm text-red-700 mt-1">{duplicate.description}</p>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Fix:</strong> {duplicate.fix}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">Duplicate</Badge>
                      <Badge variant="outline">{duplicate.similarity}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Canonical URL Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Canonical URL Issues</span>
            </CardTitle>
            <CardDescription>
              Pages with canonical URL implementation problems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  page: "/blog/post-1",
                  issue: "Canonical points to different domain",
                  canonical: "https://old-domain.com/blog/post-1",
                  description: "Canonical URL points to a different domain, which is incorrect",
                  fix: "Update canonical URL to point to the current domain"
                },
                {
                  page: "/products/tool-1",
                  issue: "Canonical URL is relative",
                  canonical: "/products/tool-1",
                  description: "Canonical URL should be absolute (include full domain)",
                  fix: "Change to absolute URL: https://yoursite.com/products/tool-1"
                },
                {
                  page: "/services/service-1",
                  issue: "Canonical points to non-existent page",
                  canonical: "https://yoursite.com/services/service-1-old",
                  description: "Canonical URL points to a page that no longer exists",
                  fix: "Update canonical URL to point to the correct current page"
                },
                {
                  page: "/contact",
                  issue: "Multiple canonical URLs",
                  canonical: "Multiple canonical tags found",
                  description: "Page has multiple canonical URL tags, which is invalid",
                  fix: "Remove duplicate canonical tags, keep only one"
                }
              ].map((issue, index) => (
                <div key={index} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800">{issue.page}</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        <strong>Issue:</strong> {issue.issue}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        <strong>Current Canonical:</strong> {issue.canonical}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">{issue.description}</p>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Fix:</strong> {issue.fix}
                      </p>
                    </div>
                    <Badge variant="secondary">Warning</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Canonical URL Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Canonical URL Best Practices</span>
            </CardTitle>
            <CardDescription>
              Guidelines for proper canonical URL implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Do's</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Use absolute URLs in canonical tags</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Point canonical to the preferred version of content</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Use canonical tags for paginated content</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Implement canonical tags consistently across the site</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Use canonical tags for mobile/desktop versions</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Don'ts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Don't use multiple canonical tags on one page</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Don't point canonical to a different domain</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Don't use canonical tags for different content</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Don't use relative URLs in canonical tags</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Don't point canonical to non-existent pages</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URL Structure Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>URL Structure Analysis</span>
            </CardTitle>
            <CardDescription>
              Analysis of your website's URL structure and potential duplicate content sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">URL Patterns</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Trailing Slash Issues:</span>
                    <span className="font-medium text-red-600">4 pages</span>
                  </div>
                  <div className="flex justify-between">
                    <span>URL Parameter Issues:</span>
                    <span className="font-medium text-red-600">2 pages</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Multiple URL Versions:</span>
                    <span className="font-medium text-red-600">2 pages</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clean URL Structure:</span>
                    <span className="font-medium text-green-600">241 pages</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Canonical Implementation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pages with Canonicals:</span>
                    <span className="font-medium text-green-600">247/255 (97%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absolute URLs:</span>
                    <span className="font-medium text-green-600">235/247 (95%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Self-Referencing Canonicals:</span>
                    <span className="font-medium text-green-600">198/247 (80%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cross-Domain Canonicals:</span>
                    <span className="font-medium text-red-600">1/247 (0.4%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duplicate Content Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Duplicate Content Sources</span>
            </CardTitle>
            <CardDescription>
              Common sources of duplicate content and how to address them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  source: "URL Parameters",
                  count: 2,
                  description: "Same content accessible with different URL parameters (utm_source, utm_medium, etc.)",
                  solution: "Use canonical tags to point to the clean URL version"
                },
                {
                  source: "Trailing Slash",
                  count: 4,
                  description: "Same content accessible with and without trailing slash",
                  solution: "Choose one version and use canonical tags or redirects"
                },
                {
                  source: "HTTP/HTTPS",
                  count: 0,
                  description: "Same content accessible via HTTP and HTTPS",
                  solution: "Redirect HTTP to HTTPS and use canonical tags"
                },
                {
                  source: "WWW/Non-WWW",
                  count: 0,
                  description: "Same content accessible with and without www",
                  solution: "Choose one version and redirect the other"
                },
                {
                  source: "Multiple URLs",
                  count: 2,
                  description: "Same content accessible through different URL structures",
                  solution: "Use canonical tags and consider redirects for better UX"
                }
              ].map((source, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{source.source}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Solution:</strong> {source.solution}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={source.count === 0 ? 'default' : source.count < 3 ? 'secondary' : 'destructive'}>
                        {source.count} issues
                      </Badge>
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
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Canonical URL Optimization Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Fix Duplicate Content:</strong> Address the 8 duplicate content issues by implementing proper canonical URLs. This will prevent SEO penalties and consolidate link equity.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Fix Canonical Issues:</strong> Resolve the 12 canonical URL warnings, including cross-domain canonicals and relative URLs. Use absolute URLs consistently.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Link className="h-4 w-4" />
                <AlertDescription>
                  <strong>URL Structure:</strong> Implement consistent URL structure rules to prevent trailing slash and parameter issues. Consider using redirects for better user experience.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <strong>Monitor and Maintain:</strong> Your canonical coverage is good at 97%. Regularly monitor for new duplicate content issues and maintain proper canonical implementation.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}
