"use client"

import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Link, AlertTriangle, CheckCircle, ExternalLink, Clock, XCircle } from 'lucide-react'

export default function BrokenLinkScannerPage() {
  return (
    <SEOToolLayout
      toolId="broken-link-scanner"
      toolName="Broken Link Scanner"
      toolDescription="Find and identify broken links on your website that hurt SEO and user experience."
    >
      {/* Results will be displayed here */}
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-primary" />
              <span>Broken Link Analysis</span>
            </CardTitle>
            <CardDescription>
              Comprehensive scan of all internal and external links on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">12</div>
                <div className="text-sm text-red-600">Broken Links</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">1,247</div>
                <div className="text-sm text-green-600">Working Links</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">8</div>
                <div className="text-sm text-yellow-600">Redirects</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">99.0%</div>
                <div className="text-sm text-blue-600">Link Health</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Critical Broken Links</span>
            </CardTitle>
            <CardDescription>
              Links returning 404 errors that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  url: "/products/old-product-page",
                  status: 404,
                  type: "Internal",
                  foundOn: "/products/",
                  lastChecked: "2 hours ago",
                  impact: "High"
                },
                {
                  url: "/blog/removed-article",
                  status: 404,
                  type: "Internal",
                  foundOn: "/blog/",
                  lastChecked: "1 hour ago",
                  impact: "Medium"
                },
                {
                  url: "https://external-site.com/dead-link",
                  status: 404,
                  type: "External",
                  foundOn: "/resources/",
                  lastChecked: "30 minutes ago",
                  impact: "Low"
                },
                {
                  url: "/services/discontinued-service",
                  status: 404,
                  type: "Internal",
                  foundOn: "/services/",
                  lastChecked: "45 minutes ago",
                  impact: "High"
                }
              ].map((link, index) => (
                <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <ExternalLink className="h-4 w-4 text-red-600" />
                        <span className="font-mono text-sm break-all">{link.url}</span>
                        <Badge variant="destructive">404</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Found on: <span className="font-medium">{link.foundOn}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={link.impact === 'High' ? 'destructive' : link.impact === 'Medium' ? 'secondary' : 'outline'}>
                        {link.impact} Impact
                      </Badge>
                      <Badge variant="outline">{link.type}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Last checked: {link.lastChecked}</span>
                    <span>Status: {link.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Redirects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-600">
              <Clock className="h-5 w-5" />
              <span>Redirects Found</span>
            </CardTitle>
            <CardDescription>
              Links that redirect to other pages (should be reviewed for optimization)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  from: "/old-page",
                  to: "/new-page",
                  status: 301,
                  type: "Permanent",
                  foundOn: "/navigation/"
                },
                {
                  from: "/temporary-redirect",
                  to: "/maintenance",
                  status: 302,
                  type: "Temporary",
                  foundOn: "/home/"
                },
                {
                  from: "/legacy-url",
                  to: "/updated-url",
                  status: 301,
                  type: "Permanent",
                  foundOn: "/sitemap/"
                }
              ].map((redirect, index) => (
                <div key={index} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{redirect.from}</div>
                      <div className="text-xs text-muted-foreground">
                        → {redirect.to}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{redirect.status}</Badge>
                      <Badge variant="secondary">{redirect.type}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Link Health Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Link Health Summary</CardTitle>
            <CardDescription>
              Overall assessment of your website's link structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Internal Links</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Working Links:</span>
                    <span className="text-green-600 font-medium">1,156</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Broken Links:</span>
                    <span className="text-red-600 font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Redirects:</span>
                    <span className="text-yellow-600 font-medium">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Score:</span>
                    <span className="text-green-600 font-medium">99.3%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">External Links</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Working Links:</span>
                    <span className="text-green-600 font-medium">91</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Broken Links:</span>
                    <span className="text-red-600 font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Redirects:</span>
                    <span className="text-yellow-600 font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Score:</span>
                    <span className="text-green-600 font-medium">95.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Fix Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Fix High-Impact Broken Links:</strong> Prioritize fixing the 4 high-impact broken internal links as they significantly affect user experience and SEO.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Link className="h-4 w-4" />
                <AlertDescription>
                  <strong>Update Internal Links:</strong> Replace broken internal links with working alternatives or implement proper 301 redirects.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  <strong>Review External Links:</strong> Check external links regularly and replace broken ones with authoritative alternatives.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Optimize Redirects:</strong> Review temporary redirects and convert them to permanent redirects where appropriate.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>
              Prioritized list of tasks to improve your link health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  task: "Fix broken internal link: /products/old-product-page",
                  priority: "High",
                  effort: "Low",
                  impact: "High"
                },
                {
                  task: "Update navigation menu to remove dead links",
                  priority: "High",
                  effort: "Medium",
                  impact: "High"
                },
                {
                  task: "Replace broken external link in resources section",
                  priority: "Medium",
                  effort: "Low",
                  impact: "Medium"
                },
                {
                  task: "Implement 301 redirect for /services/discontinued-service",
                  priority: "High",
                  effort: "Low",
                  impact: "High"
                },
                {
                  task: "Review and update sitemap to remove broken links",
                  priority: "Medium",
                  effort: "Medium",
                  impact: "Medium"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.task}</div>
                    <div className="text-sm text-muted-foreground">
                      Effort: {item.effort} • Impact: {item.impact}
                    </div>
                  </div>
                  <Badge variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'secondary' : 'outline'}>
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}
