"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { 
  Search, 
  BarChart3, 
  Link, 
  Map, 
  ExternalLink, 
  TrendingUp, 
  Gauge, 
  Smartphone, 
  Users, 
  CheckCircle, 
  Code, 
  Image, 
  FileText,
  Zap,
  Lock
} from 'lucide-react'

interface SEOTool {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'analysis' | 'research' | 'technical' | 'content'
  isAvailable: boolean
  isPremium: boolean
}

interface UsageStats {
  plan: string
  limits: {
    seoTools: number | 'unlimited'
  }
  usage: {
    seoTools: number
  }
  isAtLimit: {
    seoTools: boolean
  }
}

const seoTools: SEOTool[] = [
  {
    id: 'meta-tag-analyzer',
    name: 'Meta Tag Analyzer',
    description: 'Analyze meta titles, descriptions, and other meta tags for SEO optimization',
    icon: Search,
    category: 'analysis',
    isAvailable: true,
    isPremium: false
  },
  {
    id: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    description: 'Check keyword density and distribution across your content',
    icon: BarChart3,
    category: 'analysis',
    isAvailable: true,
    isPremium: false
  },
  {
    id: 'keyword-researcher',
    name: 'Keyword Researcher',
    description: 'Research and discover high-value keywords for your content',
    icon: TrendingUp,
    category: 'research',
    isAvailable: true,
    isPremium: true
  },
  {
    id: 'broken-link-scanner',
    name: 'Broken Link Scanner',
    description: 'Find and identify broken links on your website',
    icon: Link,
    category: 'technical',
    isAvailable: true,
    isPremium: false
  },
  {
    id: 'sitemap-robots-checker',
    name: 'Sitemap & Robots Checker',
    description: 'Validate your sitemap and robots.txt files',
    icon: Map,
    category: 'technical',
    isAvailable: true,
    isPremium: false
  },
  {
    id: 'backlink-scanner',
    name: 'Backlink Scanner',
    description: 'Analyze backlinks pointing to your website',
    icon: ExternalLink,
    category: 'research',
    isAvailable: true,
    isPremium: true
  },
  {
    id: 'keyword-tracker',
    name: 'Keyword Tracker',
    description: 'Track keyword rankings over time',
    icon: TrendingUp,
    category: 'research',
    isAvailable: true,
    isPremium: true
  },
  {
    id: 'page-speed-analyzer',
    name: 'Page Speed Analyzer',
    description: 'Analyze page loading speed and performance metrics',
    icon: Gauge,
    category: 'technical',
    isAvailable: true,
    isPremium: false
  },
  {
    id: 'mobile-checker',
    name: 'Mobile Checker',
    description: 'Check mobile-friendliness and responsive design',
    icon: Smartphone,
    category: 'technical',
    isAvailable: true,
    isPremium: false
  },
  {
    id: 'competitor-analyzer',
    name: 'Competitor Analyzer',
    description: 'Analyze competitor websites and strategies',
    icon: Users,
    category: 'research',
    isAvailable: true,
    isPremium: true
  },
  {
    id: 'technical-seo-auditor',
    name: 'Technical SEO Auditor',
    description: 'Comprehensive technical SEO audit of your website',
    icon: CheckCircle,
    category: 'technical',
    isAvailable: true,
    isPremium: true
  },
  {
    id: 'schema-validator',
    name: 'Schema Validator',
    description: 'Validate structured data and schema markup',
    icon: Code,
    category: 'technical',
    isAvailable: true,
    isPremium: false
  },
  {
    id: 'alt-text-checker',
    name: 'Alt Text Checker',
    description: 'Check for missing or inadequate alt text on images',
    icon: Image,
    category: 'content',
    isAvailable: true,
    isPremium: false
  },
  {
    id: 'canonical-checker',
    name: 'Canonical Checker',
    description: 'Check canonical URLs and duplicate content issues',
    icon: FileText,
    category: 'technical',
    isAvailable: true,
    isPremium: false
  }
]

const categoryColors = {
  analysis: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  research: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  technical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  content: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
}

export function SEOToolsGrid() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/dashboard/usage', {
        credentials: 'include' // Include cookies for authentication
      })
      const data = await response.json()
      
      if (response.ok) {
        setUsageStats(data)
      }
    } catch {
      // Handle error silently for now
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/dashboard/pricing')
  }

  const handleToolClick = (tool: SEOTool) => {
    if (!usageStats) return

    // Check if user has reached their limit
    if (usageStats.isAtLimit.seoTools && usageStats.plan === 'free') {
      showToast({
        title: 'Usage Limit Reached',
        description: 'You have reached your SEO tools limit. Upgrade your plan to continue.',
        variant: 'destructive'
      })
      // Redirect to pricing page
      setTimeout(() => {
        router.push('/dashboard/pricing')
      }, 2000)
      return
    }

    // Check if tool is premium and user is on free plan
    if (tool.isPremium && usageStats.plan === 'free') {
      showToast({
        title: 'Premium Tool',
        description: 'This tool is available for Pro and higher plans. Redirecting to pricing...',
        variant: 'destructive'
      })
      // Redirect to pricing page
      setTimeout(() => {
        router.push('/dashboard/pricing')
      }, 2000)
      return
    }

    // Navigate to tool
    window.location.href = `/dashboard/seo-tools/${tool.id}`
  }

  const getAvailableTools = () => {
    if (!usageStats) return seoTools

    if (usageStats.plan === 'free') {
      return seoTools.filter(tool => !tool.isPremium)
    }

    return seoTools
  }

  const availableTools = getAvailableTools()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Free Plan Notice */}
      {usageStats?.plan === 'free' && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Free Plan Active</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You have access to {availableTools.length} SEO tools. Upgrade to Pro for access to all 14 tools.
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={handleUpgrade}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTools.map((tool) => {
          const IconComponent = tool.icon
          const isDisabled = usageStats?.isAtLimit.seoTools && usageStats?.plan === 'free'
          
          return (
            <Card 
              key={tool.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              onClick={() => handleToolClick(tool)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <Badge className={categoryColors[tool.category]}>
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                  {tool.isPremium && usageStats?.plan !== 'free' && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <CardDescription className="mt-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  disabled={isDisabled}
                  variant={isDisabled ? 'outline' : 'default'}
                >
                  {isDisabled ? 'Limit Reached' : 'Run Analysis'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Premium Tools Preview */}
      {usageStats?.plan === 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Premium Tools</CardTitle>
            <CardDescription>
              Unlock advanced SEO tools with Pro, Business, or Enterprise plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {seoTools.filter(tool => tool.isPremium).map((tool) => {
                const IconComponent = tool.icon
                return (
                  <div key={tool.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{tool.name}</p>
                      <Badge variant="outline" className="text-xs">
                        Premium
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
            <Button className="w-full mt-4" onClick={handleUpgrade}>
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
