"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'
import { Loader2, Settings, Crown, Eye, EyeOff } from 'lucide-react'

interface SeoTool {
  _id: string
  toolId: string
  name: string
  description: string
  category: 'analysis' | 'research' | 'technical' | 'content'
  isPremium: boolean
  isEnabled: boolean
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  recommendedFrequency: string
  order: number
}

const categoryColors = {
  analysis: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  research: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  technical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  content: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
}

export default function AdminSeoToolsPage() {
  const [tools, setTools] = useState<SeoTool[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchTools()
  }, [])

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/admin/seo-tools')
      const data = await response.json()
      
      if (response.ok) {
        setTools(data.tools)
      } else {
        showToast({ title: 'Error', description: 'Error fetching tools' })
      }
    } catch (error) {
      showToast({ title: 'Error', description: 'Error fetching tools' })
    } finally {
      setLoading(false)
    }
  }

  const updateTool = async (toolId: string, updates: Partial<SeoTool>) => {
    setUpdating(toolId)
    try {
      const response = await fetch('/api/admin/seo-tools', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolId, updates }),
      })

      if (response.ok) {
        setTools(prev => prev.map(tool => 
          tool.toolId === toolId ? { ...tool, ...updates } : tool
        ))
        showToast({ title: 'Success', description: 'Tool updated successfully' })
      } else {
        showToast({ title: 'Error', description: 'Error updating tool' })
      }
    } catch (error) {
      showToast({ title: 'Error', description: 'Error updating tool' })
    } finally {
      setUpdating(null)
    }
  }

  const toggleEnabled = (toolId: string, isEnabled: boolean) => {
    updateTool(toolId, { isEnabled })
  }

  const togglePremium = (toolId: string, isPremium: boolean) => {
    updateTool(toolId, { isPremium })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading SEO tools...</p>
        </div>
      </div>
    )
  }

  const enabledCount = tools.filter(t => t.isEnabled).length
  const premiumCount = tools.filter(t => t.isPremium).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SEO Tools Management</h1>
        <p className="text-muted-foreground">
          Manage SEO tools availability and premium status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{tools.length}</p>
                <p className="text-sm text-muted-foreground">Total Tools</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{enabledCount}</p>
                <p className="text-sm text-muted-foreground">Enabled Tools</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-600">{premiumCount}</p>
                <p className="text-sm text-muted-foreground">Premium Tools</p>
              </div>
              <Crown className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool._id} className={`${!tool.isEnabled ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  {tool.isPremium && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {tool.isEnabled ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={categoryColors[tool.category]}>
                  {tool.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {tool.difficulty}
                </Badge>
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enabled</span>
                  <Switch
                    checked={tool.isEnabled}
                    onCheckedChange={(checked) => toggleEnabled(tool.toolId, checked)}
                    disabled={updating === tool.toolId}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Premium</span>
                  <Switch
                    checked={tool.isPremium}
                    onCheckedChange={(checked) => togglePremium(tool.toolId, checked)}
                    disabled={updating === tool.toolId}
                  />
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Time: {tool.estimatedTime}</div>
                  <div>Frequency: {tool.recommendedFrequency}</div>
                  <div>Order: {tool.order}</div>
                </div>

                {updating === tool.toolId && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}