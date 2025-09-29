"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Search, 
  Eye, 
  Trash2, 
  FolderOpen,
  User,
  Calendar,
  Globe,
  Edit
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Project {
  _id: string
  projectName: string
  websiteURL?: string
  companyName?: string
  category: string
  status: string
  createdAt: string
  updatedAt: string
  userId: string
  user?: {
    username: string
    email: string
  }
}

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { showToast } = useToast()

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/projects?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      showToast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, showToast])

  const handleViewProject = (projectId: string) => {
    window.open(`/dashboard/projects/${projectId}`, '_blank')
  }

  const handleEditProject = (projectId: string) => {
    window.open(`/dashboard/projects/${projectId}/edit`, '_blank')
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        showToast({
          title: 'Success',
          description: 'Project deleted successfully',
          variant: 'default'
        })
        fetchProjects() // Refresh the list
      } else {
        showToast({
          title: 'Error',
          description: data.error || 'Failed to delete project',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      showToast({
        title: 'Error',
        description: 'Network error while deleting project. Please check your connection and try again.',
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    fetchProjects()
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchProjects, 60000)
    
    return () => clearInterval(interval)
  }, [fetchProjects])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'inactive':
        return 'bg-muted text-muted-foreground'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getCategoryColor = (category: string) => {
    if (!category) {
      return 'bg-muted text-muted-foreground'
    }
    
    switch (category) {
      case 'Business & Industry': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'Technology & IT': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300'
      case 'E-Commerce & Retail': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'Marketing & Advertising': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300'
      case 'Finance & Investment': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'Health & Fitness': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'Education & Training': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
      case 'Home & Lifestyle': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'Startups & Innovation': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300'
      case 'Travel & Tourism': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300'
      case 'Food & Beverages': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
      case 'Automobile & Transport': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300'
      case 'Real Estate': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
      case 'Religion & Spirituality': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'Arts & Entertainment': return 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/20 dark:text-fuchsia-300'
      case 'Jobs & Career': return 'bg-lime-100 text-lime-800 dark:bg-lime-900/20 dark:text-lime-300'
      case 'Beauty & Fashion': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300'
      case 'Science & Research': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300'
      case 'Environment & Sustainability': return 'bg-green-200 text-green-900 dark:bg-green-800/20 dark:text-green-200'
      case 'Government & Politics': return 'bg-gray-200 text-gray-900 dark:bg-gray-800/20 dark:text-gray-200'
      case 'Telecommunication': return 'bg-blue-200 text-blue-900 dark:bg-blue-800/20 dark:text-blue-200'
      case 'Legal & Law': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-300'
      case 'Events & Conferences': return 'bg-purple-200 text-purple-900 dark:bg-purple-800/20 dark:text-purple-200'
      case 'Nonprofits & NGOs': return 'bg-teal-200 text-teal-900 dark:bg-teal-800/20 dark:text-teal-200'
      case 'Pets & Animals': return 'bg-orange-200 text-orange-900 dark:bg-orange-800/20 dark:text-orange-200'
      case 'Parenting & Family': return 'bg-pink-200 text-pink-900 dark:bg-pink-800/20 dark:text-pink-200'
      case 'Personal Blogs & Hobbies': return 'bg-indigo-200 text-indigo-900 dark:bg-indigo-800/20 dark:text-indigo-200'
      case 'Sports & Fitness': return 'bg-red-200 text-red-900 dark:bg-red-800/20 dark:text-red-200'
      case 'Health': return 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800/20 dark:text-emerald-200'
      case 'Media & News': return 'bg-slate-200 text-slate-900 dark:bg-slate-800/20 dark:text-slate-200'
      case 'Miscellaneous / General': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      // Legacy categories for backward compatibility
      case 'business': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'ecommerce': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'blog': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'portfolio': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'news': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'education': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
      case 'healthcare': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300'
      case 'technology': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300'
      default: 
        // Fallback to hash-based color for unknown categories
        const colors = [
          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
          'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
          'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
          'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
          'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300'
        ]
        const index = category.length % colors.length
        return colors[index]
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
        <p className="text-muted-foreground mt-2">Manage all projects across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>
                View and manage projects from all users
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button onClick={fetchProjects} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          <span>{project.projectName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.websiteURL ? (
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={project.websiteURL} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate max-w-32"
                            >
                              {project.websiteURL}
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No website</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(project.category)}>
                          {project.category || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{project.user?.username || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">
                              {project.user?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewProject(project._id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditProject(project._id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{project.projectName}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProject(project._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {projects.length === 0 && (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search criteria.' : 'No projects have been created yet.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
