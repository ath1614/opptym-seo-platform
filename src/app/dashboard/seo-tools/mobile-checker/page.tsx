"use client"

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Smartphone, CheckCircle, AlertTriangle, XCircle, Eye, Hand, Wifi, Battery } from 'lucide-react'

export default function MobileCheckerPage() {
  return (
    <SEOToolLayout
      toolId="mobile-checker"
      toolName="Mobile Checker"
      toolDescription="Check mobile-friendliness and responsive design to ensure optimal mobile user experience."
    >
      {/* Results will be displayed here */}
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span>Mobile-Friendliness Analysis</span>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your website's mobile optimization and user experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-green-600">Mobile-Friendly</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">92</div>
                <div className="text-sm text-blue-600">Mobile Score</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1.2s</div>
                <div className="text-sm text-purple-600">Load Time</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-sm text-orange-600">Issues Found</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Usability Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Mobile Usability Issues</span>
            </CardTitle>
            <CardDescription>
              Issues that may affect mobile user experience and search rankings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  issue: "Text too small to read",
                  severity: "Medium",
                  affected: "2 pages",
                  description: "Some text elements are smaller than 12px, making them difficult to read on mobile devices.",
                  recommendation: "Increase font size to at least 12px for better readability."
                },
                {
                  issue: "Clickable elements too close together",
                  severity: "Low",
                  affected: "1 page",
                  description: "Some buttons and links are positioned too close together, making them hard to tap accurately.",
                  recommendation: "Add more spacing between clickable elements (minimum 8px)."
                },
                {
                  issue: "Content wider than screen",
                  severity: "Low",
                  affected: "1 page",
                  description: "Some content extends beyond the viewport width, requiring horizontal scrolling.",
                  recommendation: "Ensure all content fits within the viewport width."
                }
              ].map((issue, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{issue.issue}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </p>
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

        {/* Responsive Design Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Responsive Design Analysis</span>
            </CardTitle>
            <CardDescription>
              How your website adapts to different screen sizes and devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Viewport Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Viewport Meta Tag:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Width Setting:</span>
                    <span className="font-mono">device-width</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Initial Scale:</span>
                    <span className="font-mono">1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User Scalable:</span>
                    <span className="font-mono">Yes</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Breakpoint Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Mobile (320px-768px):</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Optimized</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tablet (768px-1024px):</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Optimized</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Desktop (1024px+):</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Optimized</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Large Desktop (1440px+):</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Optimized</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Touch Interface Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hand className="h-5 w-5" />
              <span>Touch Interface Analysis</span>
            </CardTitle>
            <CardDescription>
              Analysis of touch-friendly elements and interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-green-600">Touch-Friendly Elements</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">44px</div>
                  <div className="text-sm text-blue-600">Avg. Touch Target Size</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">2</div>
                  <div className="text-sm text-purple-600">Small Touch Targets</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Touch Target Analysis</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Buttons (44px+):</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Navigation Links (44px+):</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm">Small Links (32px):</span>
                    <Badge variant="secondary">Needs Improvement</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Form Elements (44px+):</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance on Mobile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Battery className="h-5 w-5" />
              <span>Mobile Performance</span>
            </CardTitle>
            <CardDescription>
              How your website performs on mobile devices and slower connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Loading Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>First Contentful Paint:</span>
                    <span className="font-medium text-green-600">1.2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Largest Contentful Paint:</span>
                    <span className="font-medium text-green-600">2.1s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time to Interactive:</span>
                    <span className="font-medium text-green-600">2.8s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cumulative Layout Shift:</span>
                    <span className="font-medium text-green-600">0.05</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Resource Optimization</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Images Optimized:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Yes</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>CSS Minified:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Yes</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>JavaScript Minified:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Yes</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Gzip Compression:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile SEO Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="h-5 w-5" />
              <span>Mobile SEO Factors</span>
            </CardTitle>
            <CardDescription>
              Mobile-specific SEO elements and their implementation status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Mobile-First Indexing:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Responsive Design:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Implemented</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Touch-Friendly Navigation:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Optimized</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Fast Loading Speed:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Optimized</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Readable Text:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Proper Viewport:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Configured</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">No Flash Content:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">None</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Mobile-Friendly URLs:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Optimized</Badge>
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
              <span>Mobile Optimization Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  <strong>Excellent Mobile Performance:</strong> Your website is mobile-friendly with a score of 92/100. Only minor improvements are needed.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Hand className="h-4 w-4" />
                <AlertDescription>
                  <strong>Improve Touch Targets:</strong> Increase the size of 2 small touch targets to at least 44px for better usability.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Text Readability:</strong> Increase font size on 2 pages to at least 12px for better mobile readability.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Battery className="h-4 w-4" />
                <AlertDescription>
                  <strong>Performance Optimization:</strong> Your mobile performance is excellent. Continue monitoring and optimizing for even better results.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}
