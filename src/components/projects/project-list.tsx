"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { UpgradeModal } from '@/components/dashboard/upgrade-modal'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Globe, 
  Calendar,
  Building,
  Phone,
  Mail,
  MapPin,
  Lock
} from 'lucide-react'

interface Project {
  _id: string
  projectName: string
  title: string
  websiteURL: string
  email: string
  category: string
  companyName: string
  phone: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  createdAt: string
  address: {
    city: string
    state: string
    country: string
  }
}

interface UsageStats {
  plan: string
  limits: {
    projects: number
    submissions: number
    seoTools: number
    backlinks: number
    reports: number
  }
  usage: {
    projects: number
    submissions: number
    seoTools: number
    backlinks: number
    reports: number
  }
  isAtLimit: {
    projects: boolean
    submissions: boolean
    seoTools: boolean
    backlinks: boolean
    reports: boolean
  }
}

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      
      if (response.ok) {
        setProjects(data.projects)
      } else {
        showToast({
          title: 'Error',
          description: 'Failed to fetch projects',
          variant: 'destructive'
        })
      }
    } catch {
      showToast({
        title: 'Error',
        description: 'Network error while fetching projects',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  const fetchUsageStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/usage')
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data)
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
    fetchUsageStats()
  }, [fetchProjects, fetchUsageStats])

  const handleNewProject = () => {
    if (usageStats?.isAtLimit.projects) {
      setShowUpgradeModal(true)
    } else {
      router.push('/dashboard/projects/new')
    }
  }

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        showToast({
          title: 'Project Deleted',
          description: data.message || `"${projectName}" has been deleted successfully.`,
          variant: 'success'
        })
        fetchProjects() // Refresh the list
        fetchUsageStats() // Refresh usage stats
      } else {
        showToast({
          title: 'Error',
          description: data.message || data.error || 'Failed to delete project',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Delete project error:', error)
      showToast({
        title: 'Error',
        description: 'Network error while deleting project. Please check your connection and try again.',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-purple-100 text-purple-800'
      case 'ecommerce': return 'bg-blue-100 text-blue-800'
      case 'blog': return 'bg-green-100 text-green-800'
      case 'portfolio': return 'bg-orange-100 text-orange-800'
      case 'news': return 'bg-red-100 text-red-800'
      case 'education': return 'bg-indigo-100 text-indigo-800'
      case 'healthcare': return 'bg-pink-100 text-pink-800'
      case 'technology': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your SEO projects and track their performance
          </p>
        </div>
        <Button 
          onClick={handleNewProject}
          disabled={usageStats?.isAtLimit.projects}
          variant={usageStats?.isAtLimit.projects ? "outline" : "default"}
        >
          {usageStats?.isAtLimit.projects ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Project Limit Reached
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </>
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first project'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={handleNewProject}
                disabled={usageStats?.isAtLimit.projects}
                variant={usageStats?.isAtLimit.projects ? "outline" : "default"}
              >
                {usageStats?.isAtLimit.projects ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Project Limit Reached
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.projectName}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.title}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Company Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{project.companyName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className={getCategoryColor(project.category)}>
                      {project.category}
                    </Badge>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={project.websiteURL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate"
                    >
                      {project.websiteURL}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{project.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{project.phone}</span>
                  </div>
                  {project.address && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {project.address.city}, {project.address.state}, {project.address.country}
                      </span>
                    </div>
                  )}
                </div>

                {/* Created Date */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/projects/${project._id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(project._id, project.projectName)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {projects.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-sm text-muted-foreground">Total Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'draft').length}
                </div>
                <div className="text-sm text-muted-foreground">Draft</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={usageStats?.plan || 'free'}
        limitType="projects"
        currentUsage={usageStats?.usage.projects || 0}
      />
    </div>
  )
}
