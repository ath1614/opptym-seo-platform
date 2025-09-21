"use client"

import { SEOToolLayout } from '@/components/seo-tools/seo-tool-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Image, CheckCircle, AlertTriangle, XCircle, Eye, FileText, Search, Zap } from 'lucide-react'

export default function AltTextCheckerPage() {
  return (
    <SEOToolLayout
      toolId="alt-text-checker"
      toolName="Alt Text Checker"
      toolDescription="Check for missing or inadequate alt text on images to improve accessibility and SEO performance."
    >
      {/* Results will be displayed here */}
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5 text-primary" />
              <span>Alt Text Analysis</span>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of image alt text implementation across your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-blue-600">Total Images</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">142</div>
                <div className="text-sm text-green-600">With Alt Text</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">14</div>
                <div className="text-sm text-red-600">Missing Alt Text</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">91%</div>
                <div className="text-sm text-purple-600">Alt Text Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missing Alt Text */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Images Missing Alt Text</span>
            </CardTitle>
            <CardDescription>
              Images that need alt text for accessibility and SEO compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  image: "/images/hero-banner.jpg",
                  page: "/",
                  size: "1200x600",
                  type: "Hero Image",
                  description: "Main banner image on homepage",
                  suggestedAlt: "Professional SEO tools dashboard showing analytics and reports"
                },
                {
                  image: "/images/product-screenshot.png",
                  page: "/products/seo-analyzer",
                  size: "800x600",
                  type: "Product Image",
                  description: "Screenshot of the SEO analyzer tool interface",
                  suggestedAlt: "SEO analyzer tool interface showing website analysis results and recommendations"
                },
                {
                  image: "/images/team-photo.jpg",
                  page: "/about",
                  size: "1000x500",
                  type: "Team Photo",
                  description: "Group photo of the development team",
                  suggestedAlt: "Our development team working together on SEO optimization projects"
                },
                {
                  image: "/images/feature-icon.svg",
                  page: "/features",
                  size: "64x64",
                  type: "Icon",
                  description: "Icon representing the keyword research feature",
                  suggestedAlt: "Keyword research icon showing search and analysis tools"
                }
              ].map((image, index) => (
                <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800">{image.image}</h4>
                      <p className="text-sm text-red-700 mt-1">
                        <strong>Page:</strong> {image.page}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        <strong>Type:</strong> {image.type} • <strong>Size:</strong> {image.size}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        <strong>Description:</strong> {image.description}
                      </p>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Suggested Alt Text:</strong> {image.suggestedAlt}
                      </p>
                    </div>
                    <Badge variant="destructive">Missing Alt</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alt Text Quality Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Alt Text Quality Issues</span>
            </CardTitle>
            <CardDescription>
              Images with alt text that could be improved for better accessibility and SEO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  image: "/images/chart.png",
                  page: "/analytics",
                  currentAlt: "chart",
                  issue: "Too generic",
                  description: "The alt text 'chart' is too generic and doesn't describe what the chart shows.",
                  suggestedAlt: "Bar chart showing monthly SEO performance metrics with 15% improvement in organic traffic"
                },
                {
                  image: "/images/logo.png",
                  page: "/",
                  currentAlt: "logo",
                  issue: "Too generic",
                  description: "The alt text 'logo' is too generic and doesn't include the company name.",
                  suggestedAlt: "Opptym SEO Platform logo"
                },
                {
                  image: "/images/button.png",
                  page: "/signup",
                  currentAlt: "Click here to sign up for our service and get started with SEO optimization tools",
                  issue: "Too long",
                  description: "The alt text is too long and includes unnecessary promotional language.",
                  suggestedAlt: "Sign up button"
                },
                {
                  image: "/images/decorative-border.jpg",
                  page: "/blog",
                  currentAlt: "Decorative border image showing geometric patterns and modern design elements",
                  issue: "Unnecessary detail",
                  description: "This appears to be a decorative image that should have empty alt text.",
                  suggestedAlt: ""
                }
              ].map((image, index) => (
                <div key={index} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800">{image.image}</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        <strong>Page:</strong> {image.page}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        <strong>Current Alt:</strong> "{image.currentAlt}"
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        <strong>Issue:</strong> {image.issue}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">{image.description}</p>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Suggested Alt:</strong> "{image.suggestedAlt}"
                      </p>
                    </div>
                    <Badge variant="secondary">Needs Improvement</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alt Text Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Alt Text Best Practices</span>
            </CardTitle>
            <CardDescription>
              Guidelines for writing effective alt text that improves accessibility and SEO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Do's</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Be descriptive and specific about what the image shows</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Keep alt text concise (under 125 characters)</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Include relevant keywords naturally</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Use empty alt="" for decorative images</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Describe the function, not just the appearance</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Don'ts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Don't start with "Image of" or "Picture of"</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Don't use alt text for promotional content</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Don't repeat information from surrounding text</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Don't use file names as alt text</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>Don't make alt text too long or verbose</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image SEO Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Image SEO Analysis</span>
            </CardTitle>
            <CardDescription>
              Additional SEO factors for images beyond alt text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Image Optimization</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Optimized File Sizes:</span>
                    <span className="font-medium text-green-600">142/156 (91%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proper File Formats:</span>
                    <span className="font-medium text-green-600">156/156 (100%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Responsive Images:</span>
                    <span className="font-medium text-yellow-600">89/156 (57%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lazy Loading:</span>
                    <span className="font-medium text-green-600">134/156 (86%)</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Image Metadata</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Title Attributes:</span>
                    <span className="font-medium text-yellow-600">67/156 (43%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Caption Text:</span>
                    <span className="font-medium text-green-600">89/156 (57%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Image Sitemaps:</span>
                    <span className="font-medium text-green-600">156/156 (100%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Structured Data:</span>
                    <span className="font-medium text-yellow-600">45/156 (29%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Accessibility Impact</span>
            </CardTitle>
            <CardDescription>
              How your alt text implementation affects website accessibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">91%</div>
                  <div className="text-sm text-green-600">WCAG Compliance</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">142</div>
                  <div className="text-sm text-blue-600">Accessible Images</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">14</div>
                  <div className="text-sm text-red-600">Accessibility Issues</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Accessibility Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Screen readers can describe images to visually impaired users</li>
                  <li>• Images load with descriptive text when images fail to load</li>
                  <li>• Better user experience for users with slow internet connections</li>
                  <li>• Compliance with WCAG 2.1 accessibility guidelines</li>
                  <li>• Improved SEO through better content understanding</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Alt Text Optimization Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Fix Missing Alt Text:</strong> Add descriptive alt text to the 14 images that are missing it. This is critical for accessibility and SEO compliance.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Improve Alt Text Quality:</strong> Update 4 images with generic or poor alt text to be more descriptive and specific about what the image shows.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Image className="h-4 w-4" />
                <AlertDescription>
                  <strong>Image Optimization:</strong> Improve responsive image implementation (currently 57%) and add more title attributes to enhance image SEO.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Accessibility Compliance:</strong> Your alt text coverage is good at 91%, but fixing the remaining issues will ensure full WCAG compliance and better user experience.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </SEOToolLayout>
  )
}
