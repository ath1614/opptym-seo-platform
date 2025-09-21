"use client"

import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Code, CheckCircle, AlertTriangle, XCircle, FileText, Globe, Tag, Database } from 'lucide-react'

export default function SchemaValidatorPage() {
  return (
    <SEOToolLayout
      toolId="schema-validator"
      toolName="Schema Validator"
      toolDescription="Validate structured data and schema markup to ensure proper implementation and rich snippet eligibility."
    >
      {/* Results will be displayed here */}
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-primary" />
              <span>Schema Markup Analysis</span>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your website's structured data implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-blue-600">Schema Types Found</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-green-600">Valid Schemas</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <div className="text-sm text-yellow-600">Warnings</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-sm text-red-600">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schema Types Found */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Schema Types Detected</span>
            </CardTitle>
            <CardDescription>
              Different types of structured data found on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: "Organization", status: "Valid", pages: 1, description: "Company information and contact details" },
                { type: "WebSite", status: "Valid", pages: 1, description: "Website search functionality" },
                { type: "BreadcrumbList", status: "Valid", pages: 15, description: "Navigation breadcrumbs" },
                { type: "Article", status: "Valid", pages: 23, description: "Blog post and article content" },
                { type: "Product", status: "Valid", pages: 8, description: "Product information and pricing" },
                { type: "FAQ", status: "Valid", pages: 3, description: "Frequently asked questions" },
                { type: "Review", status: "Valid", pages: 12, description: "Customer reviews and ratings" },
                { type: "LocalBusiness", status: "Valid", pages: 1, description: "Local business information" },
                { type: "Event", status: "Warning", pages: 2, description: "Event details and scheduling" },
                { type: "Person", status: "Warning", pages: 5, description: "Author and team member profiles" },
                { type: "VideoObject", status: "Warning", pages: 1, description: "Video content metadata" },
                { type: "Recipe", status: "Error", pages: 1, description: "Recipe information and instructions" }
              ].map((schema, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{schema.type}</h4>
                    <Badge variant={
                      schema.status === 'Valid' ? 'default' : 
                      schema.status === 'Warning' ? 'secondary' : 
                      'destructive'
                    }>
                      {schema.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{schema.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Found on {schema.pages} page{schema.pages !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schema Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Schema Errors</span>
            </CardTitle>
            <CardDescription>
              Critical issues that need to be fixed for proper schema validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: "Recipe",
                  page: "/recipes/chocolate-cake",
                  error: "Missing required property 'name'",
                  severity: "Error",
                  description: "The Recipe schema is missing the required 'name' property, which is essential for recipe identification.",
                  fix: "Add the 'name' property to your Recipe schema markup."
                }
              ].map((error, index) => (
                <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800">{error.type} Schema Error</h4>
                      <p className="text-sm text-red-700 mt-1">
                        <strong>Page:</strong> {error.page}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        <strong>Error:</strong> {error.error}
                      </p>
                      <p className="text-sm text-red-700 mt-1">{error.description}</p>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Fix:</strong> {error.fix}
                      </p>
                    </div>
                    <Badge variant="destructive">{error.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schema Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Schema Warnings</span>
            </CardTitle>
            <CardDescription>
              Issues that should be addressed to improve schema quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  type: "Event",
                  page: "/events/webinar-seo-basics",
                  warning: "Missing 'startDate' property",
                  severity: "Warning",
                  description: "The Event schema is missing the 'startDate' property, which is recommended for better search engine understanding.",
                  fix: "Add the 'startDate' property to your Event schema markup."
                },
                {
                  type: "Person",
                  page: "/team/john-doe",
                  warning: "Missing 'jobTitle' property",
                  severity: "Warning",
                  description: "The Person schema is missing the 'jobTitle' property, which helps search engines understand the person's role.",
                  fix: "Add the 'jobTitle' property to your Person schema markup."
                },
                {
                  type: "VideoObject",
                  page: "/videos/seo-tutorial",
                  warning: "Missing 'duration' property",
                  severity: "Warning",
                  description: "The VideoObject schema is missing the 'duration' property, which is recommended for video content.",
                  fix: "Add the 'duration' property to your VideoObject schema markup."
                }
              ].map((warning, index) => (
                <div key={index} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800">{warning.type} Schema Warning</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        <strong>Page:</strong> {warning.page}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        <strong>Warning:</strong> {warning.warning}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">{warning.description}</p>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Fix:</strong> {warning.fix}
                      </p>
                    </div>
                    <Badge variant="secondary">{warning.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rich Snippet Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5" />
              <span>Rich Snippet Opportunities</span>
            </CardTitle>
            <CardDescription>
              Potential rich snippets that could appear in search results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: "FAQ",
                  pages: 3,
                  status: "Eligible",
                  description: "FAQ rich snippets can appear in search results, providing quick answers to common questions.",
                  example: "Your FAQ pages are properly structured and eligible for rich snippets."
                },
                {
                  type: "Product",
                  pages: 8,
                  status: "Eligible",
                  description: "Product rich snippets can show price, availability, and ratings in search results.",
                  example: "Your product pages have proper schema markup and are eligible for rich snippets."
                },
                {
                  type: "Article",
                  pages: 23,
                  status: "Eligible",
                  description: "Article rich snippets can show publication date, author, and article summary.",
                  example: "Your blog posts have proper article schema and are eligible for rich snippets."
                },
                {
                  type: "Review",
                  pages: 12,
                  status: "Eligible",
                  description: "Review rich snippets can show star ratings and review counts in search results.",
                  example: "Your review pages have proper schema markup and are eligible for rich snippets."
                },
                {
                  type: "LocalBusiness",
                  pages: 1,
                  status: "Eligible",
                  description: "Local business rich snippets can show contact information, hours, and location.",
                  example: "Your business page has proper local business schema and is eligible for rich snippets."
                }
              ].map((snippet, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{snippet.type} Rich Snippets</h4>
                      <p className="text-sm text-muted-foreground mt-1">{snippet.description}</p>
                      <p className="text-sm text-green-600 mt-2">{snippet.example}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">{snippet.status}</Badge>
                      <Badge variant="outline">{snippet.pages} pages</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schema Implementation Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Schema Implementation Guide</span>
            </CardTitle>
            <CardDescription>
              Best practices and recommendations for implementing schema markup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Implementation Methods</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span>JSON-LD</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">Recommended</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span>Microdata</span>
                      <Badge variant="outline">Alternative</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span>RDFa</span>
                      <Badge variant="outline">Alternative</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Validation Tools</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span>Google Rich Results Test</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">Free</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span>Schema.org Validator</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">Free</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span>Structured Data Testing Tool</span>
                      <Badge variant="outline">Free</Badge>
                    </div>
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
              <span>Schema Optimization Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Fix Critical Errors:</strong> Address the Recipe schema error by adding the missing 'name' property. This will ensure proper validation and rich snippet eligibility.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Address Warnings:</strong> Fix the 3 schema warnings by adding missing recommended properties (startDate, jobTitle, duration) to improve schema quality.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Tag className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rich Snippet Optimization:</strong> Your schemas are well-implemented and eligible for rich snippets. Monitor Google Search Console for rich snippet performance.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  <strong>Schema Expansion:</strong> Consider adding more schema types like HowTo, Course, or SoftwareApplication to capture additional rich snippet opportunities.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}
