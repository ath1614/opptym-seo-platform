"use client"

import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, XCircle, Code, Globe, Zap, Shield, Settings } from 'lucide-react'

export default function TechnicalSEOAuditorPage() {
  return (
    <SEOToolLayout
      toolId="technical-seo-auditor"
      toolName="Technical SEO Auditor"
      toolDescription="Comprehensive technical SEO audit of your website to identify and fix technical issues affecting search rankings."
    >
      {/* Results will be displayed here */}
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Technical SEO Audit Results</span>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your website's technical SEO health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">87</div>
                <div className="text-sm text-green-600">Overall Score</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">8</div>
                <div className="text-sm text-red-600">Critical Issues</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">15</div>
                <div className="text-sm text-yellow-600">Warnings</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">23</div>
                <div className="text-sm text-blue-600">Recommendations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Critical Issues</span>
            </CardTitle>
            <CardDescription>
              Issues that need immediate attention as they significantly impact SEO performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  issue: "Missing SSL Certificate",
                  severity: "Critical",
                  impact: "High",
                  description: "Your website is not using HTTPS, which is a ranking factor and security requirement.",
                  fix: "Install and configure an SSL certificate to enable HTTPS for your entire website."
                },
                {
                  issue: "Slow Page Load Speed",
                  severity: "Critical",
                  impact: "High",
                  description: "Your homepage takes 4.2 seconds to load, which is above the recommended 3 seconds.",
                  fix: "Optimize images, enable compression, and consider using a CDN to improve loading speed."
                },
                {
                  issue: "Duplicate Meta Descriptions",
                  severity: "Critical",
                  impact: "Medium",
                  description: "12 pages have duplicate meta descriptions, which can confuse search engines.",
                  fix: "Create unique meta descriptions for each page that accurately describe the content."
                },
                {
                  issue: "Missing Alt Text on Images",
                  severity: "Critical",
                  impact: "Medium",
                  description: "23 images are missing alt text, which affects accessibility and image SEO.",
                  fix: "Add descriptive alt text to all images to improve accessibility and SEO."
                }
              ].map((issue, index) => (
                <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800">{issue.issue}</h4>
                      <p className="text-sm text-red-700 mt-1">{issue.description}</p>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Fix:</strong> {issue.fix}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">{issue.severity}</Badge>
                      <Badge variant="outline">{issue.impact} Impact</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Warnings</span>
            </CardTitle>
            <CardDescription>
              Issues that should be addressed to improve SEO performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  issue: "Missing Schema Markup",
                  severity: "Warning",
                  impact: "Medium",
                  description: "Your website lacks structured data markup, missing opportunities for rich snippets.",
                  affected: "All pages"
                },
                {
                  issue: "Non-www Redirect Not Set",
                  severity: "Warning",
                  impact: "Low",
                  description: "Both www and non-www versions of your site are accessible, which can cause duplicate content issues.",
                  affected: "Homepage"
                },
                {
                  issue: "Large Image Files",
                  severity: "Warning",
                  impact: "Medium",
                  description: "8 images are larger than 1MB, which can slow down page loading.",
                  affected: "8 images"
                },
                {
                  issue: "Missing Hreflang Tags",
                  severity: "Warning",
                  impact: "Low",
                  description: "No hreflang tags found, which may affect international SEO if you plan to expand globally.",
                  affected: "All pages"
                }
              ].map((warning, index) => (
                <div key={index} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800">{warning.issue}</h4>
                      <p className="text-sm text-yellow-700 mt-1">{warning.description}</p>
                      <p className="text-xs text-yellow-600 mt-1">Affected: {warning.affected}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{warning.severity}</Badge>
                      <Badge variant="outline">{warning.impact} Impact</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical SEO Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Technical SEO Checklist</span>
            </CardTitle>
            <CardDescription>
              Comprehensive checklist of technical SEO elements and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Site Structure</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">XML Sitemap</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Robots.txt</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm">HTTPS/SSL</span>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm">Canonical URLs</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Performance</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm">Page Speed</span>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Image Optimization</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">CSS Minification</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">JavaScript Minification</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Content & Meta</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Unique Title Tags</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm">Unique Meta Descriptions</span>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm">Alt Text on Images</span>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm">Schema Markup</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Mobile & Accessibility</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Mobile-Friendly</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Responsive Design</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Touch-Friendly</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm">Accessibility</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Performance Metrics</span>
            </CardTitle>
            <CardDescription>
              Key performance indicators affecting your SEO and user experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Core Web Vitals</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Largest Contentful Paint (LCP):</span>
                    <span className="font-medium text-red-600">4.2s (Poor)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>First Input Delay (FID):</span>
                    <span className="font-medium text-green-600">45ms (Good)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cumulative Layout Shift (CLS):</span>
                    <span className="font-medium text-green-600">0.05 (Good)</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Technical Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Page Size:</span>
                    <span className="font-medium text-yellow-600">2.1MB (Large)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Requests:</span>
                    <span className="font-medium text-green-600">45 (Good)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time to First Byte:</span>
                    <span className="font-medium text-yellow-600">800ms (Fair)</span>
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
              <span>Priority Action Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical Priority:</strong> Install SSL certificate and enable HTTPS immediately. This is a ranking factor and security requirement.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>High Priority:</strong> Optimize page loading speed. Your LCP of 4.2s is significantly above the recommended 2.5s threshold.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  <strong>Medium Priority:</strong> Fix duplicate meta descriptions and add alt text to images. These issues affect search engine understanding of your content.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <strong>Low Priority:</strong> Implement schema markup and optimize for Core Web Vitals to improve search visibility and user experience.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}
